import { test, expect } from '@playwright/test';
import { EventsPage } from '../../pages/orientationEvents/eventAdminPage';
import { cancellationConfirmation, verifyAttendee } from '../../utils/OrientationHelpers/eventRegistrationHelpers';
import { studentOrientationEligibilityCheck, clickRequiredEvent, fillRegistrationDetailsByAdmin } from '../../utils/OrientationHelpers/eventAdminHelpers';
import { loginSF } from '../../utils/auth';
import { existsSync } from 'fs';
import { EventRegistrationPage } from '../../pages/orientationEvents/eventRegistrationPage';
import { userLoginByPassMFA } from '../../utils/BuLogin';
import { AttendeePage } from '../../pages/orientationEvents/attendeeLinkPage';
import { readExcelData } from '../../utils/excelReader'; // ← your excel reader

test.use({ storageState: existsSync('state.json') ? 'state.json' : undefined });

// ✅ Load Excel data once at the top (row where execute = 'yes')
const testDataRows = readExcelData('orientation_test_data.xlsx', 'Test Data');
const registerData = testDataRows[0]; // first matching row

test.describe('Admin Orientation Event Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let suiteFailed = false;

  test.beforeEach(async ({ }, testInfo) => {
    if (suiteFailed) testInfo.skip(true, 'Skipping due to previous test failure');
  });

  test.afterEach(async ({ }, testInfo) => {
    if (testInfo.status === 'failed') suiteFailed = true;
  });

  // ─── TEST 1 ───────────────────────────────────────────────────────────────
  test('Register attendee from Event ticket', async ({ page }) => {
    test.setTimeout(180000);

    const event = new EventsPage(page);
    const studentEmail = registerData.studentEmail;

    await test.step('Login to SalesForce', async () => {
      await loginSF(page);
    });

    await test.step('Check student orientation eligibility', async () => {
      const isEligible = await studentOrientationEligibilityCheck(page, studentEmail);
      if (!isEligible) throw new Error("Student already registered");
      console.log("Student is Eligible for the orientationEvent");
    });

    await test.step('Navigate to the required event', async () => {
      await event.EventsTab.click();
      await event.recentView.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);
      await event.recentView.click({ force: true });
      await page.waitForLoadState('domcontentloaded');
      await event.all.click();
      await event.printableView.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForLoadState('domcontentloaded');
      await clickRequiredEvent(page, registerData.eventName);
    });

    await test.step('Select ticket and open registration page', async () => {
      await event.ticketSelction.waitFor({ state: 'visible', timeout: 10000 });
      await event.ticketSelction.click();
      await event.addAttendee.waitFor({ state: 'visible', timeout: 15000 });
      console.log("Registration page displayed for Admin");
    });

    await test.step('Fill registration details and complete registration', async () => {
      await fillRegistrationDetailsByAdmin(page);
      await event.summaryButton.click();
      await event.completeRegistration.waitFor({ state: 'visible', timeout: 15000 });
      await event.completeRegistration.click();
      await event.registrationCompleted.waitFor({ state: 'visible', timeout: 30000 });
      console.log("Registration completed on UI");
    });

    await test.step('Verify attendee record in backend', async () => {
      const verified = await verifyAttendee(page);
      if (!verified) throw new Error('Attendee verification failed in backend');
    });

    await test.step('Wait for eligibility status to update in backend', async () => {
      console.log("Waiting for the backend to update eligibility...");
      await expect.poll(
        () => studentOrientationEligibilityCheck(page, studentEmail),
        { timeout: 60000, intervals: [5000] }
      ).toBe(false);
    });

  }); // END TEST 1

  // ─── TEST 2 ───────────────────────────────────────────────────────────────
  test('Student can view attendeeLink after Staff Registration', async ({ page, context }) => {

    const register = new EventRegistrationPage(page);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page);
    });

    await test.step('Navigate to orientation and click attendee link', async () => {
      await register.newStudentOrientation.click();
      await register.attendeeLink.click();
    });

    await test.step('Verify Blackthorn attendee page is opened', async () => {
      const newPage = await context.waitForEvent('page',
        page => page.url().includes('events.blackthorn.io')
      );

      await newPage.waitForLoadState('domcontentloaded');
      const attendee = new AttendeePage(newPage);
      await expect(attendee.agendaTab).toBeVisible({ timeout: 15000 });
    });

  }); // END TEST 2

  // ─── TEST 3 ───────────────────────────────────────────────────────────────
  test('Attendee is set to No Show Cancelled @test', async ({ page }) => {
    test.setTimeout(180000);

    const event = new EventsPage(page);

    await test.step('Login to SalesForce', async () => {
      await loginSF(page);
    });

    await test.step('Navigate to the required event', async () => {
      await event.EventsTab.click();
      await event.recentView.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);
      await event.recentView.click({ force: true });
      await page.waitForLoadState('domcontentloaded');
      await event.all.click();
      await event.printableView.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForLoadState('domcontentloaded');
      await clickRequiredEvent(page, registerData.eventName);
    });

    await test.step('Open attendee record and edit registration status', async () => {
      await event.attendeeLink.click();
      await event.getRegisteredAttendeeByUsername.scrollIntoViewIfNeeded();
      await event.getRegisteredAttendeeByUsername.click();
      await event.editRegistrationStatus.click();
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Set status to Cancelled and select cancellation reason', async () => {
      await event.registrationStatusField.click();
      await event.cancelledStatusValue.click();
      await event.registrationCancellationReason.click();
      await event.adminCancellationReason.click();
      await event.adminCancellationDescription.fill(registerData.adminCancellationComments);
      await event.saveEdit.click();
    });

    await test.step('Verify cancellation confirmation in backend', async () => {
      await cancellationConfirmation(
        page,
        registerData.adminCancellationReason,
        registerData.adminCancellationComments
      );
    });

  }); // END TEST 3

}); // END test.describe
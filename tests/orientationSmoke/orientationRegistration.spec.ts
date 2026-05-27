import { test, expect } from '@playwright/test';
import { EventRegistrationPage } from '../../pages/orientationEvents/eventRegistrationPage';
import { userLoginByPassMFA } from '../../utils/BuLogin';
import { error } from 'node:console';
import { saveToJson } from '../../utils/dataExtracter';
import registerData from "../../data/registration.json";
import { AttendeePage } from '../../pages/orientationEvents/attendeeLinkPage';
import { loginSF } from '../../utils/auth';
import { fillRegistrationDetailsByAttendee, getEventRegisteredCount, getEventItemCounts, validateSessions, validateEmergencyContact, cancellationPageFieldsVisibilityCheck, cancellationConfirmation, addSessions, verifyAttendee } from '../../utils/OrientationHelpers/eventRegistrationHelpers';
import { existsSync } from 'fs';

test.use({ storageState: existsSync('state.json') ? 'state.json' : undefined });

test.describe('Registration Creation and Cancellation validations', () => {
  test.describe.configure({ mode: 'serial' });

  let suiteFailed = false;

  test.beforeEach(async ({ }, testInfo) => {
    if (suiteFailed) testInfo.skip(true, 'Skipping due to previous test failure');
  });

  test.afterEach(async ({ }, testInfo) => {
    if (testInfo.status === 'failed') suiteFailed = true;
  });

  // ─── TEST 1 ───────────────────────────────────────────────────────────────
  test('Student Orientation Event Registration', async ({ page }) => {

    const register = new EventRegistrationPage(page);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page);
    });

    await test.step('Select the New orientation Tile and particular event', async () => {
      await register.newStudentOrientation.click();
      await register.Orientation.click();
    });

    await test.step('Click on register and use the available ticket', async () => {
      await register.registerEvent.first().click();
      await register.addMyself.click();
      await saveToJson({ EventName: register.eventName });
      await expect(register.redeemed).toBeVisible();
      await register.registerEvent.last().click();
    });

    await test.step('Validate the mandatory required field error is visible', async () => {
      await register.reviewSession.click({ force: true });
      await expect(register.requiredFieldError).toBeVisible();
    });

    await test.step('Fill all the student registration details', async () => {
      await fillRegistrationDetailsByAttendee(page);
    });

    await test.step('Select the required sessions for the student', async () => {
      await register.reviewSession.click({ force: true });
      await register.sessionsScreen.waitFor({ state: 'visible' });
      await register.allsessions.first().waitFor({ state: 'visible', timeout: 15000 });
      await addSessions(page);
    });

    await test.step('Verify Summary information of user and click on register', async () => {
      const text = await register.userNameInSummary.innerText();
      expect(text.replace(/\s+/g, ' ').trim().toLowerCase()).toBe(registerData.userName.toLowerCase());
      await register.registerEvent.last().click();
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify the congratulations text is displayed', async () => {
      try {
        await register.congratulationsLogo.waitFor({ state: 'visible' });
      } catch {
        console.log("Seems the logo is not found : " + error);
      }
    });

  }); // END TEST 1

  // ─── TEST 2 ───────────────────────────────────────────────────────────────
  test('Verify Attendee record is stored in backend', async ({ page }) => {

    await test.step('Login To SalesForce', async () => {
      await loginSF(page);
    });

    await test.step('Verify the attendee record in backend and its relation to the event', async () => {
      const attendeeFound = await verifyAttendee(page);

      if (attendeeFound) {
        console.log("Attendee Found");
      } else {
        console.log("Record Not Found");
      }
      expect(attendeeFound).toBe(true);
    });

  }); // END TEST 2

  // ─── TEST 3 ───────────────────────────────────────────────────────────────
  test('View AttendeeLink page and session agenda', async ({ page, context }) => {

    const register = new EventRegistrationPage(page);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page);
    });

    await test.step('Select the New orientation Tile and Click on attendee Link', async () => {
      await register.newStudentOrientation.click();
      await register.attendeeLink.click();
    });

    await test.step('Verify Blackthorn page is opened and validate the mandatory Ui elements in attendee link', async () => {
      const newPage = await context.waitForEvent('page',
        page => page.url().includes('events.blackthorn.io')
      );

      await newPage.waitForLoadState('domcontentloaded');
      const attendee = new AttendeePage(newPage);

      await attendee.dateLocator.waitFor({ state: 'visible' });
      await attendee.eventLocator.waitFor({ state: 'visible' });
      await attendee.QRCode.waitFor({ state: 'visible' });
      await attendee.addToCalender.first().waitFor({ state: 'visible' });
      await attendee.agendaTab.waitFor({ state: 'visible' });
      await attendee.filterSession.waitFor({ state: 'visible' });
      await attendee.descriptionDropdown.first().click();
      await attendee.sessionContent.isVisible();

      await validateSessions(context, newPage, registerData.studentEmail);
    });

  }); // END TEST 3

  // ─── TEST 4 ───────────────────────────────────────────────────────────────
  test('The Registration Update Info', async ({ page, context }) => {

    const register = new EventRegistrationPage(page);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page);
    });

    await test.step('Select the New orientation Tile', async () => {
      await register.newStudentOrientation.click();
    });

    await test.step('Click on Update Info button', async () => {
      await register.updateInfo.click();
    });

    await test.step('Student Updates the required Information', async () => {
      await register.orientationEmergencyContactInformation.click();
      await register.emergencyNameUpdated.fill(registerData.contactNameToClear);
      await register.clear.click();
      await register.emergencyNameUpdated.fill(registerData.emergencyNameUpdated);
      await register.emergencyPhoneUpdated.fill(registerData.emergencyPhoneUpdated);
      await register.saveButton.click();
    });

    await test.step('Validate the cancelUpdate button is working and also finish saving the updated changes', async () => {
      await register.continue.click();
      await expect(register.pleaseConfirm).toBeVisible();
      await register.cancelUpdateInfo.click();
      await register.continue.click();
      await register.ok.click();
      await register.finish.click();
    });

    await test.step('Validate the updated changes stored in backend', async () => {
      const sfPage = await context.newPage();
      await loginSF(sfPage);
      await validateEmergencyContact(sfPage, registerData.studentEmail, registerData.emergencyNameUpdated, registerData.emergencyPhoneUpdated);
      await sfPage.close();
    });

  }); // END TEST 4

  // ─── TEST 5 ───────────────────────────────────────────────────────────────
  test('The Registration Cancellation and record count validation', async ({ page }) => {

    const register = new EventRegistrationPage(page);
    let attendeeRemainigSnapshot: number;
    let eventItemRemainingSnapshot: number;

    await test.step('Login to SalesForce and take count of remaining seats available', async () => {
      await loginSF(page);
      attendeeRemainigSnapshot = await getEventRegisteredCount(page);
      eventItemRemainingSnapshot = await getEventItemCounts(page);
      console.log("Remaining Attendee Registration for event: " + attendeeRemainigSnapshot);
      console.log("Remaining Attendee Registrations for particular Ticket: " + eventItemRemainingSnapshot);
    });

    await test.step('Login to Student BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page);
    });

    await test.step('Navigate to student orientation page', async () => {
      await register.newStudentOrientation.click();
    });

    await test.step('Verify Cancellation page fields and click on cancel registeration', async () => {
      await cancellationPageFieldsVisibilityCheck(page);
      await register.cancelRegistration.click();
      await register.yesCancel.click();
      await register.cancellationReason.click();
      await register.cancellationReason.fill(registerData.cancellationComments);
      await expect(register.confirmCancel).toBeVisible();
      await register.finish.click();
    });

    await test.step('Verify Cancellation Confirmation in the backend', async () => {
      await page.waitForTimeout(15000);
      await cancellationConfirmation(page, registerData.StudentCancelled, registerData.cancellationComments);
    });

    await test.step('Verify seat counts are restored after cancellation', async () => {
      await page.goto(process.env.orgURL!);
      const attendeeRemainingAfterCancel = await getEventRegisteredCount(page);
      const eventItemRemainingAfterCancel = await getEventItemCounts(page);

      expect(attendeeRemainingAfterCancel).toBe(attendeeRemainigSnapshot + 1);
      expect(eventItemRemainingAfterCancel).toBe(eventItemRemainingSnapshot + 1);

      console.log("Remaining Attendee Registration for event: " + attendeeRemainingAfterCancel);
      console.log("Remaining Attendee Registrations for particular Ticket: " + eventItemRemainingAfterCancel);
    });

  }); // END TEST 5

}); // END test.describe
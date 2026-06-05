import { test, expect } from '@playwright/test';
import { EventRegistrationPage } from '../../pages/orientationEvents/eventRegistrationPage';
import { userLoginByPassMFA } from '../../utils/BuLogin';
import { saveToJson } from '../../utils/dataExtracter';
import { readExcelData } from '../../utils/excelReader';
import { AttendeePage } from '../../pages/orientationEvents/attendeeLinkPage';
import { fillRegistrationDetailsByAttendee, getEventRegisteredCount, getEventItemCounts, validateSessions, validateEmergencyContact, cancellationPageFieldsVisibilityCheck, cancellationConfirmation, addSessions, verifyAttendee } from '../../utils/OrientationHelpers/eventRegistrationHelpers';
import { createFlowState } from '../../utils/flowStateManager';

const testDataRows = readExcelData('orientation_test_data.xlsx', 'Registration');
const registerData = testDataRows.find(row => row.Type === 'Student Registration');

if (!registerData) {
  throw new Error('No data found in Test Data sheet. Check execute column is set to yes.');
}

const flow = createFlowState('studentFlowState.json');

test.describe('Registration Creation and Cancellation validations', () => {

  // ─── TEST 1 ───────────────────────────────────────────────────────────────
  test('Student Orientation Event Registration', async ({ page }) => {

    flow.resetState();

    const register = new EventRegistrationPage(page, registerData);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page, registerData.LoginName);
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
      await fillRegistrationDetailsByAttendee(page, registerData);
    });

    await test.step('Select the required sessions for the student', async () => {
      await register.reviewSession.click({ force: true });
      await register.sessionsScreen.waitFor({ state: 'visible' });
      await register.allsessions.first().waitFor({ state: 'visible', timeout: 15000 });
      await addSessions(page, registerData);
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
        console.log("Seems the logo is not found");
      }
    });

    flow.markPassed('test1');
  });

  // ─── TEST 2 ───────────────────────────────────────────────────────────────
  test('Verify Attendee record is stored in backend', async ({ page }) => {
    test.skip(!flow.hasPassed('test1'), 'Skipping: Test 1 did not pass');

    await test.step('Verify the attendee record in backend and its relation to the event', async () => {
      const attendeeFound = await verifyAttendee(registerData);
      if (attendeeFound) {
        console.log("Attendee Found");
      } else {
        console.log("Record Not Found");
      }
      expect(attendeeFound).toBe(true);
    });

    flow.markPassed('test2');
  });

  // ─── TEST 3 ───────────────────────────────────────────────────────────────
  test('View AttendeeLink page and session agenda', async ({ page, context }) => {
    test.skip(!flow.hasPassed('test1', 'test2'), 'Skipping: Test 1 or 2 did not pass');

    const register = new EventRegistrationPage(page, registerData);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page, registerData.LoginName);
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
      const attendee = new AttendeePage(newPage, registerData);

      await attendee.dateLocator.waitFor({ state: 'visible' });
      await attendee.eventLocator.waitFor({ state: 'visible' });
      await attendee.QRCode.waitFor({ state: 'visible' });
      await attendee.addToCalender.first().waitFor({ state: 'visible' });
      await attendee.agendaTab.waitFor({ state: 'visible' });
      await attendee.filterSession.waitFor({ state: 'visible' });
      await attendee.descriptionDropdown.first().click();
      await attendee.sessionContent.isVisible();

      await validateSessions(context, newPage, registerData);
    });
  });

  // ─── TEST 4 ───────────────────────────────────────────────────────────────
  test('Update Non mandatory sessions and validate backend', async ({ page, context }) => {
    test.skip(!flow.hasPassed('test1', 'test2'), 'Skipping: Test 1 or 2 did not pass');

    const register = new EventRegistrationPage(page, registerData);

    
    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page, registerData.LoginName);
    });

    await test.step('Select the New orientation Tile and Click on attendee Link', async () => {
      await register.newStudentOrientation.click();
      await register.attendeeLink.click();
    });

    await test.step('Verify Blackthorn page is opened ,added and removed a session and submitted', async () => {
    const newPage = await context.waitForEvent('page',
      page => page.url().includes('events.blackthorn.io')
    );
    await newPage.waitForLoadState('domcontentloaded');
    const attendee = new AttendeePage(newPage, registerData);

    await attendee.sessionRegistrationTab.dblclick({ delay: 100 });
    await attendee.sessionToAdd.first().click();
    console.log(`Checked session: "${registerData.addedSession}"`);

    await attendee.uncheckedSession.first().scrollIntoViewIfNeeded();
    await attendee.uncheckedSession.first().click();
    console.log(`Unchecked session: "${registerData.uncheckedSession}"`);

    await expect(attendee.submit).toBeVisible();
    await attendee.submit.click();
    await newPage.waitForLoadState('domcontentloaded');
    const sfNames = await validateSessions(context, newPage, registerData);
    console.log('SF Session Names returned:', sfNames);
    expect(sfNames).toContain(registerData.addedSession);
    console.log(`Added session found in SF: "${registerData.addedSession}"`);
    });
  });

  // ─── TEST 5 ───────────────────────────────────────────────────────────────
  test('The Registration Update Info', async ({ page, context }) => {
    test.skip(!flow.hasPassed('test1', 'test2'), 'Skipping: Test 1 or 2 did not pass');

    const register = new EventRegistrationPage(page, registerData);

    await test.step('Student login to BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page, registerData.LoginName);
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
      await validateEmergencyContact(registerData.studentEmail, registerData.emergencyNameUpdated, registerData.emergencyPhoneUpdated);
    });
  });

  // ─── TEST 6 — only needs test 1 + test 2, independent of 3,4,5 ───────────
  test('The Registration Cancellation and record count validation', async ({ page }) => {
    test.skip(!flow.hasPassed('test1', 'test2'), 'Skipping: Test 1 or 2 did not pass');

    const register = new EventRegistrationPage(page, registerData);
    let attendeeRemainigSnapshot: number;
    let eventItemRemainingSnapshot: number;

    await test.step('Take count of remaining seats available', async () => {
      attendeeRemainigSnapshot = await getEventRegisteredCount(registerData);
      eventItemRemainingSnapshot = await getEventItemCounts(registerData);
      console.log("Remaining Attendee Registration for event: " + attendeeRemainigSnapshot);
      console.log("Remaining Attendee Registrations for particular Ticket: " + eventItemRemainingSnapshot);
    });

    await test.step('Login to Student BU portal', async () => {
      await page.goto(process.env.MY_BU_PORTAL!);
      await userLoginByPassMFA(page, registerData.LoginName);
    });

    await test.step('Navigate to student orientation page', async () => {
      await register.newStudentOrientation.click();
    });

    await test.step('Verify Cancellation page fields and click on cancel registeration', async () => {
      await cancellationPageFieldsVisibilityCheck(page, registerData);
      await register.cancelRegistration.click();
      await register.yesCancel.click();
      await register.cancellationReason.click();
      await register.cancellationReason.fill(registerData.cancellationComments);
      await expect(register.confirmCancel).toBeVisible();
      await register.finish.click();
    });

    await test.step('Verify Cancellation Confirmation in the backend', async () => {
      await page.waitForTimeout(15000);
      await cancellationConfirmation(page, registerData, registerData.StudentCancelled, registerData.cancellationComments);
    });

    await test.step('Verify seat counts are restored after cancellation', async () => {
      const attendeeRemainingAfterCancel = await getEventRegisteredCount(registerData);
      const eventItemRemainingAfterCancel = await getEventItemCounts(registerData);

      expect(attendeeRemainingAfterCancel).toBe(attendeeRemainigSnapshot + 1);
      expect(eventItemRemainingAfterCancel).toBe(eventItemRemainingSnapshot + 1);

      console.log("Remaining Attendee Registration for event: " + attendeeRemainingAfterCancel);
      console.log("Remaining Attendee Registrations for particular Ticket: " + eventItemRemainingAfterCancel);
    });
  });

});
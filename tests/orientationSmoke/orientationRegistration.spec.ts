import { test, expect,} from '@playwright/test';
import {EventRegistrationPage} from '../../pages/orientationEvents/eventRegistrationPage';
import {} from '../../utils/OrientationHelpers/eventGroupHelper';
import { userLoginByPassMFA } from '../../utils/BuLogin';
import { error } from 'node:console';
import{saveToJson} from '../../utils/dataExtracter';
import registerData from "../../data/registration.json";
import {AttendeePage} from '../../pages/orientationEvents/attendeeLinkPage';
import { loginSF } from '../../utils/auth';
import {fillRegistrationDetailsByAttendee,getEventRegisteredCount,getEventItemCounts,validateSessions,validateEmergencyContact,cancellationPageFieldsVisibilityCheck,cancellationConfirmation,addSessions,verifyAttendee} from '../../utils/OrientationHelpers/eventRegistrationHelpers';
import { existsSync } from 'fs';


test.use({ storageState: existsSync('state.json') ? 'state.json' : undefined });

test.describe('Registration Creation and Cancellation validations', () => {
  test.describe.configure({ mode: 'serial' });
  
  let suiteFailed = false;

  test.beforeEach(async ({}, testInfo) => {
    if (suiteFailed) testInfo.skip(true, 'Skipping due to previous test failure');
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'failed') suiteFailed = true;
  });

test('Event Registration @testNow', async ({ page}) => {

const register = new EventRegistrationPage(page);

await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await register.Orientation.click();
await register.registerEvent.first().click();
await register.addMyself.click();
await saveToJson({EventName:register.eventName});
await expect(register.redeemed).toBeVisible();
await register.registerEvent.last().click();
await register.reviewSession.click({ force: true });
await fillRegistrationDetailsByAttendee(page);
await register.reviewSession.click({ force: true });
await register.sessionsScreen.waitFor({ state: 'visible'});
await register.allsessions.first().waitFor({ state: 'visible', timeout: 15000 });
await addSessions(page);
const text = await register.userNameInSummary.innerText();
expect(text.replace(/\s+/g, ' ').trim().toLowerCase()).toBe(registerData.userName.toLowerCase());
await register.registerEvent.last().click();
await page.waitForLoadState('domcontentloaded');
try
{
    await register.congratulationsLogo.waitFor({ state: 'visible' });
}
catch{
    console.log("Seems the logo is not found : "+ error);
}

});

test('Event Registration Attendee Backend Validation', async ({ page }) => 
{
await loginSF(page);
const attendeeFound = await verifyAttendee(page);

if(attendeeFound){
    console.log("Attendee Found");
} else {
    console.log("Record Not Found");
}
expect(attendeeFound).toBe(true);

});


/*
test('Event Registration mandatory field validation ', async ({ page }) => {

const event = new EventGroupPage(page);
const register = new EventRegistrationPage(page);

await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await register.Orientation.click();
await register.registerEvent.first().click();
await register.addMyself.click();
await expect(register.redeemed).toBeVisible();
await register.registerEvent.last().click();
await page.waitForTimeout(2000);
await register.reviewSession.click({ force: true });
await page.waitForLoadState('domcontentloaded');
await register.requiredFieldError.scrollIntoViewIfNeeded();
await expect(register.requiredFieldError).toBeVisible();


});*/


test('View AttendeeLink page and session agenda', async ({ page, context }) => {

  const register = new EventRegistrationPage(page);
  await page.goto(process.env.MY_BU_PORTAL!);
  await userLoginByPassMFA(page);
  await register.newStudentOrientation.click();
  await register.attendeeLink.click();

  //Switch to blackthorn tab
  const newPage = await context.waitForEvent('page',
    page => page.url().includes('events.blackthorn.io')
  );

  await newPage.waitForLoadState('domcontentloaded');
  const attendee = new AttendeePage(newPage);

  // UI Validations on blackthorn tab
  await attendee.dateLocator.waitFor({ state: 'visible' });
  await attendee.eventLocator.waitFor({ state: 'visible' });
  await attendee.QRCode.waitFor({ state: 'visible' });
  await attendee.addToCalender.first().waitFor({ state: 'visible' });
  await attendee.agendaTab.waitFor({ state: 'visible' });
  await attendee.filterSession.waitFor({ state: 'visible' });
  await attendee.descriptionDropdown.first().click();
  await attendee.sessionContent.isVisible();

  await validateSessions(context,newPage, registerData.studentEmail);
});

/*
test('Update Non mandatory sessions and validate backend', async ({ page, context }) => {

  const register = new EventRegistrationPage(page);
  await page.goto(process.env.MY_BU_PORTAL!);
  await userLoginByPassMFA(page);
  await register.newStudentOrientation.click();
  await register.attendeeLink.click();

  const newPage = await context.waitForEvent('page',
    page => page.url().includes('events.blackthorn.io')
  );

  await newPage.waitForLoadState('domcontentloaded');
  const attendee = new AttendeePage(newPage);

  await attendee.sessionRegistrationTab.click({ 
  position: { x: 5, y: 5 },
  delay: 100 
});
  await attendee.sessionToAdd.first().click();
  console.log(`Checked session: "${registerData.addedSession}"`);

  await attendee.uncheckedSession.first().scrollIntoViewIfNeeded();
  await attendee.uncheckedSession.first().click();
  console.log(`Unchecked session: "${registerData.uncheckedSession}"`);
  await attendee.submit.click();
  //Wait for changes to sync to backend
  await newPage.waitForLoadState('domcontentloaded');

  //Validate using your existing function
  const sfNames = await validateSessions(context,newPage, registerData.studentEmail);

expect(sfNames).toContain(registerData.addedSession);
console.log(`Added session found in SF: "${registerData.addedSession}"`);

});

*/

test('The Registration Update Info',async ({ page,context }) =>{

const register = new EventRegistrationPage(page);
await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await register.updateInfo.click();
await register.orientationEmergencyContactInformation.click();
await register.emergencyNameUpdated.fill(registerData.contactNameToClear);
await register.clear.click();
await register.emergencyNameUpdated.fill(registerData.emergencyNameUpdated);
await register.emergencyPhoneUpdated.fill(registerData.emergencyPhoneUpdated);
await register.saveButton.click();
await register.continue.click();
await expect(register.pleaseConfirm).toBeVisible();
await register.cancelUpdateInfo.click();
await register.continue.click();
await register.ok.click();
await register.finish.click();

const sfPage = await context.newPage();
await loginSF(sfPage);
await validateEmergencyContact(sfPage,registerData.studentEmail,registerData.emergencyNameUpdated,registerData.emergencyPhoneUpdated);
await sfPage.close();
});



test('The Registration Cancellation and record count validation @test2',async ({ page }) =>{

await loginSF(page);
const attendeeRemainigSnapshot = await getEventRegisteredCount(page);
const eventItemRemainingSnapshot = await getEventItemCounts(page);

console.log("Remaining Attendee Registration for event: "+ attendeeRemainigSnapshot);
console.log("Remaining Attendee Registrations for particular Ticket: "+ eventItemRemainingSnapshot);
const register = new EventRegistrationPage(page);
await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await cancellationPageFieldsVisibilityCheck(page);
await register.cancelRegistration.click();
await register.yesCancel.click();
await register.cancellationReason.click();
await register.cancellationReason.fill(registerData.cancellationComments);
await expect(register.confirmCancel).toBeVisible();
await register.finish.click();
await page.waitForTimeout(15000);
await cancellationConfirmation(page,registerData.StudentCancelled,registerData.cancellationComments);

await page.goto(process.env.orgURL!);
const attendeeRemainingAfterCancel = await getEventRegisteredCount(page);
const eventItemRemainingAfterCancel = await getEventItemCounts(page);

  expect(attendeeRemainingAfterCancel).toBe(attendeeRemainigSnapshot + 1);
  expect(eventItemRemainingAfterCancel).toBe(eventItemRemainingSnapshot + 1);

console.log("Remaining Attendee Registration for event: "+ attendeeRemainingAfterCancel);
console.log("Remaining Attendee Registrations for particular Ticket: "+ eventItemRemainingAfterCancel);
});

 });

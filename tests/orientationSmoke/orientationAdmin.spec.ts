import { test, expect} from '@playwright/test';
import {EventsPage} from '../../pages/orientationEvents/eventAdminPage';
import {cancellationConfirmation, verifyAttendee} from '../../utils/OrientationHelpers/eventRegistrationHelpers';
import {studentOrientationEligibilityCheck,clickRequiredEvent,fillRegistrationDetailsByAdmin} from '../../utils/OrientationHelpers/eventAdminHelpers';
import registerData from "../../data/registration.json";
import { loginSF } from '../../utils/auth';
import { existsSync } from 'fs';
import { EventRegistrationPage } from '../../pages/orientationEvents/eventRegistrationPage';
import { userLoginByPassMFA } from '../../utils/BuLogin';
import { AttendeePage } from '../../pages/orientationEvents/attendeeLinkPage';

test.use({ storageState: existsSync('state.json') ? 'state.json' : undefined });

test('Register attendee from Event ticket @testNow', async ({ page }) => {
  test.setTimeout(180000); //3mins

  const event = new EventsPage(page);
  const studentEmail = registerData.studentEmail;

  await loginSF(page);

  const isEligible = await studentOrientationEligibilityCheck(page, studentEmail);
  if (!isEligible) throw new Error("Student already registered");
  console.log("Student is Eligible for the orientationEvent");

  await event.EventsTab.click();
  await event.recentView.waitFor({ state: 'visible', timeout: 10000 });
  await event.recentView.click();

   if (!(await event.all.isVisible())) {
  await event.recentView.click();
  await event.all.waitFor({ state: 'visible', timeout: 10000 });
}
  await event.all.click();
  await clickRequiredEvent(page, registerData.eventName);

  await event.ticketSelction.waitFor({ state: 'visible', timeout: 10000 });
  await event.ticketSelction.click();

  await event.addAttendee.waitFor({ state: 'visible', timeout: 15000 });
  console.log("Registration page displayed for Admin");

  await fillRegistrationDetailsByAdmin(page);

  await event.summaryButton.click();

  await event.completeRegistration.waitFor({ state: 'visible', timeout: 15000 });
  await event.completeRegistration.click();
  await event.registrationCompleted.waitFor({ state: 'visible', timeout: 30000 });
  console.log("Registration completed on UI");

  const verified = await verifyAttendee(page);
  if (!verified) throw new Error('Attendee verification failed in backend');

  console.log("Waiting for the backend to update eligibility...");
  await expect.poll(
    () => studentOrientationEligibilityCheck(page, studentEmail),
    { timeout: 60000, intervals: [5000] }
  ).toBe(false);
});

test('Student can view attendeeLink after Staff Registration', async ({ page,context }) => 
{

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
    await expect(attendee.agendaTab).toBeVisible();
  
});


test('Attendee is set to No Show Cancelled @run', async ({ page }) => {
  test.setTimeout(180000); //3mins

  const event = new EventsPage(page);
  await loginSF(page);
  await event.EventsTab.click();
  await event.recentView.waitFor({ state: 'visible', timeout: 10000 });
  await event.recentView.click();

   if (!(await event.all.isVisible())) {
  await event.recentView.click();
  await event.all.waitFor({ state: 'visible', timeout: 10000 });
   }
  await event.all.click();
  await clickRequiredEvent(page, registerData.eventName);

  await event.attendeeLink.click();
  await event.getRegisteredAttendeeByUsername.scrollIntoViewIfNeeded();
  await event.getRegisteredAttendeeByUsername.click();
  await event.editRegistrationStatus.click();
  await page.waitForLoadState('domcontentloaded');
  await event.registrationStatusField.click();
  await event.cancelledStatusValue.click();
  await event.registrationCancellationReason.click();
  await event.adminCancellationReason.click();
  await event.saveEdit.click();
  await cancellationConfirmation(page,registerData.adminCancellationReason,registerData.adminCancellationComments);


});


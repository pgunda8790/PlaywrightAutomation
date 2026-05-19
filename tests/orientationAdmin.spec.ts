import { test, expect} from '@playwright/test';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import {EventsPage} from '../pages/OrientationEvents/eventsPage';
import {EventRegistrationPage} from '../pages/OrientationEvents/eventRegistrationPage';
import dotenv from 'dotenv';
import {studentOrientationEligibilityCheck,clickRequiredEvent, verifyAttendee} from '../utils/eventGroupHelper';
import { userLoginByPassMFA } from '../utils/BuLogin';
import { error } from 'node:console';
import{saveToJson,getFromJson} from '../utils/dataExtracter';
import registerData from "../data/registration.json";
import { register } from 'node:module';


test('Register attendee from Event ticket ', async ({ page }) => {

const event = new EventsPage(page);
const studentEmail = registerData.studentEmail;
const isEligible = await studentOrientationEligibilityCheck(page,studentEmail);

  if (isEligible) {
    console.log("Student is Eligible for the orientationEvent");
    return;
  }
  else
  {
    console.log("Student already registered — skipping test.");
    test.skip(true, "Student already registered");
  }

 await event.EventsTab.click();
 await event.recentView.click();
 await event.all.click();
 await clickRequiredEvent(page,registerData.eventName);
 await event.ticketSelction.click();
 await event.addAttendee.waitFor({ state: 'visible'});
 await event.userSearch.fill(registerData.userName);
 await event.userResult.click();
 await event.emailOptIn.click();
 await event.nextButton.click();
 await event.dietaryPreference.click();
 await event.No.click();
 await event.emergencyContactName.fill(registerData.emergencyContactName);
 await event.emergencyContactPhone.fill(registerData.emergencyConatactPhone);
 await event.optionalTour.click();
 await event.readAndUnderstandInfo.fill(registerData.signatiureName);
 await event.summaryButton.click();
 await event.completeRegistration.click();
 await event.registrationCompleted.waitFor({state:'visible'});
 await verifyAttendee(page,registerData.eventName);
 await expect.poll(() => studentOrientationEligibilityCheck(page, studentEmail), { timeout: 30000, intervals: [3000] }).toBe(false);


});


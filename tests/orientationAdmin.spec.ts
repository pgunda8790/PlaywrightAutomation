import { test, expect} from '@playwright/test';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import {EventsPage} from '../pages/OrientationEvents/eventsPage';
import {EventRegistrationPage} from '../pages/OrientationEvents/eventRegistrationPage';
import dotenv from 'dotenv';
import {addSessions,verifyAttendee,studentOrientationEligibilityCheck} from '../utils/eventGroupHelper';
import { userLoginByPassMFA } from '../utils/BuLogin';
import { error } from 'node:console';
import{saveToJson,getFromJson} from '../utils/dataExtracter';
import registerData from "../data/registration.json";


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

 events

});

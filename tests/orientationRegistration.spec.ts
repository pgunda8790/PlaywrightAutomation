import { test, expect} from '@playwright/test';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import {EventRegistrationPage} from '../pages/OrientationEvents/eventRegistrationPage';
import dotenv from 'dotenv';
import {addSessions,verifyAttendee} from '../utils/eventGroupHelper';
import { userLoginByPassMFA } from '../utils/BuLogin';
import { error } from 'node:console';
import{saveToJson,getFromJson} from '../utils/dataExtracter';
import registerData from "../data/registration.json";


test('Event Registration', async ({ page }) => {

const event = new EventGroupPage(page);
const register = new EventRegistrationPage(page);

await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await register.mayOrientation.click();
await register.registerEvent.first().click();
await register.addMyself.click();
await saveToJson({EventName:register.eventName});
await expect(register.redeemed).toBeVisible();
await register.registerEvent.last().click();
await expect(register.userDataAutoFetch).toBeVisible();
await saveToJson({Email:register.email});
await register.dieteryPreference.click();
await register.yes.click();
await register.diaryFreeMealCheck.click();
await register.MealSpecification.fill(registerData.SpecificationMeal);
await register.emergencyName.fill(registerData.emergencyContactName);
await register.emergencyPhone.fill(registerData.emergencyConatactPhone);
await register.optionalTour.click();
await register.readAndUnderstandInfo.fill(registerData.signatiureName);
await page.waitForTimeout(2000);
await register.readAndUnderstandInfo.press('Tab');
await register.reviewSession.click({ force: true });
await register.sessionsScreen.waitFor({ state: 'visible'});
await register.allsessions.first().waitFor({ state: 'visible', timeout: 15000 });
await addSessions("../data/accountData.json",page);
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



test.describe('Verify Attendee @testNow2', () => {
test.use({ storageState: 'state.json' }); 

test('Verify the Attendee record Saved', async ({ page }) => {
 
await page.goto(process.env.orgURL!);
const attendeeFound = await verifyAttendee(page);

if(attendeeFound)
{
    console.log("Attendee Found");
}
else
{
    console.log("Record Not Found");
}

})

});

test('The Registration Cancellation @testNow3',async ({ page }) =>{

const event = new EventGroupPage(page);
const register = new EventRegistrationPage(page);
await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await register.cancelRegistration.click();
await register.yesCancel.click();
await expect(register.confirmCancel).toBeVisible();
await register.finish.click();

});

test('Event Registration mandatory field validation @testNow4', async ({ page }) => {

const event = new EventGroupPage(page);
const register = new EventRegistrationPage(page);

await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);
await register.newStudentOrientation.click();
await register.mayOrientation.click();
await register.registerEvent.first().click();
await register.addMyself.click();
await expect(register.redeemed).toBeVisible();
await register.registerEvent.last().click();
await page.waitForTimeout(2000);
await register.reviewSession.click({ force: true });
await page.waitForLoadState('domcontentloaded');
await register.requiredFieldError.scrollIntoViewIfNeeded();
await expect(register.requiredFieldError).toBeVisible();


});


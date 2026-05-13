import { test, expect} from '@playwright/test';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import {EventRegistrationPage} from '../pages/OrientationEvents/eventRegistrationPage';
import dotenv from 'dotenv';
import {addSessions,verifyAttendee} from '../utils/eventGroupHelper';
import { userLoginByPassMFA } from '../utils/BuLogin';
import { error } from 'node:console';
import{saveToJson,getFromJson} from '../utils/dataExtracter';



test('Create Orientation Event Group if not exists', async ({ page }) => {

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
await register.MealSpecification.fill("Lactose Free Meal");
await register.emergencyName.fill("John");
await register.emergencyPhone.fill("2315618212");
await register.optionalTour.click();
await register.readAndUnderstandInfo.fill("TestUser");
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

test.describe('Verify Attendee', () => {
test.use({ storageState: 'state.json' }); 

test('Verify the Attendee record Saved @testNow', async ({ page }) => {
 
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

test('The Registration Cancellation',async ({ page }) =>{

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

/*
test('Verify loginSkip @testNow', async ({ page }) => {
    
const event = new EventGroupPage(page);
await page.goto(process.env.MY_BU_PORTAL!);
await userLoginByPassMFA(page);


});
*/
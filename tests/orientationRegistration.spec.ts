import { test, expect,Locator} from '@playwright/test';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';

import dotenv from 'dotenv';
import { runSOQL } from '../utils/apiHelper';

test('Create Orientation Event Group if not exists', async ({ page }) => {

const event = new EventGroupPage(page);
await page.goto(process.env.MY_BU_PORTAL!);
await event.buLoginName.fill(process.env.BUTestUser!);
await event.buPassword.fill(process.env.BUTestPassword!);
await event.bypassCode.fill(process.env.BUPasscode!);
await event.verifyCode.click();
await event.trustBroser.click();
await event.welcomeText.waitFor({ state: 'visible' });

await event.mayOrientation.click();
await event.registerEvent.click();

await event.addMyself.click();
await expect(event.redeemed).toBeVisible();
await event.registerEvent.click();

await expect(event.userDataAutoFetch).toBeVisible();
await event.dieteryPreference.click();
await event.yes.click();
await event.diaryFreeMealCheck.click();
await event.MealSpecification.fill("Lactose Free Meal");
await event.emergencyName.fill("John");
await event.emergencyPhone.fill("2315618212");
await event.optionalTour.click();
await event.readAndUnderstandInfo.fill("TestUser");

});









  
});


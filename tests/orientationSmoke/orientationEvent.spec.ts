
import { test, expect,Locator} from '@playwright/test';
import { EventGroupPage } from '../../pages/orientationEvents/eventGroupPage';
import {checkOrientationRecordExists,clickActiveEventGroup,clickOrientationRecord,uncheckDefaultCheckbox,cloneEvent} from '../../utils/OrientationHelpers/eventGroupHelper';
import { existsSync } from 'fs';
import {loginSF} from '../../utils/authUtils';

test.use({ storageState: existsSync('state.json') ? 'state.json' : undefined });


test('Create Orientation Event Group if not exists', async ({ page }) => {

  const eventPage = new EventGroupPage(page);
  const currentYear = new Date().getFullYear().toString();
  let orientationExists = false;

  await test.step('Login to SalesForce', async () => {
    await loginSF(page);
  });

  await test.step('Navigate to Event Groups Tab', async () => {
    await eventPage.more.click();
    await eventPage.EventGroupsTab.first().waitFor({ state: 'visible' });
    await eventPage.EventGroupsTab.click();
    await eventPage.recentView.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);
      await eventPage.recentView.click({ force: true });
      await page.waitForLoadState('domcontentloaded');
      await eventPage.all.click();
  });

  await test.step('Check if the current year orientation record exists', async () => {
    const existsBefore = await checkOrientationRecordExists(page);

    if (existsBefore) {
      console.log(`Event Group "Orientation ${currentYear}" already exists`);
      orientationExists = true;
      return;
    }

    console.log("Not found. Proceeding with clone flow...");
  });

  if (orientationExists) return;

  await test.step('Uncheck the default Event Group and clone the event', async () => {
    const activeGroupClicked = await clickActiveEventGroup(page);

    if (activeGroupClicked) {
      await uncheckDefaultCheckbox(page);
      await cloneEvent(page);
    } else {
      const orientationClicked = await clickOrientationRecord(page);
      if (orientationClicked) {
        await cloneEvent(page);
      } else {
        console.warn('No Orientation record found to clone from. Ending test.');
        return;
      }
    }

    console.log("Event Group BU Undergraduate Orientation " + currentYear + " cloned successfully");
  });

  await test.step('Verify the Cloned Event Group with current year is created', async () => {

  console.log("Verifying record via SOQL...");
  await page.waitForTimeout(3000);
  const existsAfter = await checkOrientationRecordExists(page);
 

  if (existsAfter) {
    console.log(`Verification passed: Orientation ${currentYear} record exists.`);
  } else {
    console.warn(`Verification failed: Record not found after clone.`);
  }
expect(existsAfter, `Orientation ${currentYear} record should exist after clone`).toBe(true);
});

});

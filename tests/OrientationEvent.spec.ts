
import { test, expect,Locator} from '@playwright/test';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import {checkOrientationRecordExists,clickActiveEventGroup,clickOrientationRecord,uncheckDefaultCheckbox,cloneEvent} from '../utils/eventGroupHelper';
import { existsSync } from 'fs';

test.use({ storageState: existsSync('state.json') ? 'state.json' : undefined });
test('Create Orientation Event Group if not exists', async ({ page }) => {

const eventPage = new EventGroupPage(page);
const currentYear = new Date().getFullYear().toString();
await page.goto(process.env.orgURL!);
await eventPage.EventGroupsTab.waitFor({ state: 'visible' });
await eventPage.EventGroupsTab.click();
await eventPage.recentView.click();
await eventPage.all.click();
const existsBefore = await checkOrientationRecordExists(page);

  if (existsBefore) {
    console.log(`Event Group "Orientation ${currentYear}" already exists`);
    return;
  }

  console.log("Not found. Proceeding with clone flow...");

  const activeGroupClicked = await clickActiveEventGroup(page);

  if (activeGroupClicked) {
    // Active group found — uncheck Default checkbox and Save before cloning
    await uncheckDefaultCheckbox(page);
    await cloneEvent(page);
  }
  
  else {
    
    const orientationClicked = await clickOrientationRecord(page);
    if (orientationClicked) {
      await cloneEvent(page);
      
    }
    else
    {
      console.warn('No Orientation record found to clone from. Ending test.');
      return;
    }
  }
  console.log("Event Group BU Undergraduate Orientation "+ currentYear +" cloned successfully");
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

import { Page } from '@playwright/test';
import { runSOQL } from '../apiHelper';
import { EventGroupPage } from '../../pages/orientationEvents/eventGroupPage';
import { getSFAccessToken } from '../sfJwtAuth';

const currentYear = new Date().getFullYear().toString();
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function checkOrientationRecordExists() {
  const query = `SELECT OwnerId, Name FROM conference360__Event_Group__c WHERE Name LIKE '%Orientation ${currentYear}%'`;
  const accessToken = await getSFAccessToken();
  const records = await runSOQL(query, accessToken);
  return records.length > 0;
}

export async function clickActiveEventGroup(page: Page) {
  const eventPage = new EventGroupPage(page);
  await page.waitForLoadState('domcontentloaded');
  const isVisible = await eventPage.activeGroup.isVisible();
  if (!isVisible) {
    console.log('No active Event Group found.');
    return false;
  }
  await eventPage.activeGroup.click();
  return true;
}

export async function clickOrientationRecord(page: Page) {
  const eventPage = new EventGroupPage(page);
  try {
    await eventPage.orientationRecord.first().click();
    return true;
  } catch (error) {
    console.warn('No Orientation record found to click:', error);
    return false;
  }
}

export async function uncheckDefaultCheckbox(page: Page) {
  const eventPage = new EventGroupPage(page);
  await eventPage.editDefault.click();
  const isChecked = await eventPage.defaultCheckbox.isChecked();
  if (isChecked) {
    await eventPage.defaultCheckbox.click();
    console.log('Unchecked Default checkbox.');
  } else {
    console.log('Default checkbox is not checked');
  }
  await eventPage.saveButton.click();
}

export async function cloneEvent(page: Page): Promise<void> {
  const eventPage = new EventGroupPage(page);
  const cloneButton = page.locator(`//button[normalize-space()='Clone']`);
  await cloneButton.click();
  console.log('Clicked Clone button.');
  const newName = `BU Undergraduate Orientation ${currentYear}`;
  await eventPage.inputGroupName.clear();
  await eventPage.inputGroupName.fill(newName);
  await eventPage.saveButton.click();
}
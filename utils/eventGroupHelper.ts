import { Page,expect } from '@playwright/test';
import { runSOQL } from './apiHelper';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
//import{getRecord} from './jsForceOperations';
import { EventRegistrationPage } from '../pages/OrientationEvents/eventRegistrationPage';
import {getFromJson} from '../utils/dataExtracter';

const currentYear = new Date().getFullYear().toString();

export async function checkOrientationRecordExists(page:Page){
  const query = `SELECT OwnerId, Name FROM conference360__Event_Group__c WHERE Name LIKE '%Orientation ${currentYear}%'`;
  const records = await runSOQL(query,page);
  return records.length > 0;
}

export async function clickActiveEventGroup(page: Page){
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


export async function clickOrientationRecord(page: Page){
   const eventPage = new EventGroupPage(page);  
  try {
    await eventPage.orientationRecord.first().click();
    return true;
  } catch (error) {
    console.warn('No Orientation record found to click:', error);
    return false;
  }
 
}

export async function uncheckDefaultCheckbox(page: Page){
  
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
    //await cloneButton.waitFor({ state: 'visible', timeout: 5000 });
    await cloneButton.click();
    console.log('Clicked Clone button.');

    const newName = `BU Undergraduate Orientation ${currentYear}`;
    await eventPage.inputGroupName.clear();
    await eventPage.inputGroupName.fill(newName);
    await eventPage.saveButton.click();
  
}

export async function addSessions(jsonFilePath: string, page: Page) {
  const register = new EventRegistrationPage(page);
  const sessionNames: string[] = require(jsonFilePath).sessionsToAdd;
  console.log("Sessionnames :"+sessionNames);
  const allSessions = register.allsessions;
  const totalCount = await allSessions.count();
  console.log("Total count "+totalCount);

  for (let i = 0; i < totalCount; i++) {
    const sessionText = (await allSessions.nth(i).innerText()).trim();

    if (sessionNames.includes(sessionText)) {
      const addButton = register.addSessionButton.nth(i);

      if (await addButton.isEnabled()) {
        await addButton.click();
            console.log("Added : "+sessionText);
      }
    }
  }
}

export async function verifyAttendee(page: Page) {

  const eventName = getFromJson('EventName');
  const email = getFromJson('Email');

  const query = `SELECT 
    conference360__Account_Name__c,
    conference360__Event_Name__c,
    conference360__Email2__c
FROM conference360__Attendee__c
WHERE conference360__Email2__c = '${email}'
AND conference360__Event_Name__c LIKE '%${eventName}%'`;

  const records = await runSOQL(query, page);
  return records.length > 0;
}

export async function studentOrientationEligibilityCheck(page:Page,email:string)//Mandatory details- email
{

  const query = `SELECT hed__Chosen_Full_Name__c,Email,zBU_UGO_Attendee_Count__c
                 FROM Contact 
                 WHERE zBU_UGO_Attendee_Count__c= 0
                 AND Email='${email}'`;
  const records = await runSOQL(query,page);

  return records.length > 0;
}

export async function clickRequiredEvent(page: Page, eventName: string) {
  const query = `SELECT Name , OwnerID
FROM conference360__Event__c`;

  const records = await runSOQL(query, page);

  const matchedEvent = records.find((r: any) =>
    r.Name.toLowerCase().includes(eventName.toLowerCase())
  );

  if (!matchedEvent) {
    throw new Error(`No event found matching: "${eventName}"`);
  }

  console.log(`Event found: ${matchedEvent.Name}`);
  await page.getByText(matchedEvent.Name, { exact: false }).first().click();

  await expect(
    page.getByRole("heading", { name: matchedEvent.Name, exact: false })
  ).toBeVisible();
}
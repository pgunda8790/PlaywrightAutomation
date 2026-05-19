import { BrowserContext, Page, expect } from '@playwright/test';
import { runSOQL } from '../utils/apiHelper';
import { loginSF } from '../utils/auth';
import registerData from "../data/registration.json";
import { EventRegistrationPage } from '../pages/OrientationEvents/eventRegistrationPage';

export async function validateSessions(context: BrowserContext, attendeePage: Page, userEmail: string) {

  if (!registerData.eventName) {
    throw new Error('eventName is required to filter sessions!');
  }

  // SF context setup inside function
  const sfContext = await context.browser()!.newContext({
    storageState: 'state.json'
  });
  const sfPage = await sfContext.newPage();
  await loginSF(sfPage);

  // Only non-mandatory sessions
  const query = `SELECT conference360__Session__r.Name,
                 conference360__Session__r.conference360__Event__r.Name,
                 conference360__Session__r.zBU_Mandatory__c
                 FROM conference360__Session_Attendee__c 
                 WHERE conference360__Contact__r.Email = '${userEmail}'
                 AND conference360__Registration_Status__c = 'Registered'
                 AND conference360__Session__r.conference360__Event__r.Name = '${registerData.eventName}'
                 AND conference360__Session__r.zBU_Mandatory__c = false`;

  const records = await runSOQL(query, sfPage);
  const sfCount = records.length;

  if (sfCount === 0) {
    await sfPage.close();
    await sfContext.close();
    throw new Error(`No non-mandatory sessions found for event "${registerData.eventName}" and email "${userEmail}"`);
  }

  const fetchedEventName = records[0]?.conference360__Session__r?.conference360__Event__r?.Name;
  console.log(`Event Name: ${fetchedEventName}`);
  console.log(`Total non-mandatory sessions from SF: ${sfCount}`);

  const sfSessionNames = records.map((r: any) => r.conference360__Session__r.Name);
  console.log('SF Session Names:', sfSessionNames);

  // Bring Blackthorn to front
  await attendeePage.bringToFront();

  // Get all checked session names from UI
  const uiLocator = attendeePage.locator(
    `//*[contains(@class,'mat-checkbox-checked')]/ancestor::div[@class='product-item__eventDetails']//h2`
  );

  const uiCount = await uiLocator.count();
  const uiSessionNames = await uiLocator.allTextContents();

  console.log(`Total checked sessions on UI: ${uiCount}`);
  console.log('UI Session Names:', uiSessionNames);

  // Verify count matches
  expect(uiCount).toBe(sfCount);
  console.log(`Count matched — SF: ${sfCount} | UI: ${uiCount}`);

  // Verify each SF session name exists in UI
  for (const sfSession of sfSessionNames) {
    expect(uiSessionNames).toContain(sfSession);
    console.log(`Session matched: "${sfSession}"`);
  }

  console.log('All non-mandatory sessions validated successfully!');

  return sfSessionNames;
}

export async function validateEmergencyContact(sfPage: Page, userEmail: string, expectedName: string, expectedPhone: string) {

  const query = `SELECT zBU_Orientation_Emergency_Contact_Name__c, zBU_Orientation_Emergency_Contact_Phone__c 
                 FROM conference360__Attendee__c 
                 WHERE conference360__Email2__c = '${userEmail}'`;

  const records = await runSOQL(query, sfPage);
  const record = records[0];

  const actualName = record.zBU_Orientation_Emergency_Contact_Name__c;
  const actualPhone = record.zBU_Orientation_Emergency_Contact_Phone__c;

  console.log(`Backend Emergency Contact Name: ${actualName}`);
  console.log(`Backend Emergency Contact Phone: ${actualPhone}`);

  expect(actualName).toBe(expectedName);
  expect(actualPhone).toBe(expectedPhone);

  console.log('✅ Emergency contact details validated successfully');
}

export async function cancellationPageFieldsVisibilityCheck(page: Page) {
  const register = new EventRegistrationPage(page);

  try {
    await expect(register.nameOnCancellation.innerText).toBe(registerData.userName);
    await expect(register.cancellationPageFields.filter({ hasText: 'Event Name:' })).toBeVisible();
    await expect(register.cancellationPageFields.filter({ hasText: 'Event Start Date:' })).toBeVisible();
    await expect(register.cancellationPageFields.filter({ hasText: 'Event End Date:' })).toBeVisible();
    await expect(register.updateInfo).toBeVisible();
    await expect(register.nextSteps).toBeVisible();
    await expect(register.helpFulResources).toBeVisible();
    await expect(register.contactUs).toBeVisible();
    await expect(register.emailVisibility).toBeVisible();
    return true;
  } catch (e) {
    console.log("Some fields in cancellation Screen is not visible");
    return false;
  }
}


export async function cancellationConfirmation(page: Page) {

  // Query 1 — Contact ticket count
  const contactQuery = `SELECT Id, Name,
                        zBU_UGO_Attendee_Count__c,
                        conference360__Events_Attended__c,
                        Email
                        FROM Contact
                        WHERE Email = '${registerData.studentEmail}'
                        AND Name = '${registerData.userName}'`;

  const contactRecords = await runSOQL(contactQuery, page);
  const contact = contactRecords[0];

  console.log(`Attendee Count: ${contact.zBU_UGO_Attendee_Count__c}`);

  // Verify ticket count is 0
  expect(contact.zBU_UGO_Attendee_Count__c).toBe(0);
  console.log(`Ticket count confirmed: 0`);

  // Query 2 — Attendee cancellation details
  const cancellationQuery = `SELECT Id, Name,
                             conference360__Registration_Status__c,
                             zBU_Registration_Cancellation_Reason__c,
                             zBU_Cancellation_Description__c,
                             conference360__Contact__r.Email,
                             conference360__Contact__r.Name
                             FROM conference360__Attendee__c
                             WHERE conference360__Contact__r.Email = '${registerData.studentEmail}'
                             ORDER BY LastModifiedDate DESC
                             LIMIT 1`;

  const attendeeRecords = await runSOQL(cancellationQuery, page);
  const attendee = attendeeRecords[0];

  console.log(`Registration Status: ${attendee.conference360__Registration_Status__c}`);
  console.log(`Cancellation Reason: ${attendee.zBU_Registration_Cancellation_Reason__c}`);
  console.log(`Cancellation Comments: ${attendee.zBU_Cancellation_Description__c}`);

  expect(attendee.conference360__Registration_Status__c).toBe('Cancelled');
  console.log(`Registration Status confirmed: Cancelled`);

  // Verify cancellation reason matches
  expect(attendee.zBU_Registration_Cancellation_Reason__c).toBe(registerData.cancellationComments);
  console.log(`Cancellation reason matched: "${registerData.cancellationComments}"`);

  console.log('Cancellation confirmation completed successfully!');
}
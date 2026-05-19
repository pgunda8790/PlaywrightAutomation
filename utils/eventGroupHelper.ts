import { Page,expect } from '@playwright/test';
import { runSOQL } from './apiHelper';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import { EventRegistrationPage } from '../pages/OrientationEvents/eventRegistrationPage';
import {getFromJson} from '../utils/dataExtracter';
import registerData from "../data/registration.json";

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
  console.log("Sessionnames :" + sessionNames);
  const allSessions = register.allsessions;
  const totalCount = await allSessions.count();
  console.log("Total count " + totalCount);

  for (let i = 0; i < totalCount; i++) {
    const sessionText = (await allSessions.nth(i).innerText()).trim();
    if (sessionNames.includes(sessionText)) {
      const addButton = register.addSessionButton.nth(i);
      if (await addButton.isEnabled()) {
        await addButton.click();
        console.log("Added : " + sessionText);
      }
    }
  }
}

export async function verifyAttendee(page: Page, eventName: string) {
  const email = getFromJson('Email');

  const query = `SELECT 
    conference360__Account_Name__c,
    conference360__Event_Name__c,
    conference360__Email2__c,
    zBU_Dairy_Allergy_Details__c,
    zBU_Dairy_free_Meals__c,
    zBU_Orientation_Emergency_Contact_Name__c,
    zBU_Orientation_Emergency_Contact_Phone__c,
    zBU_Participant_Responsibilities_SignOff__c,
    conference360__Registration_Status__c,
    conference360__First_Name2__c,
    conference360__Last_Name2__c,
    conference360__Attendance_Status__c,
    zBU_Additional_Allergy__c,
    zBU_Additional_Allergy_Details__c,
    zBU_Accommodation_Details__c,
    zBU_Gluten_Free__c,
    zBU_Halal_Meals__c,
    zBU_Kosher_Meals__c,
    zBU_Nut_Allergy__c,
    zBU_Vegan_Meals__c,
    zBU_Vegetarian_Meals__c,
    zBU_Interested_in_a_tour__c
  FROM conference360__Attendee__c
  WHERE conference360__Email2__c = '${email}'
  AND conference360__Event_Name__c LIKE '%${eventName}%'
  AND conference360__Registration_Status__c = 'Registered'`;

  const records = await runSOQL(query, page);

  if (!records || records.length === 0) {
    console.log('No records found for the given email and event name');
    return false;
  }

  const record = records[0];
  console.log('Record found:', JSON.stringify(record, null, 2));

  try {
    expect(record.zBU_Dairy_free_Meals__c).toBe(registerData.diaryfreeMeals);
    expect(record.zBU_Dairy_Allergy_Details__c).toBe(registerData.SpecificationMeal);
    expect(record.zBU_Orientation_Emergency_Contact_Name__c).toBe(registerData.emergencyContactName);
    expect(record.zBU_Orientation_Emergency_Contact_Phone__c).toBe(registerData.emergencyConatactPhone);
    expect(record.zBU_Interested_in_a_tour__c).toBe(registerData.optionalTour);
    expect(record.zBU_Participant_Responsibilities_SignOff__c).toBe(registerData.signatiureName);
    return true;
  } catch (e) {
    console.log('Validation failed:', e);
    return false;
  }
}

export async function studentOrientationEligibilityCheck(page: Page, email: string): Promise<boolean> {
  const query = `SELECT 
      hed__Chosen_Full_Name__c,
      Email,
      zBU_UGO_Attendee_Count__c,
      zBU_Orientation_Eligible__c,
      zBU_Admit_Term__c,
      zBU_Admit_Type_Audience__c,
      zBU_CareerAudience__c,
      zBU_EnrollmentStatusAudience__c,
      zBU_SchoolCollegeAudience__c
    FROM Contact
    WHERE Email = '${email}'
    AND zBU_UGO_Attendee_Count__c = 0
    AND zBU_Orientation_Eligible__c = TRUE
    AND zBU_Admit_Term__c IN ('Spring 2027','Fall 2026')
    AND zBU_Admit_Type_Audience__c = 'Freshman'
    AND zBU_CareerAudience__c = 'Undergraduate'
    AND zBU_SchoolCollegeAudience__c IN ('CAS', 'CGS', 'UPAR')`;

  const records = await runSOQL(query, page);

  if (records.length > 0) {
    console.log(`Eligible student found for email: ${email}`);
    return true;
  } else {
    console.log(`No eligible student found for email: ${email}`);
    return false;
  }
}

export async function clickRequiredEvent(page: Page, eventName: string) {
  const query = `SELECT Name, OwnerID FROM conference360__Event__c`;
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
} // ✅ removed extra closing brace

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
                        AND Name = '${registerData.studentName}'`;

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
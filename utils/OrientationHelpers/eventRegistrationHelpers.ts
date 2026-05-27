import { BrowserContext, Page, expect } from '@playwright/test';
import { runSOQL } from '../apiHelper';
import { loginSF } from '../auth';
import registerData from "../../data/registration.json";
import { EventRegistrationPage } from '../../pages/orientationEvents/eventRegistrationPage';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function addSessions(page: Page) {
  const register = new EventRegistrationPage(page);
  const sessionNames: string[] = registerData.sessionsToAdd;
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

  const query = `SELECT conference360__Session__r.Name,
                 conference360__Session__r.conference360__Event__r.Name,
                 conference360__Session__r.zBU_Mandatory__c
                 FROM conference360__Session_Attendee__c 
                 WHERE conference360__Contact__r.Email = '${userEmail}'
                 AND conference360__Registration_Status__c = 'Registered'
                 AND conference360__Session__r.conference360__Event__r.Name = '${registerData.eventName}'
                 AND conference360__Session__r.zBU_Mandatory__c = false
                 AND conference360__Attendee__r.conference360__Registration_Status__c = 'Registered'`;
   

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


export async function verifyAttendee( page: Page,retries = 5,interval = 30000){
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
  WHERE conference360__Email2__c = '${registerData.studentEmail}'
  AND conference360__Event_Name__c LIKE '%${registerData.orientationFor}%'
  AND conference360__Registration_Status__c = 'Registered'`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`Attempt ${attempt}/${retries}: Querying backend...`);

    
    if (attempt > 1) await sleep(interval);

    const records = await runSOQL(query, page);

    if (!records || records.length === 0) {
      console.log(`Attempt ${attempt}: No records found yet`);
      continue;
    }

    const record = records[0];
    console.log('Record found:', JSON.stringify(record, null, 2));

    
    const unpopulated = [];
    if (record.zBU_Dairy_free_Meals__c !== registerData.diaryfreeMeals) unpopulated.push('zBU_Dairy_free_Meals__c');
    if (record.zBU_Dairy_Allergy_Details__c !== registerData.SpecificationMeal) unpopulated.push('zBU_Dairy_Allergy_Details__c');
    if (record.zBU_Orientation_Emergency_Contact_Name__c !== registerData.emergencyContactName) unpopulated.push('zBU_Orientation_Emergency_Contact_Name__c');
    if (record.zBU_Orientation_Emergency_Contact_Phone__c !== registerData.emergencyConatactPhone) unpopulated.push('zBU_Orientation_Emergency_Contact_Phone__c');
    if (record.zBU_Interested_in_a_tour__c !== registerData.optionalTour) unpopulated.push('zBU_Interested_in_a_tour__c');
    if (record.zBU_Participant_Responsibilities_SignOff__c !== registerData.signatiureName) unpopulated.push('zBU_Participant_Responsibilities_SignOff__c');

    if (unpopulated.length === 0) {
      console.log('All fields validated successfully');
      return true;
    }

    console.log(`Attempt ${attempt}: Fields not yet populated: ${unpopulated.join(', ')}`);
  }

  console.log(`Validation failed after ${retries} attempts`);
  return false;
}

export async function validateEmergencyContact(sfPage: Page, userEmail: string, expectedName: string, expectedPhone: string) {

  const query = `SELECT conference360__Email2__c,zBU_Orientation_Emergency_Contact_Name__c, zBU_Orientation_Emergency_Contact_Phone__c 
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
    const text = await register.nameOnCancellation.innerText();
    expect(text.trim().toLowerCase()).toBe(registerData.userName.trim().toLowerCase());
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


export async function cancellationConfirmation(page: Page,cancellationRsn: String,cancellationComments: String) {

  // Query 1 — Contact ticket count with retry
  const contactQuery = `SELECT Id, Name,
                        zBU_UGO_Attendee_Count__c,
                        conference360__Events_Attended__c,
                        Email
                        FROM Contact
                        WHERE Email = '${registerData.studentEmail}'
                        AND Name = '${registerData.userName}'`;

  let contact: any;
  let retries = 3;

  while (retries > 0) {
    const contactRecords = await runSOQL(contactQuery, page);
    contact = contactRecords[0];

    console.log(`Ticket count: ${contact.zBU_UGO_Attendee_Count__c}`);

    if (contact.zBU_UGO_Attendee_Count__c === 0) break;

    console.log(`Ticket count is ${contact.zBU_UGO_Attendee_Count__c}, retrying in 20 seconds... (${retries} retries left)`);
    await page.waitForTimeout(20000);
    retries--;
  }

  console.log(`Ticket count confirmed: ${contact.zBU_UGO_Attendee_Count__c}`);
  expect(contact.zBU_UGO_Attendee_Count__c).toBe(0);

  // Query 2 — Attendee cancellation details
  const cancellationQuery = `SELECT Id, Name,
                             conference360__Registration_Status__c,
                             zBU_Registration_Cancellation_Reason__c,
                             zBU_Cancellation_Description__c,
                             conference360__Contact__r.Email,
                             conference360__Contact__r.Name
                             FROM conference360__Attendee__c
                             WHERE conference360__Contact__r.Email = 'tst_1612@bu.edu'
                             ORDER BY LastModifiedDate DESC
                             LIMIT 1`;

  const attendeeRecords = await runSOQL(cancellationQuery, page);
  const attendee = attendeeRecords[0];

  console.log(`Registration Status: ${attendee.conference360__Registration_Status__c}`);
  console.log(`Cancellation Reason: ${attendee.zBU_Registration_Cancellation_Reason__c}`);
  console.log(`Cancellation Comments: ${attendee.zBU_Cancellation_Description__c}`);

  expect(attendee.conference360__Registration_Status__c).toBe('Canceled');
  console.log(`Registration Status confirmed: Canceled`);
   // Verify cancellation reason matches
  expect(attendee.zBU_Cancellation_Description__c ?? "").toBe(cancellationComments);
  console.log("Cancellation reason matched");

  expect(attendee.zBU_Cancellation_Description__c).toBe(cancellationComments);

  console.log('Cancellation confirmation completed successfully!');
}

export async function studentOrientationEligibilityCheck(page: Page,email: string,retries = 3,interval = 3000) {

  const terms = registerData.admitTerm.map((t: string) => `'${t}'`).join(',');
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  

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
  AND zBU_Orientation_Eligible__c = true
  AND zBU_Admit_Term__c IN (${terms})
  AND zBU_Admit_Type_Audience__c = 'Freshman'
  AND zBU_CareerAudience__c = 'Undergraduate'
  AND zBU_SchoolCollegeAudience__c IN ('CAS','COM','CGS','UPAR')`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const records = await runSOQL(query, page);

    if (records && records.length > 0) {
      console.log(`Eligible student found for email: ${email}`);
      return true;
    }
    if (attempt < retries) await sleep(interval);
  }

  console.log(`No eligible student found for email: ${email} after ${retries} attempts`);
  return false;
}

export async function validateFieldValidationError(page:Page) 
{
const register = new EventRegistrationPage(page);
await page.waitForLoadState('domcontentloaded');
await register.requiredFieldError.scrollIntoViewIfNeeded();
await expect(register.requiredFieldError).toBeVisible();

}

export async function fillRegistrationDetailsByAttendee(page:Page)

{
  const register = new EventRegistrationPage(page);
await expect(register.userDataAutoFetch).toBeVisible();
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
}



export async function getEventRegisteredCount(page: Page): Promise<number> {
  const query = `SELECT conference360__Registered__c, conference360__Remaining_Capacity__c, conference360__Attendee_Limit__c
    FROM conference360__Event__c
    WHERE Name LIKE '%${registerData.eventName}%'
    LIMIT 1
  `;
  const records = await runSOQL(query, page);
  if (!records || records.length === 0) throw new Error(`Event not found: '%${registerData.eventName}%'`);

  const remaining  = records[0].conference360__Remaining_Capacity__c;



  return remaining;
}

export async function getEventItemCounts(page: Page){
  const query =`SELECT conference360__Item_Name__c,conference360__Remaining_Quantity__c,conference360__Quantity_Made_Available__c
    FROM conference360__Event_Item__c
    WHERE conference360__Event__r.Name LIKE '%${registerData.eventName}%'
    and conference360__Item_Name__c like '%${registerData.ticketName}%'`;
    
  const records = await runSOQL(query, page);
  if (!records || records.length === 0) throw new Error(`Event Item not found: ${registerData.ticketName}`);

  const remaining  = records[0].conference360__Remaining_Quantity__c;

  console.log(`✅ Event Item Remaining :` );

  return remaining;
}
import { Page, expect } from '@playwright/test';
import { runSOQL } from '../apiHelper';
import { EventsPage } from '../../pages/orientationEvents/eventAdminPage';
import { getSFAccessToken } from '../sfJwtAuth';


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function studentOrientationEligibilityCheck(registerData: any, email: string, retries = 3, interval = 3000) {

  const admitTerm: string[] = typeof registerData.admitTerm === 'string'
    ? registerData.admitTerm.split('|').map((t: string) => t.trim())
    : registerData.admitTerm;

  const terms = admitTerm.map((t: string) => `'${t}'`).join(',');

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
    const accessToken = await getSFAccessToken();
    const records = await runSOQL(query, accessToken);

    if (records && records.length > 0) {
      console.log(`Eligible student found for email: ${email}`);
      return true;
    }
    if (attempt < retries) await sleep(interval);
  }

  console.log(`No eligible student found for email: ${email} after ${retries} attempts`);
  return false;
}

export async function clickRequiredEvent(page: Page, eventName: string) {

  const query = `SELECT Name, OwnerID FROM conference360__Event__c`;
  const accessToken = await getSFAccessToken();
  const records = await runSOQL(query, accessToken);

  const matchedEvent = records.find((r: any) =>
    r.Name.toLowerCase().includes(eventName.toLowerCase())
  );

  if (!matchedEvent) {
    throw new Error(`No event found matching: "${eventName}"`);
  }

  console.log(`Event found: ${matchedEvent.Name}`);
  await page.getByText(matchedEvent.Name, { exact: false }).first().click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000);
  await expect(page.getByRole("heading", { name: matchedEvent.Name, exact: false })).toBeVisible();
}

export async function fillRegistrationDetailsByAdmin(page: Page, registerData: any) {

  const event = new EventsPage(page, registerData);
  await event.userSearch.click();
  await event.userSearch.pressSequentially(registerData.userName, { delay: 150 });
  await page.waitForTimeout(3000);
  await expect(event.userResult).toContainText(registerData.userName, { timeout: 10000 });
  await event.userResult.click();
  console.log("Selected the Desired User");

  await event.emailOptIn.waitFor({ state: 'visible', timeout: 10000 });
  await event.emailOptIn.click();

  await expect(event.nextButton).toBeEnabled({ timeout: 10000 });
  await event.nextButton.click();

  // --- Dietary preference section ---
  await event.dietaryPreference.waitFor({ state: 'visible', timeout: 15000 });
  await event.dietaryPreference.click();

  await event.Yes.click();

  await event.dairyFree.waitFor({ state: 'visible', timeout: 10000 });
  await event.dairyFree.click();

  if (!(await event.dairyPreference.isVisible())) {
    await event.dairyFree.click(); // uncheck
    await page.waitForTimeout(500);
    await event.dairyFree.click(); // recheck
  }

  await event.dairyPreference.waitFor({ state: 'visible', timeout: 10000 });
  await expect(event.dairyPreference).toBeEnabled({ timeout: 10000 });
  await event.dairyPreference.fill(registerData.SpecificationMeal);
  console.log("Entered all the food preferences");

  await event.emergencyContactName.waitFor({ state: 'visible', timeout: 10000 });
  await event.emergencyContactName.fill(registerData.emergencyContactName);
  await event.emergencyContactPhone.fill(String(registerData.emergencyConatactPhone));
  await event.optionalTour.click();
  await event.readAndUnderstandInfo.scrollIntoViewIfNeeded();
  await event.readAndUnderstandInfo.fill(registerData.signatiureName);
  console.log("Entered all the additional details for the attendee");
}
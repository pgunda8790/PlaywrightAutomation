import { test, expect, Locator } from '@playwright/test';

import { SalesforceHomePage } from '../pages/salesforcePage';

//const data = require('../data/accountData.json');
import data from '../data/accountData.json';
import { readExcelData } from '../utils/excelReader';

const allData = readExcelData('eventData.xlsx', 'Sheet1') as any[];
const testData = allData.filter(row => row.execute === 'yes');
// Use the saved session
test.use({ storageState: 'state.json' });
for (const data of testData) {
test('Verify Salesforce Login', async ({ page }) => {

  const home = new SalesforceHomePage(page);
  // To Go directly to our Salesforce instance
await page.goto(process.env.orgURL!);

  
  await expect(home.developerEditionElement).toBeVisible();

  console.log('✅ Logged in using stored session');

  //Creating new account

  await home.accountNewCreation.click();

  await home.accountNameField.fill(data.accountName);

  await home.accountPhoneField.fill(String(data.accountPhone));

  await home.accountSaveButton.click();


});

}


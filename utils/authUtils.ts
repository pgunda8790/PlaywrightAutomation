

import { Page, chromium, Locator } from '@playwright/test';
import * as fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

export const STATE_PATH = 'state.json';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import { LoginPage } from '../pages/loginPage';

export async function sessionExists(){
  if (!fs.existsSync(STATE_PATH)) return false;

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();
  const orgURL = process.env.orgURL!;

  try {
  await page.goto(orgURL, { waitUntil: 'load', timeout: 30000 });

  // ✅ keeps polling until title matches or times out
  await page.waitForFunction(
    () => document.title === 'Recently Viewed | Events | Salesforce',
    { timeout: 30000, polling: 1000 } // checks every 1 second
  );

  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);
  const isValid = pageTitle === 'Recently Viewed | Events | Salesforce';
  console.log(`Session valid: ${isValid}`);
  return isValid;
} catch (error) {
  console.log(`Session check failed: ${error}`);
  return false;
} finally {
  await context.close();
}
}

export async function loginAndSaveSession() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const eventPage = new EventGroupPage(page);
  const login = new LoginPage(page);

  try {
    await page.goto(process.env.orgURL!);
    await login.buLoginName.fill(process.env.buLoginName!);
    await login.buPassword.fill(process.env.buPassword!);
    await login.buLoginContinue.click();
    await login.trustBrowser.click();
    
    await page.waitForFunction(
      () => document.title === 'Recently Viewed | Events | Salesforce',
      { timeout: 30000 }
    );

    // ✅ save state only after confirmed login
    await context.storageState({ path: STATE_PATH });
    console.log('Fresh session saved to state.json');

  } catch (error) {
    console.log('Login failed:', error);
    throw error; // ✅ re-throw so global-setup knows it failed
  } finally {
    await context.close();
    await browser.close();
  }
}
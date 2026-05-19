import { Page, chromium, Locator } from '@playwright/test';
import * as fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
export const STATE_PATH = 'state.json';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';
import { LoginPage } from '../pages/loginPage';

export async function sessionExists(page: Page) {
  if (!fs.existsSync(STATE_PATH)) return false;

  const orgURL = process.env.orgURL!;
  try {
    await page.goto(orgURL, { waitUntil: 'load', timeout: 30000 });

    await page.waitForFunction(
      () =>
        document.title.includes('Salesforce') ||
        document.title.toLowerCase().includes('login'),
      { timeout: 20000, polling: 1000 }
    );

    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    if (pageTitle.toLowerCase().includes('login')) {
      console.log('Landed on login page — session invalid, skipping test.');
      return false;
    }

    const isValid = pageTitle === 'Recently Viewed | Events | Salesforce';
    console.log(`Session valid: ${isValid}`);
    return isValid;

  } catch (error) {
    console.log(`Session check failed: ${error}`);
    return false;
  }
  // ✅ No finally block — caller manages page lifecycle
}
export async function loginAndSaveSession(page: Page) {
  const eventPage = new EventGroupPage(page);
  const login = new LoginPage(page);
  try {
    await page.goto(process.env.orgURL!);
    await login.buLoginName.fill(process.env.buLoginName!);
    await login.buPassword.fill(process.env.buPassword!);
    await login.buLoginContinue.click();
    await login.trustBrowser.click();

    await page.waitForFunction(
      () =>
        document.title.includes('Salesforce') ||
        document.title.toLowerCase().includes('login'),
      { timeout: 60000 }
    );

    const pageTitle = await page.title();
    if (pageTitle.toLowerCase().includes('login')) {
      throw new Error('Login failed — still on login page after attempting login.');
    }

    await page.context().storageState({ path: STATE_PATH });
    console.log('Fresh session saved to state.json');

  } catch (error) {
    console.log('Login failed:', error);
    throw error;
  }
}
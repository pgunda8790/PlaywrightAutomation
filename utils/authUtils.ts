import { Page } from '@playwright/test';
import * as fs from 'fs';
import { LoginPage } from '../pages/loginPage';

export const STATE_PATH = 'state.json';

export async function loginSF(page: Page) {
  const login = new LoginPage(page);

  console.log('--- Checking Session ---');

  if (fs.existsSync(STATE_PATH)) {
    const orgURL = process.env.orgURL!;
    try {
      await page.goto(orgURL, { waitUntil: 'load', timeout: 30000 });

      await page.waitForFunction(
        () =>
          document.title.includes('Recently Viewed | Events | Salesforce') ||
          document.title.toLowerCase().includes('login'),
        { timeout: 20000, polling: 1000 }
      );

      const pageTitle = await page.title();

      if (!pageTitle.toLowerCase().includes('login')) {
        const isValid = pageTitle === 'Recently Viewed | Events | Salesforce';
        if (isValid) {
          console.log('Session exists: true — skipping login');
          return;
        }
      }

      console.log('Session exists: false — Starting Fresh Login');
    } catch (error) {
      console.log(`Session check failed: ${error} — Starting Fresh Login`);
    }
  } 

  try {
    
    await page.goto(process.env.LoginURL!);
    await login.username.fill(process.env.buLoginName!);
    await login.password.fill(process.env.buPassword!);
    await login.loginSandbox.click();

    await page.waitForFunction(
      () =>
        document.title.includes('Recently Viewed | Accounts | Salesforce') ||
        document.title.toLowerCase().includes('login'),
      { timeout: 60000 }
    );

    const pageTitle = await page.title();
    if (pageTitle.toLowerCase().includes('login')) {
      throw new Error('Login failed — still on login page after attempting login.');
    }

    await page.context().storageState({ path: STATE_PATH });
    console.log('--- Login Complete | Session saved to state.json ---');

  } catch (error) {
    console.log('Login failed:', error);
    throw error;
  }
}


import { Page, chromium, Locator } from '@playwright/test';
import * as fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

export const STATE_PATH = 'state.json';
import { EventGroupPage } from '../pages/OrientationEvents/eventGroupPage';

export async function sessionExists(){
  if (!fs.existsSync(STATE_PATH)) return false;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();
  const orgURL = process.env.orgURL!;

  try {
  await page.goto(orgURL, {
    waitUntil: 'domcontentloaded',
    timeout: 10000,
  });

  const appLauncher = await page.locator("//button[@title='App Launcher']").isVisible();
  return appLauncher;
} catch {
  return false;
} finally {
  await browser.close(); // always closes, whether true, false, or error
}
}

export async function loginAndSaveSession() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const eventPage = new EventGroupPage(page);
  

  const username = process.env.MY_PERSONAL_USERNAME!;
  const password = process.env.MY_PERSONAL_PASSWORD!;
  const orgURL = process.env.orgURL!;
try{
  await page.goto(orgURL);
  //await eventPage.buLoginName.fill(process.env.buLoginName!);
  //await eventPage.buPassword.fill(process.env.buPassword!);
  //await eventPage.buLoginContinue.click();
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.click('#Login');
}
catch
{
 console.log('Login skipped');
}
  await page.waitForURL('**/lightning/**',{ timeout: 100000 });

  await context.storageState({ path: STATE_PATH });
  await context.close();
  await browser.close();
  console.log('Fresh session saved to state.json');
}
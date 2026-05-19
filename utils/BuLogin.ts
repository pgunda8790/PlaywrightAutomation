import { Page } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import * as fs from 'fs';
import { error } from 'console';


export async function userLoginByPassMFA(page: Page) {


  const login = new LoginPage(page);
  try
  {
  await login.buLoginName.fill(process.env.BUTestUser!);
  await login.buPassword.fill(process.env.BUTestPassword!);
  await login.buLoginContinue.click();
  await login.bypassCode.fill(process.env.BUPasscode!);
  await login.verifyCode.click();
  await login.trustBrowser.click();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await login.homePage.waitFor({ state: 'visible' });
  }
  catch{
    console.log(error);
  }

}
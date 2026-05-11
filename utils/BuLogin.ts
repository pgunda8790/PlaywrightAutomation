import { Page } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';

export async function userLoginByPassMFA(page:Page){

const login = new LoginPage(page);

await login.buLoginName.fill(process.env.BUTestUser!);
await login.buPassword.fill(process.env.BUTestPassword!);
await login.buLoginContinue.click();
await login.bypassCode.fill(process.env.BUPasscode!);
await login.verifyCode.click();
await login.trustBroser.click();
await page.waitForLoadState('networkidle', { timeout: 60000 });

await login.welcomeText.waitFor({ state: 'visible'});

}
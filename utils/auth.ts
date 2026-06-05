import { Page } from '@playwright/test';
import { getSFAccessToken } from './sfJwtAuth';


export async function loginSF(page:Page) {
  const accessToken = await getSFAccessToken();
  await page.goto(
    `${process.env.orgURL}/secur/frontdoor.jsp?sid=${accessToken}`
  );
  await page.waitForLoadState('domcontentloaded');
  console.log('Logged into Salesforce via JWT ✅');
}
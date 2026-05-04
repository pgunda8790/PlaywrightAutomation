// utils/apiHelper.ts
import { Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const instanceUrl = process.env.OrgURL!;

// Get Access Token from Playwright session cookies
export async function getAccessToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const sid = cookies.find(c => c.name === 'sid');
  if (!sid?.value) throw new Error('Access token (sid cookie) not found. Are you logged in?');

  // Salesforce sid cookie format is "ORGID!TOKEN"
  // The REST API only accepts the token part after "!"
  const accessToken = sid.value.includes('!')
    ? sid.value.split('!')[1]
    : sid.value;

  console.log('Access Token retrieved.');
  return accessToken;
}

export async function runSOQL(soqlQuery: string, page: Page) {
  const accessToken = await getAccessToken(page);
  const url = `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(soqlQuery)}`;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const response = await page.context().request.get(url, { headers });

    if (!response.ok()) {
    const body = await response.text();
    throw new Error(
      `SOQL request failed [${response.status()}]:\nURL: ${url}\nResponse: ${body.substring(0, 500)}`
    );
  }

  const contentType = response.headers()['content-type'] ?? '';
  if (!contentType.includes('application/json')) {
    const body = await response.text();
    throw new Error(
      `Expected JSON but got "${contentType}".\nThis usually means your session expired or OrgURL is wrong.\nResponse: ${body.substring(0, 300)}`
    );
  }

  const { records } = await response.json();
  return records;
  
}
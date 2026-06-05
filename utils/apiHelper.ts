// utils/apiHelper.ts
import { Page } from '@playwright/test';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const instanceUrl = process.env.OrgURL!;

export async function getAccessToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const sid = cookies.find(c => c.name === 'sid');
  if (!sid?.value) throw new Error('Access token (sid cookie) not found. Are you logged in?');

  const accessToken = sid.value.includes('!')
    ? sid.value.split('!')[1]
    : sid.value;
  return accessToken;
}

export async function runSOQL(soqlQuery: string, accessToken: string) {
  const url = `${process.env.orgURL}/services/data/v59.0/query?q=${encodeURIComponent(soqlQuery)}`;
  
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.records;
}
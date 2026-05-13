import { Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.resolve(__dirname, '../data/extractedData.json');

export async function saveToJson(fields: Record<string, Locator>): Promise<void> {

  // Read existing data if file exists
  let existingData: Record<string, string> = {};
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    existingData = JSON.parse(raw);
  }

  // Extract inner text / value for each locator
  for (const [key, locator] of Object.entries(fields)) {
    const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());
    existingData[key] = tagName === 'input' || tagName === 'textarea'
      ? await locator.inputValue()
      : await locator.innerText();
  }

  // Write merged data back to file
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));

  console.log('Data saved:', existingData);
}

export function getFromJson(key: string): string {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Data file not found. Run saveToJson first.`);
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (!(key in data)) {
    throw new Error(`Key "${key}" not found in data file.`);
  }
  return data[key];
}
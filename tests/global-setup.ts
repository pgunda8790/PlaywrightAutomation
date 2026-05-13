/*import dotenv from 'dotenv';
import { sessionExists, loginAndSaveSession } from '../utils/auth';
dotenv.config();

export default async function globalSetup(): Promise<void> {
  if (await sessionExists()) {
    console.log('⚡ Session found and fresh — skipping login');
    return;
  }

  console.log('🔐 No valid session — logging in fresh...');
  await loginAndSaveSession();
}
  */

import dotenv from 'dotenv';
import { sessionExists, loginAndSaveSession } from '../utils/authUtils';
dotenv.config();

export default async function globalSetup(): Promise<void> {
  console.log('orgURL:', process.env.orgURL!);           // ← confirm env loads
  console.log('state.json exists:', require('fs').existsSync('state.json')); // ← confirm file found

  if (await sessionExists()) {
    console.log('⚡ Session found and fresh — skipping login');
    return;
  }

  console.log('🔐 No valid session — logging in fresh...');
  await loginAndSaveSession();
}
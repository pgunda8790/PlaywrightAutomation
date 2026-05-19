import { test } from '@playwright/test';
import { loginSF } from '../utils/auth';
import dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

test.use({ storageState: fs.existsSync('state.json') ? 'state.json' : undefined });

test('Debug Login @Test', async ({ page }) => {
  await loginSF(page);
});
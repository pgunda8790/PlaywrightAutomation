import { test as base } from '@playwright/test';
import { sessionExists, loginAndSaveSession, STATE_PATH } from './authUtils';

export const test = base.extend({
  page: async ({ browser, browserName }, use) => {
    console.log(`Running on browser: ${browserName}`);

    const isValid = await sessionExists(browser);

    if (!isValid) {
      console.log(`No valid session for ${browserName}, logging in...`);
      await loginAndSaveSession(browser); // ✅ uses browser from --project flag
    }

    const context = await browser.newContext({ storageState: STATE_PATH });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});

export { expect } from '@playwright/test';
import { test, expect } from '../utils/fixtures';

test.use({ storageState: 'state.json' });
test('Your test', async ({ page }) => {
  await page.goto(process.env.orgURL!);
  await page.pause();
});
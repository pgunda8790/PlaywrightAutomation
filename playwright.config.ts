import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  testDir: './tests',
  timeout:300000,

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
//
 reporter: [
    ['html', { open: 'always', outputFolder: `reports/html-report-${timestamp}` }],
    ['allure-playwright', { resultsDir: `reports/allure-results-${timestamp}` }],
  ],

  //globalSetup: './tests/global-setup.ts',

  use: {
    trace: 'on-first-retry',
    screenshot: 'on', //only-on-failure
    video: 'on', //retain-on-failure
    
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
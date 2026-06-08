import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import environments from './config/environments.json';

dotenv.config();

type EnvName = keyof typeof environments;

const TARGET_ENV = (process.env.TEST_ENV || 'sptest') as EnvName;
const envConfig = environments[TARGET_ENV];

if (!envConfig) {
  throw new Error(`Unknown env: "${TARGET_ENV}". Valid: ${Object.keys(environments).join(', ')}`);
}

process.env.sfConnectionURL = envConfig.sfConnectionURL;
process.env.LoginURL        = envConfig.LoginURL;
process.env.orgURL          = envConfig.orgURL;
process.env.MY_BU_PORTAL    = envConfig.MY_BU_PORTAL;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  testDir: './tests',
  timeout: 120000,

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,

  reporter: [
    ['html', { open: 'never', outputFolder: `reports/html-report-${timestamp}` }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],

  //globalSetup: './tests/global-setup.ts',

  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    navigationTimeout: 30000,
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

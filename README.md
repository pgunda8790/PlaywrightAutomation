# BU Orientation Events - Playwright Automation Suite

End-to-end test automation for Boston University's Orientation Events registration system built on Salesforce. Covers admin registration workflows, student-facing registration, event group management, and backend validation via SOQL.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [Test Reports](#test-reports)
- [CI/CD](#cicd)
- [Architecture](#architecture)

---

## Overview

This suite automates three core workflows for the BU Orientation Events application:

| Test Suite | Description |
|---|---|
| `orientationEvent.spec.ts` | Creates/clones orientation event groups for the current academic year |
| `orientationAdmin.spec.ts` | Admin-side attendee registration and verification |
| `orientationRegistration.spec.ts` | Student-side registration, session selection, and cancellation |

Tests run serially and validate both the UI and backend (via Salesforce SOQL API) to ensure end-to-end data integrity.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Playwright](https://playwright.dev) | ^1.58.2 | E2E browser automation |
| TypeScript | ^6.0.2 | Type-safe test authoring |
| [Allure](https://allurereport.org) | ^2.30.0 | Rich test reporting |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | ^9.0.3 | Salesforce JWT OAuth flow |
| axios | ^1.17.0 | SOQL REST API queries |
| xlsx | ^0.18.5 | Excel test data reader |
| dotenv | ^17.4.2 | Environment variable management |

---

## Project Structure

```
Projects/
├── .github/workflows/
│   └── playwright.yml          # GitHub Actions CI/CD pipeline
├── config/
│   └── environments.json       # Per-environment URL config (sptest / ueptest)
├── pages/                      # Page Object Model (POM)
│   ├── loginPage.ts            # BU portal login page
│   └── orientationEvents/
│       ├── attendeeLinkPage.ts # Attendee portal page
│       ├── eventAdminPage.ts   # Admin event management page
│       ├── eventGroupPage.ts   # Event group creation page
│       └── eventRegistrationPage.ts # Student registration page
├── tests/
│   ├── global-setup.ts         # Global test setup
│   └── orientationSmoke/
│       ├── orientationAdmin.spec.ts        # Admin registration tests
│       ├── orientationEvent.spec.ts        # Event group tests
│       └── orientationRegistration.spec.ts # Student registration tests
├── utils/
│   ├── auth.ts                 # Salesforce JWT login (frontdoor.jsp)
│   ├── authUtils.ts            # Session validation utilities
│   ├── sfJwtAuth.ts            # JWT bearer token exchange with Salesforce
│   ├── BuLogin.ts              # BU portal login with MFA bypass
│   ├── apiHelper.ts            # SOQL query execution via REST API
│   ├── flowStateManager.ts     # Cross-test pass/fail state persistence
│   ├── dataExtracter.ts        # JSON data persistence between tests
│   ├── excelReader.ts          # Excel test data reader
│   └── OrientationHelpers/
│       ├── eventAdminHelpers.ts         # Admin workflow helpers
│       ├── eventGroupHelper.ts          # Event group helpers
│       └── eventRegistrationHelpers.ts  # Registration validation helpers
├── data/
│   ├── registration.json           # Core test configuration data
│   ├── orientation_test_data.xlsx   # Excel-based test data
│   └── extractedData.json          # Runtime data passed between tests
├── adminFlowState.json         # Runtime: admin test pass/fail state
├── studentFlowState.json       # Runtime: student test pass/fail state
├── server.key                  # Salesforce connected-app private key (not committed)
├── scripts/
│   └── test-with-allure.js     # Allure report generation script
├── .env.example                # Environment variable template
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## Prerequisites

| Tool | Version | Download |
|------|---------|---------|
| Node.js | 18+ LTS | https://nodejs.org |
| Java JDK | 11+ | https://adoptium.net (required by Allure CLI) |
| Git | latest | https://git-scm.com |

Verify your setup:
```bash
node --version    # must be 18+
java --version    # must be 11+
git --version
```

- Access to BU Salesforce sandbox environments (`sptest` or `ueptest`)
- A Salesforce Connected App configured for JWT Bearer OAuth
- BU portal credentials with MFA passcode

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd "PlayWright Automation/Projects"

# 2. Install dependencies
npm ci

# 3. Install Playwright browsers
npx playwright install

# 4. Configure environment variables (see below)
cp .env.example .env

# 5. Place the Salesforce private key (do NOT commit this file)
# Copy your connected-app private key to:
#   server.key   (project root)
```

---

## Environment Configuration

### Target environment

The active Salesforce sandbox is selected via the `TEST_ENV` variable. Available values are defined in `config/environments.json`:

| `TEST_ENV` | Salesforce sandbox |
|---|---|
| `sptest` (default) | `bostonuniversity-b--sptest` |
| `ueptest` | `bostonuniversity-b--ueptest` |

### `.env` file

Copy `.env.example` to `.env` and fill in all required values:

```env
# Target environment: sptest | ueptest  (defaults to sptest)
TEST_ENV=sptest

# Salesforce JWT OAuth – Connected App credentials
SF_CLIENT_ID=your_connected_app_consumer_key
SF_USERNAME=your_sf_username

# BU Portal credentials (student-side tests)
BULoginName=your_bu_login
BUTestPassword=your_bu_password
BUPasscode=your_mfa_passcode
```

> **Never commit `.env` or `server.key` to source control.** Both are listed in `.gitignore`.

The `config/environments.json` file contains all sandbox URLs and is safe to commit — it holds no secrets.

---

## Running Tests

### All tests (headless, default env)
```bash
npm test
```

### Target a specific environment
```bash
TEST_ENV=ueptest npx playwright test
```

### Specific browser (headed)
```bash
npm run test:chromium
npm run test:firefox
```

### All browsers (headed)
```bash
npm run test:all
```

### With Allure report generation
```bash
npm run test:allure
```

### Run a specific test file
```bash
npx playwright test tests/orientationSmoke/orientationAdmin.spec.ts
```

### Run tests matching a title
```bash
npx playwright test --grep "Register attendee"
```

---

## Test Reports

### HTML Report (built-in Playwright)
After a test run:
```bash
npx playwright show-report
```

### Allure Report
```bash
# Generate report from results
npm run allure:generate

# Open in browser
npm run allure:open

# Serve live (auto-opens browser)
npm run allure:serve

# Clean all reports
npm run clean:reports
```

Reports are written to:
- `reports/allure-results/` — raw results
- `reports/allure-report/` — generated HTML report
- `reports/html-report-<timestamp>/` — timestamped Playwright HTML reports

---

## CI/CD

GitHub Actions pipeline is defined in [.github/workflows/playwright.yml](.github/workflows/playwright.yml).

**Triggers:**
- **Scheduled:** Every Monday at 9:30 AM IST (04:00 UTC) — runs all tests against the default environment
- **Manual (`workflow_dispatch`):** Trigger a run from the GitHub Actions UI with optional inputs:

| Input | Description | Default |
|---|---|---|
| `spec_file` | Path relative to `tests/` to run a single spec (leave blank for all) | _(all tests)_ |
| `browser` | Browser to use: `chromium`, `firefox`, `webkit` | `chromium` |
| `headed` | Run in headed mode (routed through `xvfb`) | `false` |

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `SF_CLIENT_ID` | Salesforce Connected App consumer key |
| `SF_USERNAME` | Salesforce username for JWT auth |
| `BUTESTPASSWORD` | BU portal password |
| `BUPASSCODE` | BU portal MFA passcode |

**Pipeline steps:**
1. Checkout code
2. Setup Node.js (LTS) with npm cache
3. `npm ci` — install dependencies
4. Install selected Playwright browser + system deps
5. Run tests (headless or headed via xvfb)
6. Generate Allure report
7. Upload Allure report artifact (30-day retention, named with browser + date + run number)
8. Upload Playwright HTML report artifact (30-day retention)

---

## Architecture

### Page Object Model (POM)
All UI interactions are encapsulated in page classes under `pages/`. Tests never use raw selectors — they call page methods, making tests resilient to selector changes.

### Multi-Environment Config
`config/environments.json` defines the full set of URLs for each sandbox. `playwright.config.ts` reads `TEST_ENV` at startup, resolves the matching config block, and injects the URLs as `process.env` variables (`sfConnectionURL`, `LoginURL`, `orgURL`, `MY_BU_PORTAL`). Switching environments requires only changing `TEST_ENV` — no code changes needed.

### Salesforce JWT Authentication
`utils/sfJwtAuth.ts` performs a JWT bearer token exchange with Salesforce using a Connected App private key (`server.key`). `utils/auth.ts` uses the resulting access token to log in via `frontdoor.jsp`, bypassing the interactive login page entirely. This approach is CI-friendly and requires no stored passwords for Salesforce.

### Flow State Manager
`utils/flowStateManager.ts` provides a lightweight file-based state store (`adminFlowState.json`, `studentFlowState.json`) that persists pass/fail outcomes across test steps. Later tests can conditionally skip or assert based on whether an upstream step succeeded, preventing cascading failures from masking root causes.

### SOQL Validation
Tests validate UI actions against the Salesforce backend using SOQL queries via the `apiHelper.ts` module (Salesforce REST API + axios). This confirms records are correctly created/updated in the database, not just in the UI.

### Test Data
- **`registration.json`** — static test configuration (student email, event name, ticket, sessions, etc.)
- **`orientation_test_data.xlsx`** — row-based test data; only rows with `execute = 'yes'` are processed
- **`extractedData.json`** — runtime data store for passing values (e.g., record IDs) between test steps

### Serial Execution
Tests within each spec use `test.describe.serial()` to enforce sequential execution. This is required because later tests depend on state created by earlier ones (e.g., a registration must exist before it can be cancelled).

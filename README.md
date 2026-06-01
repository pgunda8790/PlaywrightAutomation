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
| [jsforce](https://jsforce.github.io) | ^3.10.14 | Salesforce API / SOQL queries |
| xlsx | ^0.18.5 | Excel test data reader |
| dotenv | ^17.4.2 | Environment variable management |

---

## Project Structure

```
Projects/
├── .github/workflows/
│   └── playwright.yml          # GitHub Actions CI/CD pipeline
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
│   ├── auth.ts                 # Salesforce session management
│   ├── authUtils.ts            # Session validation utilities
│   ├── BuLogin.ts              # BU portal login with MFA bypass
│   ├── apiHelper.ts            # SOQL query execution
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

- Access to BU Salesforce sandbox environments
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
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in all required values:

```env
# Salesforce Admin Credentials
MY_USERNAME=your_sf_username
MY_PASSWORD=your_sf_password

# Salesforce Org URLs
orgURL=https://bostonuniversity-b--sptest.sandbox.my.salesforce-setup.com/lightning/
SPTestURL=<sandbox url>
UEPTestURL=<sandbox url>

# BU Portal Credentials (for student-side tests)
BULoginName=your_bu_login
BuPassword=your_bu_password
BUPasscode=your_mfa_passcode
```

> **Never commit `.env` to source control.** It is listed in `.gitignore`.

---

## Running Tests

### All tests (headless)
```bash
npm test
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

---

## CI/CD

GitHub Actions pipeline is defined in [.github/workflows/playwright.yml](.github/workflows/playwright.yml).

**Triggers:** Push or PR to `main` / `master`

**Pipeline steps:**
1. Checkout code
2. Setup Node.js (LTS)
3. `npm ci` — install dependencies
4. Install Playwright browsers
5. Run all tests
6. Generate Allure report
7. Upload Allure report artifact (30-day retention)
8. Upload Playwright HTML report artifact (30-day retention)

---

## Architecture

### Page Object Model (POM)
All UI interactions are encapsulated in page classes under `pages/`. Tests never use raw selectors — they call page methods, making tests resilient to selector changes.

### Session Persistence
Salesforce sessions are cached in `state.json` after the first login. Subsequent tests reuse the session, skipping re-authentication. The session is validated before each use and refreshed automatically if expired.

### SOQL Validation
Tests validate UI actions against the Salesforce backend using SOQL queries via the `apiHelper.ts` module. This confirms records are correctly created/updated in the database, not just in the UI.

### Test Data
- **`registration.json`** — static test configuration (student email, event name, ticket, sessions, etc.)
- **`orientation_test_data.xlsx`** — row-based test data; only rows with `execute = 'yes'` are processed
- **`extractedData.json`** — runtime data store for passing values (e.g., record IDs) between test steps

### Serial Execution
Tests within each spec use `test.describe.serial()` to enforce sequential execution. This is required because later tests depend on state created by earlier ones (e.g., a registration must exist before it can be cancelled).

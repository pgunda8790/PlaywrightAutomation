# BU Orientation Events — Playwright Automation Suite

End-to-end test automation for Boston University's Orientation Events registration system built on Salesforce. Covers admin registration workflows, student-facing registration, event group management, and backend validation via SOQL.

---

## Table of Contents

- [C1: System Context](#c1-system-context)
- [C2: Container Diagram](#c2-container-diagram)
- [C3: Component Diagrams](#c3-component-diagrams)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [Test Reports](#test-reports)
- [CI/CD](#cicd)

---

## C1: System Context

> Who interacts with the system and what external systems does it depend on?

```mermaid
C4Context
    title System Context — BU Orientation Automation

    Person(qa, "QA Engineer", "Runs tests locally or triggers them via GitHub Actions UI")

    System(automation, "BU Orientation Playwright Suite", "E2E automation suite — validates orientation event creation, admin registration, and student registration flows")

    System_Ext(sf, "Salesforce Sandbox", "Boston University CRM and event management platform. Hosts Contacts, Events, Tickets, Sessions. Available sandboxes: sptest / ueptest.")
    System_Ext(portal, "BU Student Portal", "Salesforce Experience Cloud site. Student-facing registration interface backed by Salesforce data.")
    System_Ext(blackthorn, "Blackthorn Events", "Third-party event registration platform embedded via iframe inside the BU Student Portal.")
    System_Ext(github, "GitHub Actions", "CI/CD platform. Runs the suite on a weekly Monday schedule or on manual workflow_dispatch trigger.")

    Rel(qa, automation, "Triggers tests via npm scripts or GitHub UI")
    Rel(automation, sf, "JWT OAuth login + SOQL REST API validation", "HTTPS")
    Rel(automation, portal, "Browser automation via Playwright", "HTTPS")
    Rel(portal, blackthorn, "Embeds registration UI", "iframe / HTTPS")
    Rel(github, automation, "Executes on schedule or manual dispatch")
```

---

## C2: Container Diagram

> What are the major deployable/runnable units inside the suite and how do they interact?

```mermaid
C4Container
    title Container Diagram — BU Orientation Playwright Suite

    Person(qa, "QA Engineer")

    System_Boundary(suite, "Playwright Automation Suite") {
        Container(runner, "Test Runner", "Playwright + TypeScript", "Discovers and executes E2E specs. Enforces serial ordering, retry logic, and timeout management.")
        Container(pages, "Page Objects (POM)", "TypeScript classes", "Encapsulates all UI selectors and screen interactions. Tests call named methods, never raw locators.")
        Container(utils, "Test Utilities", "TypeScript modules", "Authentication flows, SOQL queries, cross-test state tracking, runtime data persistence, and Excel reading.")
        Container(helpers, "Domain Helpers", "TypeScript modules", "Orientation-specific workflow helpers: eligibility checks, session validation, admin form filling.")
        Container(data, "Test Data Store", "JSON + XLSX files", "Static config (registration.json), Excel-driven rows (orientation_test_data.xlsx), runtime values (extractedData.json).")
        Container(config, "Environment Config", "environments.json + .env", "Sandbox URLs per environment. TEST_ENV variable switches between sptest and ueptest without code changes.")
        Container(ci, "CI Pipeline", "GitHub Actions", "Weekly schedule (Monday 9:30 AM IST) and manual dispatch. Uploads Allure and HTML reports as 30-day artifacts.")
        Container(reporting, "Reporting", "Allure + Playwright HTML", "Generates rich reports with per-test screenshots, video recordings, and step traces on failure.")
    }

    System_Ext(sf, "Salesforce Sandbox", "BU CRM — REST API + OAuth endpoint")
    System_Ext(portal, "BU Student Portal", "Salesforce Experience + Blackthorn iframe")

    Rel(qa, runner, "npm test / npx playwright test")
    Rel(qa, ci, "Manual trigger via GitHub Actions UI")
    Rel(ci, runner, "npx playwright test (headless or xvfb)")
    Rel(runner, pages, "UI interactions")
    Rel(runner, utils, "Auth, validation, state, data")
    Rel(runner, helpers, "Domain workflow steps")
    Rel(runner, data, "Reads test inputs / writes runtime values")
    Rel(runner, config, "Resolves sandbox URLs and credentials")
    Rel(runner, reporting, "Emits Allure results and HTML report")
    Rel(utils, sf, "JWT OAuth + SOQL REST API", "HTTPS")
    Rel(pages, portal, "Playwright browser automation", "HTTPS")
```

---

## C3: Component Diagrams

> What are the key components inside each container?

### Test Utilities

```mermaid
C4Component
    title Components — Test Utilities

    Container_Boundary(utils, "Test Utilities") {
        Component(sfJwtAuth, "sfJwtAuth.ts", "JWT Token Exchange", "Signs an RS256 JWT with server.key and exchanges it for a Salesforce access token via the OAuth token endpoint.")
        Component(auth, "auth.ts", "Salesforce Session Login", "Uses the access token to open a Salesforce session via frontdoor.jsp — no interactive login, fully CI-compatible.")
        Component(buLogin, "BuLogin.ts", "BU Portal Login", "Fills BU portal username and password, submits the MFA passcode bypass, and marks the browser as trusted.")
        Component(apiHelper, "apiHelper.ts", "SOQL REST Client", "Runs SOQL SELECT queries against the Salesforce REST API via axios to confirm UI actions persisted in the database.")
        Component(flowState, "flowStateManager.ts", "Flow State Manager", "Reads and writes adminFlowState.json / studentFlowState.json so later serial tests can skip when an upstream step fails.")
        Component(dataEx, "dataExtracter.ts", "Runtime Data Store", "Saves and retrieves dynamic values (event names, record IDs) via extractedData.json to pass data between test steps.")
        Component(excelReader, "excelReader.ts", "Excel Reader", "Reads rows from XLSX data files and returns only rows where the execute column equals 'yes'.")
    }

    Container_Ext(runner, "Test Runner")
    System_Ext(sfApi, "Salesforce REST API")

    Rel(runner, sfJwtAuth, "Obtain access token at test start")
    Rel(runner, auth, "Login to Salesforce org")
    Rel(runner, buLogin, "Login to BU Student Portal")
    Rel(runner, apiHelper, "Validate backend records via SOQL")
    Rel(runner, flowState, "Track pass/fail state across test steps")
    Rel(runner, dataEx, "Pass runtime values between steps")
    Rel(runner, excelReader, "Load Excel-driven test data")
    Rel(sfJwtAuth, sfApi, "JWT bearer grant (RS256)", "HTTPS")
    Rel(apiHelper, sfApi, "SOQL queries via REST", "HTTPS")
```

### Page Objects

```mermaid
C4Component
    title Components — Page Objects (POM)

    Container_Boundary(pages, "Page Objects") {
        Component(loginPage, "loginPage.ts", "BU Portal Login", "Selectors for username, password, MFA passcode input, and Continue / Submit buttons.")
        Component(eventGroupPage, "eventGroupPage.ts", "Event Group Management", "Selectors for the Event Groups tab, clone workflow, and default event group checkbox.")
        Component(eventAdminPage, "eventAdminPage.ts", "Admin Event Management", "Selectors for the Events tab, ticket type picker, and the admin attendee registration form fields.")
        Component(eventRegPage, "eventRegistrationPage.ts", "Student Registration", "Selectors inside the Blackthorn iframe: session picker, registration form, emergency contact fields.")
        Component(attendeePage, "attendeeLinkPage.ts", "Attendee Portal", "Selectors for the Agenda view, session list, QR code display, and Add to Calendar button.")
    }

    Container_Ext(runner, "Test Runner")

    Rel(runner, loginPage, "Authenticate into BU Portal")
    Rel(runner, eventGroupPage, "Create or clone annual event groups")
    Rel(runner, eventAdminPage, "Register attendees as admin")
    Rel(runner, eventRegPage, "Register and manage student sessions")
    Rel(runner, attendeePage, "Verify post-registration attendee view")
```

### Domain Helpers

```mermaid
C4Component
    title Components — Domain Helpers (OrientationHelpers)

    Container_Boundary(helpers, "Domain Helpers") {
        Component(adminHelpers, "eventAdminHelpers.ts", "Admin Workflow", "Checks student eligibility in Salesforce, looks up events by name, fills the admin registration form end-to-end.")
        Component(groupHelpers, "eventGroupHelper.ts", "Event Group Workflow", "Checks whether an event group record already exists, triggers the clone action, and unchecks default flags.")
        Component(regHelpers, "eventRegistrationHelpers.ts", "Registration Workflow", "Validates selected sessions match backend records, updates emergency contact, confirms cancellation dialogs.")
    }

    Container_Ext(runner, "Test Runner")

    Rel(runner, adminHelpers, "Admin registration flow steps")
    Rel(runner, groupHelpers, "Event group setup steps")
    Rel(runner, regHelpers, "Student registration flow steps")
```

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
│   └── playwright.yml                      # GitHub Actions CI/CD pipeline
├── config/
│   └── environments.json                   # Sandbox URLs per environment
├── pages/                                  # Page Object Model
│   ├── loginPage.ts
│   └── orientationEvents/
│       ├── attendeeLinkPage.ts
│       ├── eventAdminPage.ts
│       ├── eventGroupPage.ts
│       └── eventRegistrationPage.ts
├── tests/
│   └── orientationSmoke/
│       ├── orientationAdmin.spec.ts         # Admin registration (4 serial tests)
│       ├── orientationEvent.spec.ts         # Event group creation/clone (1 test)
│       └── orientationRegistration.spec.ts  # Student registration (6 serial tests)
├── utils/
│   ├── auth.ts                             # Salesforce frontdoor.jsp login
│   ├── authUtils.ts                        # Session validation utilities
│   ├── sfJwtAuth.ts                        # JWT token generation and exchange
│   ├── BuLogin.ts                          # BU portal login with MFA bypass
│   ├── apiHelper.ts                        # SOQL REST API client
│   ├── flowStateManager.ts                 # Cross-test pass/fail state
│   ├── dataExtracter.ts                    # Runtime JSON data persistence
│   ├── excelReader.ts                      # Excel test data reader
│   └── OrientationHelpers/
│       ├── eventAdminHelpers.ts
│       ├── eventGroupHelper.ts
│       └── eventRegistrationHelpers.ts
├── data/
│   ├── registration.json                   # Static test configuration
│   ├── orientation_test_data.xlsx           # Excel-driven test data
│   └── extractedData.json                  # Runtime values passed between tests
├── adminFlowState.json                     # Runtime: admin test pass/fail state
├── studentFlowState.json                   # Runtime: student test pass/fail state
├── server.key                              # Salesforce private key (NOT committed)
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ LTS | [nodejs.org](https://nodejs.org) |
| Java JDK | 11+ | Required by Allure CLI — [adoptium.net](https://adoptium.net) |
| Git | latest | [git-scm.com](https://git-scm.com) |

You will also need:
- Access to a BU Salesforce sandbox (`sptest` or `ueptest`)
- A Salesforce Connected App configured for JWT Bearer OAuth
- BU portal credentials with a valid MFA passcode

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

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Configuration below)

# 5. Place the Salesforce Connected App private key
# Copy your RSA private key file to: server.key (project root)
# Do NOT commit this file — it is listed in .gitignore
```

---

## Environment Configuration

The active Salesforce sandbox is selected via the `TEST_ENV` variable. Available values are defined in `config/environments.json`:

| `TEST_ENV` | Salesforce sandbox |
|---|---|
| `sptest` (default) | `bostonuniversity-b--sptest` |
| `ueptest` | `bostonuniversity-b--ueptest` |

Copy `.env.example` to `.env` and fill in all required values:

```env
# Target environment: sptest | ueptest  (defaults to sptest)
TEST_ENV=sptest

# Salesforce JWT OAuth — Connected App credentials
SF_CLIENT_ID=your_connected_app_consumer_key
SF_USERNAME=your_sf_automation_username

# BU Portal credentials
BULoginName=your_bu_login
BUTestPassword=your_bu_password
BUPasscode=your_mfa_passcode
```

> **Never commit `.env` or `server.key`.** Both are in `.gitignore`. The `config/environments.json` file contains only URLs and is safe to commit.

---

## Running Tests

```bash
# All tests, headless, default environment
npm test

# Target a specific environment
TEST_ENV=ueptest npx playwright test

# Specific browser in headed mode
npm run test:chromium
npm run test:firefox

# All browsers in headed mode
npm run test:all

# Run tests and auto-generate Allure report
npm run test:allure

# Run a specific spec file
npx playwright test tests/orientationSmoke/orientationAdmin.spec.ts

# Filter tests by title
npx playwright test --grep "Register attendee"
```

---

## Test Reports

### Playwright HTML Report

```bash
npx playwright show-report
```

### Allure Report

```bash
npm run allure:generate    # Build HTML report from raw results
npm run allure:open        # Open the generated report in a browser
npm run allure:serve       # Serve live with auto-refresh

npm run clean:reports      # Delete all report output directories
```

Report output locations:

| Path | Contents |
|---|---|
| `reports/allure-results/` | Raw Allure result files |
| `reports/allure-report/` | Generated Allure HTML report |
| `reports/html-report-<timestamp>/` | Timestamped Playwright HTML report |

---

## CI/CD

Pipeline definition: [.github/workflows/playwright.yml](.github/workflows/playwright.yml)

**Triggers:**
- **Scheduled:** Every Monday at 9:30 AM IST (04:00 UTC) — runs all tests on the default environment
- **Manual (`workflow_dispatch`):** Trigger from the GitHub Actions UI with optional inputs:

| Input | Description | Default |
|---|---|---|
| `spec_file` | Path relative to `tests/` to run a single spec | _(all tests)_ |
| `browser` | `chromium` / `firefox` / `webkit` | `chromium` |
| `headed` | Run in headed mode via xvfb | `false` |

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `SF_CLIENT_ID` | Salesforce Connected App consumer key |
| `SF_USERNAME` | Salesforce automation username |
| `BUTESTPASSWORD` | BU portal test user password |
| `BUPASSCODE` | BU portal MFA passcode |

**Pipeline steps:**
1. Checkout code
2. Setup Node.js LTS with npm cache
3. `npm ci` — clean dependency install
4. Install Playwright browser and system dependencies
5. Run tests (headless or headed via xvfb based on input)
6. Generate Allure report from results
7. Upload Allure artifact — named `allure-report-{browser}-{date}-run{number}`, retained 30 days
8. Upload Playwright HTML artifact — retained 30 days

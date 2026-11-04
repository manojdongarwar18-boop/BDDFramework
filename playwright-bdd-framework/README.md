# Playwright BDD Framework

A beginner-friendly UI automation example using Playwright, TypeScript, and Cucumber. Cucumber runs the BDD scenarios; Playwright is used only to control the browser.

## A. Project architecture

```text
playwright-bdd-framework/
├── features/
│   └── login.feature
├── step-definitions/
│   └── login.steps.ts
├── pages/
│   └── LoginPage.ts
├── hooks/
│   └── hooks.ts
├── config/
│   ├── config.ts
│   ├── .env.qa
│   └── .env.uat
├── test-runner/
│   └── runner.ts
├── utils/
├── reports/
├── screenshots/
├── cucumber.js
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

- `features/` contains Gherkin behavior specifications and scenario tags.
- `step-definitions/` maps each Gherkin step to a typed TypeScript implementation.
- `pages/` holds page locators and reusable interactions using the Page Object Model.
- `hooks/` creates and closes the Playwright browser, context, and page around scenarios, and captures failure evidence.
- `config/` loads and validates the selected dotenv environment.
- `test-runner/` provides a TypeScript entry point that invokes the Cucumber CLI and creates an HTML report.
- `utils/` is available for future shared helpers.
- `reports/` receives the generated Cucumber HTML report.
- `screenshots/` receives screenshots for failed scenarios.
- `cucumber.js` provides Cucumber's feature, TypeScript loading, and default formatter settings.
- `playwright.config.ts` exposes browser settings for this framework; it is not a Playwright Test configuration.
- `tsconfig.json` configures TypeScript and `ts-node`.
- `package.json` defines dependencies and convenient test commands.

## B. Installation

From the project directory:

```sh
npm install
```

## C. Install Playwright browsers

Install the browser selected by `BROWSER` (Chromium by default):

```sh
npx playwright install chromium
```

To install all supported browsers instead:

```sh
npx playwright install
```

## D. Configure environment files

`TEST_ENV` selects `config/.env.qa` or `config/.env.uat`; it defaults to `qa`. Both included files use the public SauceDemo sample account so the project runs as provided. Replace the values in the appropriate file for your own environments. Do not commit real or private credentials.

```dotenv
BASE_URL=https://www.saucedemo.com/
USERNAME=standard_user
PASSWORD=secret_sauce
INVALID_USERNAME=invalid_user
INVALID_PASSWORD=invalid_password
BROWSER=chromium
HEADLESS=true
TIMEOUT=30000
```

Variables supplied by the shell take precedence over values loaded from the selected file. For example:

```sh
TEST_ENV=uat npm run test:bdd
```

On Windows PowerShell:

```powershell
$env:TEST_ENV = "uat"
npm run test:bdd
```

### GitHub Actions environment

The CI workflow uses the public SauceDemo sample account by default because local `.env` files are not committed. For a different test environment, add these secrets under **Settings → Secrets and variables → Actions**; configured secrets override the defaults:

- `BASE_URL`
- `TEST_USERNAME`
- `TEST_PASSWORD`
- `INVALID_USERNAME`
- `INVALID_PASSWORD`

The workflow maps `TEST_USERNAME` and `TEST_PASSWORD` to the framework's `USERNAME` and `PASSWORD` variables. If a local environment file exists, it is still loaded; process environment variables take precedence.

## E. Execute all BDD tests

```sh
npm run test:bdd
```

Cucumber loads all `.feature` files under `features/`. The `test:bdd:runner` entry point also runs the suite and always requests the HTML report:

```sh
npm run test:bdd:runner
```

## F. Execute a specific feature

```sh
npx cucumber-js features/login.feature
```

## G. Execute a specific scenario or tag

Run the smoke scenario:

```sh
npx cucumber-js --tags "@smoke"
```

Run the regression scenario:

```sh
npx cucumber-js --tags "@regression"
```

Tags can also be combined, for example `--tags "@smoke or @regression"`.

## H. Run in headed mode

```sh
npm run test:bdd:headed
```

This sets `HEADLESS=false` for the run. The `.env` value remains unchanged.

## I. Generate the HTML report

```sh
npm run test:bdd:html
```

Open `reports/cucumber-report.html` after execution. It includes feature/scenario/step results, statuses, durations, failure details, and attached failure screenshots. The runner command `npm run test:bdd:runner` also generates this report.

## J. Failure screenshots

The Cucumber `After` hook checks the scenario result. When a scenario fails, it saves a full-page PNG under `screenshots/` and attaches the image to the Cucumber report. It then closes the page, context, and browser even when screenshot capture fails. The original Cucumber step failure remains a failed scenario, and screenshot/cleanup errors are reported explicitly.

## K. End-to-end execution flow

```text
Feature File
     ↓
Cucumber
     ↓
Step Definition
     ↓
Page Object
     ↓
Playwright
     ↓
Browser
     ↓
Application
     ↓
Cucumber Report
```

The feature describes behavior in Gherkin. Cucumber selects and executes each scenario, binding its `Given`/`When`/`Then` steps to TypeScript step definitions. The steps call `LoginPage`, which owns the UI selectors and actions. Playwright's `Page` operates inside a per-scenario `BrowserContext`; hooks launch and clean up those browser resources. Cucumber records step outcomes and emits the HTML report, with screenshots attached for failures.

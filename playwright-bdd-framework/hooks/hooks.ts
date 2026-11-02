import {
  After,
  Before,
  Status,
  World,
  setDefaultTimeout,
  setWorldConstructor,
  type ITestCaseHookParameter
} from '@cucumber/cucumber';
import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserContext,
  type Page
} from 'playwright';
import path from 'node:path';
import { config } from '../config/config';
import { LoginPage } from '../pages/LoginPage';

// A Browser is the launched browser process; each scenario gets an isolated BrowserContext.
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage!: LoginPage;
}

setWorldConstructor(CustomWorld);

const browserTypes = { chromium, firefox, webkit };

setDefaultTimeout(config.timeout);

// Hooks run around each scenario so browser resources and failure evidence are managed centrally.
Before(async function (this: CustomWorld): Promise<void> {
  this.browser = await browserTypes[config.browserName].launch({
    headless: config.headless
  });
  this.context = await this.browser.newContext({ baseURL: config.baseUrl });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeout);
  this.loginPage = new LoginPage(this.page);
});

After(
  async function (
    this: CustomWorld,
    scenario: ITestCaseHookParameter
  ): Promise<void> {
    const cleanupErrors: Error[] = [];

    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshotName = `failed-${Date.now()}-${scenario.pickle.name
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/^-|-$/g, '')}.png`;
      const screenshotPath = path.resolve(process.cwd(), 'screenshots', screenshotName);

      try {
        const screenshot = await this.page.screenshot({
          path: screenshotPath,
          fullPage: true
        });
        await this.attach(screenshot, 'image/png');
        console.error(`Failure screenshot saved to ${screenshotPath}`);
      } catch (error) {
        console.error(
          `Could not capture or attach the failure screenshot: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    const resources: Array<{ name: string; close: () => Promise<void> }> = [
      { name: 'page', close: () => this.page?.close() ?? Promise.resolve() },
      { name: 'browser context', close: () => this.context?.close() ?? Promise.resolve() },
      { name: 'browser', close: () => this.browser?.close() ?? Promise.resolve() }
    ];

    for (const resource of resources) {
      try {
        await resource.close();
      } catch (error) {
        cleanupErrors.push(
          new Error(
            `Could not close ${resource.name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
            { cause: error }
          )
        );
      }
    }

    if (cleanupErrors.length > 0) {
      throw new AggregateError(cleanupErrors, 'One or more browser resources could not be closed.');
    }
  }
);

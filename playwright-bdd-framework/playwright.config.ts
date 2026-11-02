import type { BrowserName } from './config/config';
import { config } from './config/config';

// Shared Playwright settings for this framework; Cucumber, not Playwright Test, runs scenarios.
export interface FrameworkPlaywrightConfig {
  baseURL: string;
  browserName: BrowserName;
  headless: boolean;
  timeout: number;
}

const playwrightConfig: FrameworkPlaywrightConfig = {
  baseURL: config.baseUrl,
  browserName: config.browserName,
  headless: config.headless,
  timeout: config.timeout
};

export default playwrightConfig;

import dotenv from 'dotenv';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

const testEnvironment = (process.env.TEST_ENV ?? 'qa').trim();

if (!/^[a-zA-Z0-9_-]+$/.test(testEnvironment)) {
  throw new Error(`Invalid TEST_ENV value: "${testEnvironment}".`);
}

const environmentFile = path.resolve(__dirname, `.env.${testEnvironment}`);
const environmentResult = fs.existsSync(environmentFile)
  ? dotenv.config({ path: environmentFile })
  : undefined;

if (environmentResult?.error) {
  throw new Error(
    `Could not load environment file "${environmentFile}": ${environmentResult.error.message}`,
    { cause: environmentResult.error }
  );
}

const environmentFileValues = environmentResult?.parsed ?? {};

function getEnvironmentVariable(name: string): string | undefined {
  const processValue = process.env[name]?.trim();
  const fileValue = environmentFileValues[name]?.trim();

  // Windows supplies USERNAME for the local account, which otherwise masks dotenv's test account.
  if (
    name === 'USERNAME' &&
    process.platform === 'win32' &&
    processValue?.toLowerCase() === os.userInfo().username.toLowerCase()
  ) {
    return fileValue ?? processValue;
  }

  return processValue ?? fileValue;
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = getEnvironmentVariable(name);

  if (!value) {
    throw new Error(`Required environment variable "${name}" is missing or empty.`);
  }

  return value;
}

function getBooleanEnvironmentVariable(name: string, defaultValue: boolean): boolean {
  const value = getEnvironmentVariable(name)?.toLowerCase();

  if (value === undefined || value === '') {
    return defaultValue;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Environment variable "${name}" must be "true" or "false".`);
}

function getTimeout(): number {
  const value = Number(getEnvironmentVariable('TIMEOUT') ?? '30000');

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('TIMEOUT must be a positive integer in milliseconds.');
  }

  return value;
}

const browserName = (getEnvironmentVariable('BROWSER') ?? 'chromium')
  .trim()
  .toLowerCase();

if (!['chromium', 'firefox', 'webkit'].includes(browserName)) {
  throw new Error('BROWSER must be one of: chromium, firefox, webkit.');
}

export const config = {
  environment: testEnvironment,
  baseUrl: getRequiredEnvironmentVariable('BASE_URL'),
  username: getRequiredEnvironmentVariable('USERNAME'),
  password: getRequiredEnvironmentVariable('PASSWORD'),
  invalidUsername: getRequiredEnvironmentVariable('INVALID_USERNAME'),
  invalidPassword: getRequiredEnvironmentVariable('INVALID_PASSWORD'),
  browserName: browserName as BrowserName,
  headless: getBooleanEnvironmentVariable('HEADLESS', true),
  timeout: getTimeout()
} as const;

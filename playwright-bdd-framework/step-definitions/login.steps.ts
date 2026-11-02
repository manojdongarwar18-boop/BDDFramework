import { Given, When, Then } from '@cucumber/cucumber';
import { config } from '../config/config';
import { CustomWorld } from '../hooks/hooks';

// Step definitions connect readable Gherkin steps to page-object methods.
Given(
  'I navigate to the login page',
  async function (this: CustomWorld): Promise<void> {
    await this.loginPage.navigateToLoginPage();
  }
);

When(
  'I enter valid username and password',
  async function (this: CustomWorld): Promise<void> {
    await this.loginPage.enterUsername(config.username);
    await this.loginPage.enterPassword(config.password);
  }
);

When(
  'I enter invalid username and password',
  async function (this: CustomWorld): Promise<void> {
    await this.loginPage.enterUsername(config.invalidUsername);
    await this.loginPage.enterPassword(config.invalidPassword);
  }
);

When(
  'I click the login button',
  async function (this: CustomWorld): Promise<void> {
    await this.loginPage.clickLogin();
  }
);

Then(
  'I should be successfully logged in',
  async function (this: CustomWorld): Promise<void> {
    await this.loginPage.verifySuccessfulLogin();
  }
);

Then(
  'I should see an invalid login error',
  async function (this: CustomWorld): Promise<void> {
    await this.loginPage.verifyInvalidLogin();
  }
);

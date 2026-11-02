import type { Locator, Page } from 'playwright';

// Page Object Model: selectors and UI behavior stay together and can be reused by steps.
export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly productsHeading: Locator;
  private readonly loginError: Locator;

  constructor(private readonly page: Page) {
    // Playwright's Page represents one browser tab and provides its locators and actions.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.productsHeading = page.getByText('Products', { exact: true });
    this.loginError = page.locator('[data-test="error"]');
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto('/');
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForURL(/\/inventory\.html$/);
    await this.productsHeading.waitFor({ state: 'visible' });
  }

  async verifyInvalidLogin(): Promise<void> {
    await this.loginError.waitFor({ state: 'visible' });
    const errorMessage = await this.loginError.textContent();

    if (!errorMessage?.includes('Username and password do not match')) {
      throw new Error(
        `Expected an invalid-login message, received: "${errorMessage ?? ''}".`
      );
    }
  }
}

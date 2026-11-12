import type { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async addProductToCart(productName: string): Promise<void> {
    const product = this.page
      .locator('.inventory_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });

    await product.getByRole('button', { name: 'Add to cart' }).click();
  }

  async getCartItemByName(productName: string): Promise<Locator> {
    await this.page.locator('.shopping_cart_link').click();
    return this.page
      .locator('.cart_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }
}

import { test as bddTest } from 'playwright-bdd';
import { InventoryPage } from '../pages/InventoryPage';

export const test = bddTest.extend<{ inventoryPage: InventoryPage }>({
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  }
});

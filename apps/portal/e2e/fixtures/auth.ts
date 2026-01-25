import { test as base, Page } from "@playwright/test";

/**
 * Test User Credentials
 *
 * These users must exist in the database for tests to work.
 * Update with your actual test user credentials.
 */
export const TEST_USERS = {
  superAdmin: {
    email: "nils@nils.lv",
    password: "TestAdmin123",
    name: "Nils",
  },
  orgUser: {
    email: "nils@thewoodandgood.com",
    password: "TestProducer123",
    name: "Producer",
    orgCode: "INE",
    orgName: "Inerce", // Full organization name shown in sidebar
  },
};

/**
 * Login helper function
 */
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/);
}

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend<{
  superAdminPage: Page;
  orgUserPage: Page;
}>({
  /**
   * Page logged in as Super Admin
   */
  superAdminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, TEST_USERS.superAdmin.email, TEST_USERS.superAdmin.password);
    await use(page);
    await context.close();
  },

  /**
   * Page logged in as Organization User
   */
  orgUserPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, TEST_USERS.orgUser.email, TEST_USERS.orgUser.password);
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";

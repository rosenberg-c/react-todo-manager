import { test, expect } from "@playwright/test";
import { uniqueName, registerUser, login } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("Login flow", () => {
  const testUser = {
    username: uniqueName("testuser"),
    password: "testpass123",
  };

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await registerUser(page, testUser.username, testUser.password);
    await page.close();
  });

  test("user can log in and see home page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Login");

    await page.fill("#username", testUser.username);
    await page.fill("#password", testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("/home");
    await expect(page).toHaveURL("/home");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill("#username", "nonexistent");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator(".__error-message__")).toBeVisible();
  });

  test("user can log out", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__menu-btn__");
    await page.click(".__menu-item__ button[type='submit']");

    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/home");

    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });

  test("cannot submit with empty fields", async ({ page }) => {
    await page.goto("/login");

    await page.click('button[type="submit"]');

    // Form should not submit - still on login page
    await expect(page).toHaveURL("/login");

    // Username field should show validation error
    const username = page.locator("#username");
    await expect(username).toHaveJSProperty("validity.valueMissing", true);
  });
});

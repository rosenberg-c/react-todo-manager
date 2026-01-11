import { test, expect } from "@playwright/test";
import { uniqueName, registerUser } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("Register flow", () => {
  test("can register new user and redirect to home", async ({ page }) => {
    await registerUser(page, uniqueName("newuser"), "password123");
    await expect(page.locator(".__app-header__")).toBeVisible();
  });

  test("shows error for duplicate username", async ({ page }) => {
    // First registration
    const duplicatename = uniqueName("duplicateuser");
    await registerUser(page, duplicatename, "password123");

    // Logout
    await page.click(".__menu-btn__");
    await page.click(".__menu-item__ button[type='submit']");
    await page.waitForURL("/login");

    // Try to register with same username
    await page.goto("/register");
    await page.fill("#username", duplicatename);
    await page.fill("#password", "differentpass");
    await page.click('button[type="submit"]');

    await expect(page.locator(".__error-message__")).toHaveText(
      "Username is already taken"
    );
    expect(page.url()).toContain("/register");
  });

  test("can navigate to login page", async ({ page }) => {
    await page.goto("/register");

    await page.click(".__auth-link__ a");

    await page.waitForURL("/login");
  });

  test("cannot submit with empty fields", async ({ page }) => {
    await page.goto("/register");

    await page.click('button[type="submit"]');

    // Form should not submit - still on register page
    await expect(page).toHaveURL("/register");

    // Username field should show validation error
    const username = page.locator("#username");
    await expect(username).toHaveJSProperty("validity.valueMissing", true);
  });
});

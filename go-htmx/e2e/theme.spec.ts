import { test, expect } from "@playwright/test";
import { uniqueName, registerUser, login } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("Theme toggle", () => {
  const testUser = {
    username: uniqueName("themeuser"),
    password: "testpass123",
  };

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await registerUser(page, testUser.username, testUser.password);
    await page.close();
  });

  test("defaults to system theme", async ({ page }) => {
    await registerUser(page, uniqueName("defaultthemeuser"), "testpass123");

    await page.click(".__menu-btn__");

    await expect(page.locator("#__theme-system__")).toBeChecked();
    await expect(page.locator("#__theme-light__")).not.toBeChecked();
    await expect(page.locator("#__theme-dark__")).not.toBeChecked();
  });

  test("can open hamburger menu", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await expect(page.locator("#__menu-dropdown__")).not.toHaveClass(
      /__open__/
    );

    await page.click(".__menu-btn__");

    await expect(page.locator("#__menu-dropdown__")).toHaveClass(
      /__open__/
    );
  });

  test("can select light theme", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__menu-btn__");
    await page.click("#__theme-light__");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("#__theme-light__")).toBeChecked();
  });

  test("can select dark theme", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__menu-btn__");
    await page.click("#__theme-dark__");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("#__theme-dark__")).toBeChecked();
  });

  test("theme preference persists after reload", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__menu-btn__");
    await page.click("#__theme-dark__");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Verify radio state persisted
    await page.click(".__menu-btn__");
    await expect(page.locator("#__theme-dark__")).toBeChecked();
  });

  test("menu closes when clicking outside", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__menu-btn__");
    await expect(page.locator("#__menu-dropdown__")).toHaveClass(
      /__open__/
    );

    // Click outside the menu
    await page.click(".__board__");

    await expect(page.locator("#__menu-dropdown__")).not.toHaveClass(
      /__open__/
    );
  });
});

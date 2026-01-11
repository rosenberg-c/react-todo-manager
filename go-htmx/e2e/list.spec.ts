import { test, expect } from "@playwright/test";
import {
  uniqueName,
  registerUser,
  login,
  createList,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("List operations", () => {
  const testUser = {
    username: uniqueName("listuser"),
    password: "testpass123",
  };

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await registerUser(page, testUser.username, testUser.password);
    await page.close();
  });

  test("shows empty board for new user", async ({ page }) => {
    // Register a fresh user to get empty state
    await registerUser(page, uniqueName("emptyboarduser"), "testpass123");

    await expect(page.locator(".__board__")).toBeVisible();
    await expect(page.locator(".__list-column__")).toHaveCount(0);
    await expect(page.locator(".__add-list-button__")).toBeVisible();
  });

  test("can create a list", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__add-list-button__");
    await expect(page.locator("#__list-create-dialog__")).toBeVisible();

    await page.fill("#name", "My List");
    await page.click(".__submit-btn__");

    await expect(page.locator("#__list-create-dialog__")).not.toBeVisible();
    await expect(page.locator(".__list-column__")).toBeVisible();
    await expect(page.locator(".__list-title__")).toHaveText("My List");
    await expect(page.locator(".__list-empty__")).toBeVisible();
  });

  test("cancel button closes add list dialog", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await page.click(".__add-list-button__");
    await expect(page.locator("#__list-create-dialog__")).toBeVisible();

    await page.fill("#name", "Should Not Create");
    await page.click(".__cancel-btn__");

    await expect(page.locator("#__list-create-dialog__")).not.toBeVisible();
    await expect(
      page.locator(".__list-title__").filter({ hasText: "Should Not Create" })
    ).toHaveCount(0);
  });

  test("can rename a list", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const timestamp = Date.now();
    const originalName = `Original_${timestamp}`;
    const newName = `Renamed_${timestamp}`;
    await createList(page, originalName);
    const listTitle = page
      .locator(".__list-title__")
      .filter({ hasText: originalName });

    await listTitle.click();
    await expect(page.locator(".__list-title-input__")).toBeVisible();

    await page.locator(".__list-title-input__").fill(newName);

    // Wait for rename API to complete
    const renamePromise = page.waitForResponse(
      (resp) => resp.url().includes("/lists/") && resp.status() === 200
    );
    await page.keyboard.press("Enter");
    await renamePromise;

    await expect(
      page.locator(".__list-title__").filter({ hasText: newName })
    ).toBeVisible();

    await page.reload();
    await expect(
      page.locator(".__list-title__").filter({ hasText: newName })
    ).toBeVisible();
  });

  test("can delete empty list", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const initialCount = await page.locator(".__list-column__").count();

    await createList(page, "Delete Me");
    await expect(page.locator(".__list-column__")).toHaveCount(initialCount + 1);

    const listColumn = page.locator(".__list-column__").last();

    page.on("dialog", (dialog) => dialog.accept());
    await listColumn.locator(".__list-header-actions__ button").click();

    await expect(page.locator(".__list-column__")).toHaveCount(initialCount);
  });

  test("cannot delete list with todos", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    await createList(page, "Has Todos");
    const listColumn = page.locator(".__list-column__").last();

    await listColumn.locator(".__todo-create-input__").fill("Test Todo");
    await listColumn.locator(".__todo-create-btn__").click();
    await expect(listColumn.locator(".__todo-card__")).toBeVisible();

    let alertMessage = "";
    page.on("dialog", async (dialog) => {
      if (dialog.type() === "alert") {
        alertMessage = dialog.message();
      }
      await dialog.accept();
    });

    await listColumn.locator(".__list-header-actions__ button").click();
    await page.waitForLoadState("networkidle");

    await expect(listColumn).toBeVisible();
    expect(alertMessage).toContain("Cannot delete");
  });
});

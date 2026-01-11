import { expect, type Page, type Locator } from "@playwright/test";

export function uniqueName(base: string) {
  return `${base}_${Date.now()}`;
}

export async function registerUser(
  page: Page,
  username: string,
  password: string
) {
  await page.goto("/register");
  await page.fill("#username", username);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/home");
}

export async function login(
  page: Page,
  username: string,
  password: string
) {
  await page.goto("/login");
  await page.fill("#username", username);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/home");
}

export async function createList(page: Page, name: string): Promise<Locator> {
  await page.click(".__add-list-button__");
  await page.fill("#name", name);
  await page.click(".__submit-btn__");
  await expect(page.locator(".__list-title__").last()).toHaveText(name);
  return page.locator(".__list-column__").last();
}

export async function addTodo(listColumn: Locator, title: string) {
  const initialCount = await listColumn.locator(".__todo-card__").count();
  await listColumn.locator(".__todo-create-input__").fill(title);
  await listColumn.locator(".__todo-create-btn__").click();
  await expect(listColumn.locator(".__todo-card__")).toHaveCount(
    initialCount + 1
  );
}

export async function waitForIdle(page: Page) {
  await page.waitForLoadState("networkidle");
}

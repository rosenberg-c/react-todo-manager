import { test, expect } from "@playwright/test";
import {
  uniqueName,
  registerUser,
  login,
  createList,
  addTodo,
  waitForIdle,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("Todo operations", () => {
  const testUser = {
    username: uniqueName("todouser"),
    password: "testpass123",
  };

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await registerUser(page, testUser.username, testUser.password);
    await page.close();
  });

  test("can create a todo", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Todo Test List");
    await expect(listColumn.locator(".__list-empty__")).toBeVisible();

    await addTodo(listColumn, "My First Todo");

    await expect(listColumn.locator(".__todo-card__")).toBeVisible();
    await expect(listColumn.locator(".__todo-title__")).toHaveText(
      "My First Todo"
    );
  });

  test("can edit a todo", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Edit Test List");
    await addTodo(listColumn, "Original Title");

    await listColumn.locator(".__todo-card-content__").click();
    await expect(listColumn.locator(".__todo-title-input__")).toBeVisible();

    await listColumn.locator(".__todo-title-input__").fill("Updated Title");
    await listColumn
      .locator(".__todo-description-input__")
      .fill("Added description");

    // Wait for save API to complete
    const savePromise = page.waitForResponse(
      (resp) => resp.url().includes("/todos/") && resp.status() === 200
    );
    await listColumn.locator(".__todo-save-button__").click();
    await savePromise;

    await expect(listColumn.locator(".__todo-title__")).toHaveText(
      "Updated Title"
    );
    await expect(listColumn.locator(".__todo-description__")).toHaveText(
      "Added description"
    );

    await page.reload();
    await expect(
      page.locator(".__todo-title__").filter({ hasText: "Updated Title" })
    ).toBeVisible();
  });

  test("can delete a todo", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Delete Test List");
    await addTodo(listColumn, "Delete Me");

    page.on("dialog", (dialog) => dialog.accept());
    await listColumn.locator(".__todo-card-actions__ button").click();

    await expect(listColumn.locator(".__todo-card__")).not.toBeVisible();
  });

  test("todo persists after page reload", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Persist Test List");
    await addTodo(listColumn, "Persistent Todo");

    await page.reload();

    await expect(
      page.locator(".__todo-title__").filter({ hasText: "Persistent Todo" })
    ).toBeVisible();
  });

  test("can move todo between lists", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const timestamp = Date.now();
    const sourceName = `Source_${timestamp}`;
    const targetName = `Target_${timestamp}`;
    const todoName = `MoveTodo_${timestamp}`;
    // Use unique list names to ensure fresh data

    await createList(page, sourceName);
    await createList(page, targetName);

    const sourceList = page
      .locator(".__list-column__")
      .filter({ hasText: sourceName });
    const targetList = page
      .locator(".__list-column__")
      .filter({ hasText: targetName });

    await addTodo(sourceList, todoName);

    const todo = sourceList.locator(".__todo-card__");

    // Wait for move API to complete after drag
    const movePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/todos/") &&
        resp.url().includes("/move") &&
        resp.status() === 200
    );
    await todo.dragTo(targetList.locator(".__list-todos__"));
    await movePromise;

    await expect(sourceList.locator(".__todo-card__")).toHaveCount(0);
    await expect(targetList.locator(".__todo-card__")).toHaveCount(1);
    await expect(targetList.locator(".__todo-title__")).toHaveText(todoName);

    // Ensure all network activity settles before reload
    await waitForIdle(page);

    await page.reload();
    const reloadedTarget = page
      .locator(".__list-column__")
      .filter({ hasText: targetName });
    await expect(reloadedTarget.locator(".__todo-title__")).toHaveText(
      todoName
    );
  });

  test("can reorder todos via drag and drop", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listName = uniqueName("Reorder")
    const listColumn = await createList(page, listName);
    await addTodo(listColumn, "First");
    await addTodo(listColumn, "Second");
    await addTodo(listColumn, "Third");

    const todos = listColumn.locator(".__todo-card__");
    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText("First");
    await expect(todos.nth(1).locator(".__todo-title__")).toHaveText("Second");
    await expect(todos.nth(2).locator(".__todo-title__")).toHaveText("Third");

    // Wait for reorder API to complete after drag
    const reorderPromise = page.waitForResponse(
      (resp) => resp.url().includes("/todos/reorder") && resp.status() === 200
    );
    await todos.nth(2).dragTo(todos.nth(0));
    await reorderPromise;

    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText("Third");

    await page.reload();
    const reloadedList = page
      .locator(".__list-column__")
      .filter({ hasText: listName });
    const reloadedTodos = reloadedList.locator(".__todo-card__");
    await expect(reloadedTodos.nth(0).locator(".__todo-title__")).toHaveText(
      "Third"
    );
  });

  test("can sort todos by title", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Sort Test List");
    await addTodo(listColumn, "Charlie");
    await addTodo(listColumn, "Alpha");
    await addTodo(listColumn, "Bravo");

    await listColumn.locator(".__sort-select__").selectOption("title-asc");
    await waitForIdle(page)

    const todos = listColumn.locator(".__todo-card__");
    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText("Alpha");
    await expect(todos.nth(1).locator(".__todo-title__")).toHaveText("Bravo");
    await expect(todos.nth(2).locator(".__todo-title__")).toHaveText("Charlie");

    await listColumn.locator(".__sort-select__").selectOption("title-desc");
    await waitForIdle(page)

    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText("Charlie");
    await expect(todos.nth(1).locator(".__todo-title__")).toHaveText("Bravo");
    await expect(todos.nth(2).locator(".__todo-title__")).toHaveText("Alpha");
  });

  test("can sort todos by creation date", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Date Sort List");
    await addTodo(listColumn, "First Created");
    await addTodo(listColumn, "Second Created");
    await addTodo(listColumn, "Third Created");

    // Newest first
    await listColumn.locator(".__sort-select__").selectOption("createdAt-desc");
    await waitForIdle(page)

    const todos = listColumn.locator(".__todo-card__");
    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText(
      "Third Created"
    );
    await expect(todos.nth(2).locator(".__todo-title__")).toHaveText(
      "First Created"
    );

    // Oldest first
    await listColumn.locator(".__sort-select__").selectOption("createdAt-asc");
    await waitForIdle(page)

    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText(
      "First Created"
    );
    await expect(todos.nth(2).locator(".__todo-title__")).toHaveText(
      "Third Created"
    );
  });

  test("can sort todos by updated date", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Updated Sort List");
    await addTodo(listColumn, "Todo A");
    await addTodo(listColumn, "Todo B");
    await addTodo(listColumn, "Todo C");

    // Edit the first todo to make it most recently updated
    await listColumn
      .locator(".__todo-card__")
      .filter({ hasText: "Todo A" })
      .locator(".__todo-card-content__")
      .click();
    await listColumn.locator(".__todo-title-input__").fill("Todo A Updated");
    await listColumn.locator(".__todo-save-button__").click();
    await waitForIdle(page)

    // Sort by recently updated
    await listColumn.locator(".__sort-select__").selectOption("updatedAt-desc");
    await waitForIdle(page)

    const todos = listColumn.locator(".__todo-card__");
    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText(
      "Todo A Updated"
    );
  });

  test("can sort todos by priority (creation order)", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listColumn = await createList(page, "Priority Sort List");
    await addTodo(listColumn, "Charlie");
    await addTodo(listColumn, "Alpha");
    await addTodo(listColumn, "Bravo");

    // Switch to title sort (alphabetical)
    await listColumn.locator(".__sort-select__").selectOption("title-asc");
    await waitForIdle(page);

    const todos = listColumn.locator(".__todo-card__");
    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText("Alpha");

    // Switch back to priority (creation order)
    await listColumn.locator(".__sort-select__").selectOption("priority");
    await waitForIdle(page);

    // Should restore creation order: Charlie, Alpha, Bravo
    await expect(todos.nth(0).locator(".__todo-title__")).toHaveText("Charlie");
    await expect(todos.nth(1).locator(".__todo-title__")).toHaveText("Alpha");
    await expect(todos.nth(2).locator(".__todo-title__")).toHaveText("Bravo");
  });

  test("sort selection persists in URL", async ({ page }) => {
    await login(page, testUser.username, testUser.password);

    const listName = uniqueName("URL Sort")
    await createList(page, listName);
    const listColumn = page
      .locator(".__list-column__")
      .filter({ hasText: listName });

    await listColumn.locator(".__sort-select__").selectOption("title-asc");
    await waitForIdle(page)

    expect(page.url()).toContain("sortBy=title-asc");

    await page.reload();

    expect(page.url()).toContain("sortBy=title-asc");
    await expect(listColumn.locator(".__sort-select__")).toHaveValue(
      "title-asc"
    );
  });
});

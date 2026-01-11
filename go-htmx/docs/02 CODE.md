# CODE

## Comments

- Avoid comments that state the obvious
- Bad: `// GetByID gets by ID`
- Good: `// GetByID returns ErrNotFound if no match`
- Only comment non-obvious behavior, edge cases, or "why" not "what"

## Testing

- Create tests for new implementations
  - Includes Playwright e2e tests
- Use table-driven tests with subtests
- Run tests after changes
- Never delete tests unless related code was deleted

### E2E Tests (Playwright)

- Tests must be idempotent - they should pass on fresh DB and on reruns
- Use unique identifiers (e.g., `Date.now()`) when creating test data that must not conflict
- Avoid `waitForTimeout()` - it causes flaky tests
- Wait for specific events instead:
  - `waitForResponse()` - wait for API calls to complete
  - `waitForLoadState("networkidle")` - wait for network activity to settle
  - `expect().toBeVisible()` - wait for elements to appear
- Example for API calls:

```typescript
// Bad - arbitrary timeout
await page.waitForTimeout(1000);
await page.reload();

// Good - wait for specific API response
const responsePromise = page.waitForResponse((resp) =>
  resp.url().includes("/todos/") && resp.url().includes("/move")
);
await todo.dragTo(target);
await responsePromise;
```

## Components

- Small, reusable UI pieces live in `templates/components/<name>/`
- Each component has its own directory with `<name>.templ`, `styles.css`, and `messages.go`
- Co-locate CSS with templ files for easier discovery
- Components should be pure and have no business logic
- Naming convention: `<entity>-<type>` (e.g., `auth-fields`, `menu`)

## Features

- Larger functionality lives in `templates/features/<name>/`
- Features combine components and may include business-specific behavior
- Same file structure as components: `<name>.templ`, `styles.css`, `messages.go`
- Naming convention: `<entity>-<action>` or `<entity>-<type>`
  - `todo-create` - creates todos
  - `todo-card` - displays/edits a todo
  - `list-create` - creates lists
  - `list-column` - displays a list with its todos
  - `app-header` - application header with user info and menu

## Formatting

- Maximum 80 characters per line for all code (Go, templ, CSS, JS)
- Run `make fmt` to format all files
- Go files: formatted with `golines -m 80`
- Templ files: formatted with `templ fmt` (uses Prettier)
- Break long function signatures onto multiple lines
- Break long HTML attributes onto separate lines

## CSS

- Use CSS custom properties (tokens) defined in `static/css/base.css`
- Never hardcode colors - use tokens like `var(--color-primary)`
- Available tokens:
  - Colors: `--color-bg`, `--color-bg-card`, `--color-text`, `--color-primary`, etc.
  - Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-dropdown`
  - Other: `--radius-sm`, `--radius-md`, `--color-overlay`
- Component/feature styles live next to templ files: `<name>/styles.css`
- Global styles split by concern:
  - `base.css` - CSS tokens (colors, shadows, radii) and resets
  - `typography.css` - Base heading (h1, h2, h3) and link (a) styles
  - `layout.css` - Layout primitives
  - `forms.css` - Base label, input, textarea, select, and dialog styles
  - `buttons.css` - Button styles and variants (disabled, secondary)
- Never embed `<style>` tags in templ files
- Avoid inline `style=""` unless truly dynamic
- Use `rem` units instead of `px` for sizes (better accessibility)
- Prefix component classes to avoid collisions (e.g., `.todo-card__title`)
- Wrap class/ID names with `__` for scoping (e.g., `.__todo-card__`, `#__todo-123__`)
- Run `make css` for production build
- Use `make css-watch` during development

## Strings

- Centralize user-facing strings in a `messages.go` file next to where it's used
- Never hardcode strings directly in templates or handlers
- Never use magic strings - use constants or typed values
- Routes must be defined in a central `routes.go` file, never hardcoded
- In templ files, use constants for attribute values: `value={ string(fields.SortPriority) }`

## Naming

- Use explicit variable names, not abbreviations
- Good: `func (store *JSONStore) Save(value interface{})`
- Bad: `func (s *JSONStore) Save(v interface{})`
- Exception: `i` for index, `ok` for map checks, `t` for `*testing.T`
- Use `testCase` not `tt` in table-driven tests

## Error Handling

- Log errors server-side, return generic messages to clients
- Never expose internal error details
- Validate inputs early
- Wrap errors with context: `log.Printf("could not update user: %v", err)`
- These log messages don't need to be in a messages file

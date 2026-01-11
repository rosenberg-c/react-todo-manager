# PROJECT

## Stack

- **Router**: Chi
- **Templates**: templ
- **Frontend**: HTMX
- **Storage**: JSON files

## Architecture

Maintain clear layer separation:

- `handlers/` - HTTP handling only
- `services/` - Business logic
- `repository/` - Data access
- `models/` - Data structures

## HTMX Patterns

- Use `hx-indicator` for loading states
- Use `hx-disabled-elt` to prevent double submissions
- Handle errors with appropriate `hx-swap` targets

## File Organization

- Keep pages/concepts in separate directories with related files together
- Example: `templates/pages/login/` contains `login.templ` and `messages.go`
- When messages are shared across multiple files, move `messages.go` up a level

### Templates Structure

```
templates/
├── components/   # Small, reusable UI pieces (button, menu, icon)
├── features/     # Composed functionality (todo management, auth forms)
├── icons/        # SVG/icon components
├── layouts/      # Page layouts (base HTML, authenticated wrapper)
├── pages/        # Full page templates
└── shared/       # Shared styles and utilities
```

**Components vs Features:**

- `components/` - Pure, small, reusable UI elements with no business logic
- `features/` - Larger functionality that combines components and may include
  business-specific behavior

### HTTP Handler Naming

**Rule of thumb:**

- Let the HTTP method describe "how"
- Let the function name describe "what"

**Examples:**

```go
router.Get(routes.Register, authHandler.ShowRegister)
router.Post(routes.Register, authHandler.CreateUser)

// Or with symmetry:
router.Get(routes.Register, authHandler.RegisterForm)
router.Post(routes.Register, authHandler.RegisterSubmit)
```

# React List Manager

A monorepo for a todo/list management application.

## Structure

```
apps/
  todo-manager/     # React frontend

features/
  todos/            # Todo feature (components, context)
  users/            # User feature (components, context)

packages/
  api-client/       # Generated API clients
  components/       # Shared UI components
  styles/           # Shared colors/tokens
  config/           # Shared tsconfig, eslint

services/
  todos/            # Todo API
  users/            # User API
```

## Getting Started

### NVM

The easiest way to handle node versions is through nvm.

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

nvm install 22
nvm use 22
```

Handle pnpm separately with npm

```sh
npm install -g pnpm@10.26
```

### Installation

```sh
pnpm i
```

### Generate and run

```sh
# Generate api files for both BE and FE
pnpm run generate:api

# in one terminal run 
pnpm run dev:services

# in another terminal run
pnpm run dev:web

# The app should be available at: http://localhost:5173/
```

## PNPM

### Update all packages recursive

``` sh
pnpm recursive update --latest
```

### Refresh all packages

``` sh
pnpm run clean:node_modules
pnpm store prune
pnpm install --force
```

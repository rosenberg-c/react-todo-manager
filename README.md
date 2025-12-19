# README

## Getting Started

### NVM

The easiest way to handle node versions is through nvm.

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

nvm install 22
nvm alias default 22.17.1
nvm use 22
```

Handle pnpm separately with npm

```sh
npm install -g pnpm@10.26
```

### Installation

To install and use this package, you can follow these simple steps:

- **Install Node.js**: Ensure you have [nodejs.org](https://nodejs.org/) and ([pnpm](https://pnpm.io/)) installed on your system.
- pnpm i
  
- **Run the development server:**:

   ```bash
   pnpm run dev
   ```

This will start the development server.

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

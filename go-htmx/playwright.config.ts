import { defineConfig } from "@playwright/test";

const E2E_PORT = 8081;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "on-first-retry",
    colorScheme: "dark",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "make run",
    url: `http://localhost:${E2E_PORT}/health`,
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      DATA_PATH: "data/e2e",
      PORT: String(E2E_PORT),
    },
  },
});

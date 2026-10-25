import { defineConfig, devices } from "@playwright/test";

const NODE = "C:/Program Files/nodejs/node.exe";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: "http://127.0.0.1:3000",
    navigationTimeout: 15_000,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `"${NODE}" node_modules/next/dist/bin/next start`,
    url: "http://127.0.0.1:3000/robots.txt",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

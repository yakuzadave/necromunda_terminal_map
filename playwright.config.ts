import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Necromunda Tactical Auspex
 *
 * This configuration:
 * - Starts the Deno server automatically before tests
 * - Runs tests in parallel for speed
 * - Supports multiple browsers (Chrome, Firefox, Safari)
 * - Provides retry logic for flaky tests
 */

export default defineConfig({
  // Test directory
  testDir: "./tests/e2e",

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  // Shared settings for all projects
  use: {
    baseURL: "http://localhost:8000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Run Deno server before starting the tests
  webServer: {
    command: "deno run --allow-net --allow-read server.ts",
    url: "http://localhost:8000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },
});

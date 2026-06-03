import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for end-to-end checks (responsive/overflow regressions).
 *
 * Run against a live URL by setting E2E_BASE_URL, e.g.:
 *   E2E_BASE_URL=https://trendflux.digital bunx playwright test
 *
 * Otherwise spins up the local Vite preview server.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:4173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // HTML reporter keeps screenshots / DOM snapshots / traces attached to each
  // test case; `github` annotations stay on CI for inline PR feedback.
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    // Auto-capture on failure — surfaces in the HTML report.
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "iphone-se",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "iphone-13",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "iphone-14",
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "bun run build && bun run preview -- --port 4173 --strictPort",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});

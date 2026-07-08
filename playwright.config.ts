import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for end-to-end checks (responsive/overflow regressions).
 *
 * Run against a live URL by setting E2E_BASE_URL, e.g.:
 *   E2E_BASE_URL=https://trendflux.digital bunx playwright test
 *
 * Otherwise spins up the local Vite preview server.
 *
 * Cross-browser & low-end coverage:
 *   - `chromium-desktop`, `firefox-desktop`, `webkit-desktop` — smoke + a11y
 *     spec parity across the three engines Playwright ships.
 *   - `iphone-se`, `iphone-13`, `iphone-14`, `pixel-5`, `galaxy-s9plus` —
 *     small-viewport regressions on real device descriptors.
 *   - `low-ram-mobile` — Pixel 5 profile with 4× CPU throttle + Slow 3G,
 *     mimicking a ≤2 GB Android device on a congested network.
 *
 * CI shards by project name via the PW_PROJECT env var (see
 * .github/workflows/playwright.yml) so each browser runs on its own runner.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:4173";
const projectFilter = process.env.PW_PROJECT;

const allProjects = [
  // ── Cross-engine desktop smoke ────────────────────────────────────────
  {
    name: "chromium-desktop",
    testMatch: /(home-hero|error-boundary|security-baseline|page-fallback)\.spec\.ts/,
    use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
  },
  {
    name: "firefox-desktop",
    testMatch: /(home-hero|error-boundary|security-baseline|page-fallback)\.spec\.ts/,
    use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } },
  },
  {
    name: "webkit-desktop",
    testMatch: /(home-hero|error-boundary|security-baseline|page-fallback)\.spec\.ts/,
    use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } },
  },

  // ── Visual regression pins to Chromium for stable pixel diffs ────────
  {
    name: "visual-desktop",
    testMatch: /visual-regression\.spec\.ts/,
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      colorScheme: "light",
    },
  },

  // ── Real mobile device descriptors ───────────────────────────────────
  { name: "iphone-se",     use: { ...devices["iPhone SE"] },     testIgnore: /visual-regression\.spec\.ts/ },
  { name: "iphone-13",     use: { ...devices["iPhone 13"] },     testIgnore: /visual-regression\.spec\.ts/ },
  { name: "iphone-14",     use: { ...devices["iPhone 14"] },     testIgnore: /visual-regression\.spec\.ts/ },
  { name: "pixel-5",       use: { ...devices["Pixel 5"] },       testIgnore: /visual-regression\.spec\.ts/ },
  { name: "galaxy-s9plus", use: { ...devices["Galaxy S9+"] },    testIgnore: /visual-regression\.spec\.ts/ },

  // ── Low-RAM / low-bandwidth Android profile ──────────────────────────
  // Pixel 5 (WebKit-free Chromium engine) with 4× CPU throttle + Slow 3G
  // networking. Mirrors the "≤2 GB Android on congested mobile" target so
  // regressions in bundle size, hydration cost, or blocking JS surface here.
  {
    name: "low-ram-mobile",
    testMatch: /(home-hero|low-ram-mobile|security-baseline)\.spec\.ts/,
    use: {
      ...devices["Pixel 5"],
      // Explicit UA / viewport overrides are inherited from Pixel 5.
    },
  },
];

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

  projects: projectFilter
    ? allProjects.filter((p) => p.name === projectFilter)
    : allProjects,
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "bun run build && bun run preview -- --port 4173 --strictPort",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});

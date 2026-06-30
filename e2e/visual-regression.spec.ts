import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression for both light and dark themes.
 *
 * Snapshots are stored under `e2e/visual-regression.spec.ts-snapshots/`.
 * First run: `bun run test:visual:update` to record baselines.
 * Subsequent runs fail when pixels diverge beyond the configured threshold.
 *
 * Each route is captured at viewport-size only (not full page) so we
 * regression-test above-the-fold composition without fighting against
 * lazy sections / animated thumbnails further down.
 */

const ROUTES = [
  { name: "home", path: "/" },
  { name: "portfolio", path: "/portfolio" },
  { name: "marriage", path: "/marriage" },
  { name: "brands", path: "/brands" },
  { name: "edtech", path: "/edtech" },
] as const;

const THEMES = ["light", "dark"] as const;

const setTheme = async (page: Page, theme: "light" | "dark") => {
  await page.evaluate((t) => {
    localStorage.setItem("tf-theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
  }, theme);
  await page.reload({ waitUntil: "domcontentloaded" });
};

const stabilize = async (page: Page) => {
  // Pause CSS animations / transitions so screenshots are deterministic.
  await page.addStyleTag({
    content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}`,
  });
  // Hide elements known to fluctuate (status orbs, live timestamps).
  await page.addStyleTag({
    content: `[data-vr-ignore],[data-live-orb],[data-site-status],time{visibility:hidden!important}`,
  });
  await page.evaluate(async () => {
    // Wait for webfonts so glyph metrics don't differ between runs.
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(300);
};

for (const theme of THEMES) {
  test.describe(`visual-regression / ${theme}`, () => {
    for (const route of ROUTES) {
      test(`${route.name} (${theme})`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await setTheme(page, theme);
        await stabilize(page);
        await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
          fullPage: false,
          // 0.2% pixel diff tolerance covers AA / subpixel rendering jitter.
          maxDiffPixelRatio: 0.002,
          animations: "disabled",
          caret: "hide",
        });
      });
    }
  });
}
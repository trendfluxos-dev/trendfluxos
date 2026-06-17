import { expect, test } from "@playwright/test";

/**
 * Smoke tests for error containment. Verify that:
 *  - A route-level render error renders the RouteErrorBoundary inline
 *    fallback while the app shell (header / nav) stays mounted and
 *    navigable — no hard crash, no blank page.
 *  - A top-level render error (above <Routes>) renders the AppErrorBoundary
 *    fallback instead of leaving the user on a blank document.
 *
 * Synthetic errors are triggered via the `BoomTrigger` helpers wired into
 * `App.tsx` (route: `/__test/boom-route`, query: `?__boom=app`).
 */

test.describe("Error boundaries", () => {
  test("RouteErrorBoundary renders inline fallback and keeps shell interactive", async ({ page }) => {
    await page.goto("/__test/boom-route");

    // Inline route fallback is visible.
    await expect(page.getByRole("heading", { name: /this page hit a snag/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /go home/i })).toBeVisible();

    // The document didn't crash to blank — body has rendered content.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(20);

    // Navigate away via "Go home" — shell-level nav still works without a
    // hard reload requirement.
    await page.getByRole("button", { name: /go home/i }).click();
    await page.waitForURL("**/");
    await expect(page).toHaveURL(/\/$/);
    // Home page rendered (no fallback heading anymore).
    await expect(page.getByRole("heading", { name: /this page hit a snag/i })).toHaveCount(0);
  });

  test("AppErrorBoundary catches top-level render error", async ({ page }) => {
    await page.goto("/?__boom=app");

    await expect(page.getByRole("heading", { name: /something went wrong/i })).toBeVisible();
    // Body rendered the fallback — not a blank document.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/something went wrong/i);
  });

  test("Healthy route renders without triggering any fallback", async ({ page }) => {
    // Capture only true page errors (uncaught exceptions reaching window).
    // React intentionally logs caught errors via console.error inside
    // boundaries, so we don't assert on console here.
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /this page hit a snag/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /^something went wrong$/i })).toHaveCount(0);
    expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toEqual([]);
  });
});
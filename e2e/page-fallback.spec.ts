import { expect, test } from "@playwright/test";

/**
 * Verifies the route-level <PageFallback/> skeleton is shown while a
 * lazy route chunk is loading during a client-side transition.
 *
 * Strategy:
 *   1. Load "/" fully (no throttling) so React + the initial bundle are
 *      hydrated and we're inside the SPA.
 *   2. Install a per-request delay for any subsequent JS asset request,
 *      simulating a slow network for the lazy chunk of the next route.
 *   3. Trigger a client-side navigation to a different route and assert
 *      the `data-testid="page-fallback"` element becomes visible with
 *      the right ARIA semantics BEFORE the target page's H1 shows up.
 *   4. After the throttle expires the target route mounts and the
 *      fallback disappears — assert that swap happens too.
 *
 * We run this for a small matrix of "key page" pairs so regressions in
 * the Suspense boundary or RouteLoadingProvider surface here.
 */

const PAIRS: ReadonlyArray<{ from: string; to: string; label: string }> = [
  { from: "/",         to: "/about",     label: "home → about" },
  { from: "/",         to: "/ecosystem", label: "home → ecosystem" },
  { from: "/about",    to: "/services",  label: "about → services" },
  { from: "/services", to: "/contact",   label: "services → contact" },
];

for (const { from, to, label } of PAIRS) {
  test(`shows PageFallback during ${label}`, async ({ page }) => {
    // Step 1: full initial load.
    await page.goto(from, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Step 2: throttle subsequent JS chunk requests so the transition is
    // slow enough to observe the fallback. We only delay .js/.mjs assets
    // that arrive AFTER the initial page is settled; existing bundles
    // are already in the browser cache.
    let releaseThrottle = () => {};
    const throttled = new Promise<void>((resolve) => {
      releaseThrottle = resolve;
    });
    await page.route(/\.m?js(\?.*)?$/, async (route) => {
      // Hold the request until the test releases it, so PageFallback
      // stays on screen long enough for the assertion.
      await Promise.race([
        throttled,
        new Promise((r) => setTimeout(r, 3000)), // safety cap
      ]);
      await route.continue();
    });

    // Step 3: kick off a client-side navigation. Prefer clicking a real
    // link if one exists (so React Router owns the transition); fall
    // back to history.pushState + popstate which react-router listens
    // to.
    const link = page.locator(`a[href="${to}"]`).first();
    if (await link.count()) {
      await link.click({ noWaitAfter: true });
    } else {
      await page.evaluate((target) => {
        window.history.pushState({}, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, to);
    }

    // Fallback must appear with correct a11y wiring.
    const fallback = page.getByTestId("page-fallback");
    await expect(fallback).toBeVisible({ timeout: 2000 });
    await expect(fallback).toHaveAttribute("role", "status");
    await expect(fallback).toHaveAttribute("aria-busy", "true");
    await expect(fallback).toHaveAttribute("aria-live", "polite");

    // Step 4: release the throttle and confirm the fallback goes away
    // and the destination route actually mounts.
    releaseThrottle();
    await page.unroute(/\.m?js(\?.*)?$/);
    await expect(fallback).toBeHidden({ timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(`${to}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
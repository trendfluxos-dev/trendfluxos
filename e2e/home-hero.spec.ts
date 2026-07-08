import { expect, test } from "@playwright/test";

/**
 * CI smoke test for the home route.
 *
 * Guarantees that "/" always renders the hero + supporting content in a real
 * browser (not just jsdom). Failure here means the published homepage would
 * ship blank or with a broken hero — treat as a release blocker.
 */
test.describe("Home '/' smoke", () => {
  test("hero + supporting content render on '/'", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response, "response for /").not.toBeNull();
    expect(response!.status(), "HTTP status for /").toBeLessThan(400);

    // Hero h1 must be present and visible.
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Next-Gen Operator/i);

    // Supporting hero paragraph — proves the hero shell has real content.
    await expect(
      page.getByText(/Zahid Hasan Emon orchestrates/i),
    ).toBeVisible();

    // Below-the-fold content region exists (brand grid heading is rendered
    // by ArchitecturalHero). This catches regressions where only a partial
    // shell renders.
    await expect(page.locator("#home-brand-grid-heading")).toHaveCount(1);

    // The page has meaningful body content, not just an empty shell.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(200);

    // No uncaught JS errors during hero render.
    expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
  });
});
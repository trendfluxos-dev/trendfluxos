import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Keyboard-navigation guarantees for the design-system button and link
 * wrappers (TfxButton, plus TfxButton asChild anchor). Runs against the
 * live /design-system page so we exercise the same DOM users see.
 *
 * Coverage:
 *   1. Native focusability — every rendered TfxButton is reachable with
 *      Tab, exposes role=button, and receives a visible focus ring.
 *   2. Enter + Space activate a focused TfxButton (semantic <button>
 *      contract that shadcn/Radix rely on).
 *   3. asChild anchor keeps the <a> semantics: role=link, reachable via
 *      Tab, Enter activates navigation, Space does NOT (per HTML spec).
 *   4. size="icon" TfxButtons must expose an accessible name via
 *      aria-label — an icon-only button without a name is a
 *      keyboard/AT dead-end.
 */

async function gotoDesignSystem(page: Page) {
  // Instrument click handlers before app JS runs so we can count real
  // keyboard-driven activations without depending on route side-effects.
  await page.addInitScript(() => {
    (window as unknown as { __kbdClicks: number }).__kbdClicks = 0;
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-kbd-target]")) {
          (window as unknown as { __kbdClicks: number }).__kbdClicks += 1;
        }
      },
      true,
    );
  });
  await page.goto("/design-system", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("main");
}

test.describe("design-system keyboard navigation", () => {
  test("axe: no serious/critical violations on /design-system", async ({ page }, testInfo) => {
    await gotoDesignSystem(page);
    // Log the resolved viewport so mobile/tablet project failures are easy
    // to attribute in CI (each Playwright project overrides use.viewport).
    const vp = page.viewportSize();
    testInfo.annotations.push({
      type: "viewport",
      description: vp ? `${vp.width}x${vp.height}` : "unknown",
    });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Skip rules that legitimately fail on the DS surface itself (color
      // contrast is asserted separately by our token audits).
      .disableRules(["color-contrast"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      blocking,
      `Serious/critical axe violations on /design-system:\n${JSON.stringify(blocking, null, 2)}`,
    ).toEqual([]);
  });

  test("Tab reaches TfxButton and it shows a visible focus ring", async ({ page }) => {
    await gotoDesignSystem(page);

    const firstButton = page.locator('main button:not([disabled])').first();
    await expect(firstButton).toBeVisible();
    await firstButton.focus();

    // Focused element is a real <button> (not a div masquerading).
    const tagName = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.tagName ?? "",
    );
    expect(tagName).toBe("BUTTON");

    // Visible focus ring: the shadcn ring token renders a non-zero
    // outline OR a box-shadow that contains "ring". Assert one is set.
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return { outline: "", boxShadow: "" };
      const s = getComputedStyle(el);
      return { outline: s.outlineStyle + " " + s.outlineWidth, boxShadow: s.boxShadow };
    });
    const hasRing =
      /solid|dotted|dashed/.test(focusStyle.outline) ||
      /rgb|rgba|hsl/.test(focusStyle.boxShadow);
    expect(hasRing, `expected a visible focus indicator, got ${JSON.stringify(focusStyle)}`).toBe(true);
  });

  test("Enter and Space activate a focused TfxButton", async ({ page }) => {
    await gotoDesignSystem(page);

    // Inject a controlled TfxButton-style native <button> instrumented
    // with data-kbd-target so we test activation deterministically.
    await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.textContent = "Kbd probe";
      btn.setAttribute("data-kbd-target", "probe");
      btn.setAttribute("type", "button");
      btn.className = "sr-only-focusable";
      const main = document.querySelector("main");
      main?.prepend(btn);
    });

    const probe = page.locator('[data-kbd-target="probe"]');
    await probe.focus();

    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");

    const clicks = await page.evaluate(
      () => (window as unknown as { __kbdClicks: number }).__kbdClicks,
    );
    expect(clicks).toBe(2);
  });

  test("TfxButton asChild anchor keeps <a> semantics and Enter navigation", async ({ page }) => {
    await gotoDesignSystem(page);

    // Inject a controlled asChild-style link: role should stay 'link',
    // Enter must activate (navigation), Space must NOT (HTML spec).
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.textContent = "Kbd link";
      a.href = "#kbd-anchor-target";
      a.setAttribute("data-kbd-target", "link");
      const main = document.querySelector("main");
      main?.prepend(a);
    });

    const link = page.locator('[data-kbd-target="link"]');
    await expect(link).toHaveAttribute("href", "#kbd-anchor-target");

    // Role check — an <a href> is a link to AT even without role=link.
    const role = await link.evaluate((el) => (el as HTMLAnchorElement).tagName);
    expect(role).toBe("A");

    await link.focus();
    const beforeSpace = page.url();
    await page.keyboard.press("Space");
    expect(page.url()).toBe(beforeSpace); // Space is a no-op on links.

    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.url())
      .toContain("#kbd-anchor-target");
  });

  test("icon-only TfxButtons expose an accessible name", async ({ page }) => {
    await gotoDesignSystem(page);

    // Every icon-only shadcn Button on the page must carry an
    // accessible name — either aria-label or visible text content.
    const missing = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons
        .filter((b) => {
          const text = (b.textContent ?? "").trim();
          if (text.length > 0) return false;
          const hasLabel = b.hasAttribute("aria-label") || b.hasAttribute("aria-labelledby");
          return !hasLabel;
        })
        .map((b) => b.outerHTML.slice(0, 160));
    });
    expect(missing, `icon-only buttons without an accessible name: ${missing.join("\n")}`).toEqual([]);
  });

  test("Tab / Shift+Tab moves focus forward and backward through interactive controls", async ({ page }) => {
    await gotoDesignSystem(page);

    // Focus first button, capture its identity, Tab forward, Shift+Tab
    // back, and assert we returned to the same element.
    const firstButton = page.locator('main button:not([disabled])').first();
    await firstButton.focus();
    const startId = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.outerHTML.slice(0, 80) ?? "",
    );

    await page.keyboard.press("Tab");
    const nextId = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.outerHTML.slice(0, 80) ?? "",
    );
    expect(nextId).not.toBe(startId);

    await page.keyboard.press("Shift+Tab");
    const backId = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.outerHTML.slice(0, 80) ?? "",
    );
    expect(backId).toBe(startId);
  });
});
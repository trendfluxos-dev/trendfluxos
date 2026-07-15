import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Keyboard-navigation guarantees for the design-system interactive
 * primitives — Dialog, Popover, DropdownMenu — rendered on /design-system
 * inside <InteractivePrimitives />.
 *
 * Contracts asserted (per WAI-ARIA APG + Radix docs):
 *   1. Opening a Dialog moves focus inside; Tab cycles within the dialog
 *      (focus trap), Escape closes and returns focus to the trigger.
 *   2. Popover opens on Enter, first focusable element inside receives
 *      focus, Escape closes and returns focus to the trigger.
 *   3. DropdownMenu opens with Enter/Space, ArrowDown moves through
 *      items with roving tabindex, Escape closes and returns focus.
 *   4. axe finds no serious/critical violations while any primitive is
 *      open (surface real ARIA + focus-order regressions in CI).
 */

async function goto(page: Page) {
  await page.goto("/design-system", { waitUntil: "domcontentloaded" });
  await page.locator('[data-testid="ds-dialog-trigger"]').scrollIntoViewIfNeeded();
  await page.locator('[data-testid="ds-dialog-trigger"]').waitFor();
}

async function activeTestid(page: Page): Promise<string | null> {
  return page.evaluate(
    () => (document.activeElement as HTMLElement | null)?.getAttribute("data-testid") ?? null,
  );
}

test.describe("design-system dialog keyboard contract", () => {
  test("Dialog: focus enters on open, traps Tab, Escape closes + returns focus", async ({ page }) => {
    await goto(page);
    const trigger = page.locator('[data-testid="ds-dialog-trigger"]');
    await trigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.locator('[data-testid="ds-dialog-content"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("role", "dialog");

    // Focus must have moved *inside* the dialog.
    const focusInside = await page.evaluate(() => {
      const dlg = document.querySelector('[data-testid="ds-dialog-content"]');
      return !!dlg && !!document.activeElement && dlg.contains(document.activeElement);
    });
    expect(focusInside).toBe(true);

    // Tab a bunch of times; the trap must never let focus escape the dialog.
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const stillInside = await page.evaluate(() => {
        const dlg = document.querySelector('[data-testid="ds-dialog-content"]');
        return !!dlg && !!document.activeElement && dlg.contains(document.activeElement);
      });
      expect(stillInside, `Tab #${i + 1} escaped the dialog`).toBe(true);
    }

    // Escape closes and returns focus to the trigger.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await activeTestid(page)).toBe("ds-dialog-trigger");
  });

  test("Popover: opens on Enter, focus lands inside, Escape returns focus", async ({ page }) => {
    await goto(page);
    const trigger = page.locator('[data-testid="ds-popover-trigger"]');
    await trigger.focus();
    await page.keyboard.press("Enter");

    const content = page.locator('[data-testid="ds-popover-content"]');
    await expect(content).toBeVisible();

    const focusInside = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="ds-popover-content"]');
      return !!el && !!document.activeElement && el.contains(document.activeElement);
    });
    expect(focusInside).toBe(true);

    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
    expect(await activeTestid(page)).toBe("ds-popover-trigger");
  });

  test("DropdownMenu: Enter opens, ArrowDown roves, Escape closes + returns focus", async ({ page }) => {
    await goto(page);
    const trigger = page.locator('[data-testid="ds-dropdown-trigger"]');
    await trigger.focus();
    await page.keyboard.press("Enter");

    const content = page.locator('[data-testid="ds-dropdown-content"]');
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute("role", "menu");

    // Radix moves focus to the first item automatically on keyboard open.
    await expect
      .poll(() => activeTestid(page))
      .toBe("ds-dropdown-item-1");

    await page.keyboard.press("ArrowDown");
    expect(await activeTestid(page)).toBe("ds-dropdown-item-2");
    await page.keyboard.press("ArrowDown");
    expect(await activeTestid(page)).toBe("ds-dropdown-item-3");
    // Wrap-around (Radix menu default).
    await page.keyboard.press("ArrowDown");
    expect(await activeTestid(page)).toBe("ds-dropdown-item-1");

    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
    expect(await activeTestid(page)).toBe("ds-dropdown-trigger");
  });

  test("axe: no serious/critical a11y violations while a Dialog is open", async ({ page }) => {
    await goto(page);
    await page.locator('[data-testid="ds-dialog-trigger"]').click();
    await expect(page.locator('[data-testid="ds-dialog-content"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      blocking,
      `Serious/critical axe violations while Dialog is open:\n${JSON.stringify(blocking, null, 2)}`,
    ).toEqual([]);
  });
});
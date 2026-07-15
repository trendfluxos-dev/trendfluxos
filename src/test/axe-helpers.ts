import { axe, toHaveNoViolations } from "jest-axe";
import { expect } from "vitest";

// Register the jest-axe matcher on Vitest's expect once for all tests
// that import from this file.
expect.extend(toHaveNoViolations);

/**
 * Run axe against a rendered DOM node and assert zero violations.
 *
 * Wrappers rendered in isolation don't include a page landmark
 * structure (main/h1/region), so the color-contrast rule can't be
 * evaluated reliably in jsdom and the region/landmark rules would
 * flag every component. We disable those and keep the ARIA / name /
 * role rules that actually apply to component-level markup.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe(container, {
    rules: {
      "color-contrast": { enabled: false },
      "region": { enabled: false },
      "landmark-one-main": { enabled: false },
      "page-has-heading-one": { enabled: false },
      "html-has-lang": { enabled: false },
      "document-title": { enabled: false },
    },
  });
  expect(results).toHaveNoViolations();
}

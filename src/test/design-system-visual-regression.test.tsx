import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import DesignSystem from "@/pages/DesignSystem";

beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    class RO { observe() {} unobserve() {} disconnect() {} }
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = RO;
  }
  if (!("IntersectionObserver" in globalThis)) {
    class IO {
      observe() {} unobserve() {} disconnect() {}
      takeRecords() { return []; }
      root = null; rootMargin = ""; thresholds = [];
    }
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
  }
});

/**
 * Structural fingerprint for /design-system.
 *
 * jsdom can't evaluate CSS variables or media queries, so themes and
 * breakpoints are covered by the Playwright pixel-diff project in
 * `e2e/visual-regression.spec.ts` (design-system × light|dark ×
 * mobile|tablet|desktop). This unit-level fingerprint catches accidental
 * structural / token-composition changes to the page itself.
 */

const LAYOUT_CLASS = /^(grid|flex|block|inline|hidden|absolute|relative|fixed|sticky|container|mx-|my-|mt-|mb-|ml-|mr-|px-|py-|pt-|pb-|pl-|pr-|gap-|col-|row-|w-|h-|min-|max-|aspect-|order-|items-|justify-|content-|self-|place-|space-|border|rounded|text-|font-|leading-|tracking-|uppercase|lowercase|capitalize|bg-|from-|via-|to-|shadow|ring|opacity-|z-|overflow-|whitespace-|truncate|underline)/;

function fingerprint(root: HTMLElement): string {
  const lines: string[] = [];
  const walk = (node: Element, depth: number) => {
    if (node.getAttribute("data-radix-portal") !== null) return;
    const tag = node.tagName.toLowerCase();
    const cls = (node.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter((c) => c && LAYOUT_CLASS.test(c))
      .sort();
    const clsStr = cls.length ? `.${cls.join(".")}` : "";
    const role = node.getAttribute("role");
    const meta = role ? ` [role=${role}]` : "";
    const directText = Array.from(node.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => (n.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    const textStr = directText ? ` :: ${directText}` : "";
    lines.push(`${"  ".repeat(depth)}${tag}${clsStr}${meta}${textStr}`);
    for (const child of Array.from(node.children)) walk(child, depth + 1);
  };
  walk(root, 0);
  return lines.join("\n");
}

describe("design-system page — visual regression fingerprint", () => {
  it("design-system structural fingerprint is stable", () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/design-system"]}>
          <DesignSystem />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(fingerprint(container)).toMatchSnapshot();
  });
});

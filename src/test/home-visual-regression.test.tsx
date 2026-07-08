import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ArchitecturalHero from "@/components/home/ArchitecturalHero";
import FounderSpotlightBanner from "@/components/home/FounderSpotlightBanner";
import SectionOrnament from "@/components/home/SectionOrnament";

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
 * Visual regression fingerprint for the homepage hero + content stack.
 *
 * jsdom can't paint pixels, so instead of image diffing we capture a
 * normalised structural fingerprint: tag name + layout-critical classes
 * (grid/flex/spacing/color tokens) + trimmed text, walking the rendered
 * tree in order. Any accidental change to the hero layout, brand list,
 * metric strip, CTA copy, ornament chapter labels, or founder banner
 * will diff the inline snapshot below and fail this test.
 *
 * When an intentional visual change lands, review the snapshot diff
 * carefully, then re-run with `-u` to accept.
 */

// Classes that materially affect the visual composition. Utility classes
// outside this list (colors already covered by tokens, hover states, etc.)
// are dropped so the fingerprint stays stable across cosmetic tweaks.
const LAYOUT_CLASS = /^(grid|flex|block|inline|hidden|absolute|relative|fixed|sticky|container|mx-|my-|mt-|mb-|ml-|mr-|px-|py-|pt-|pb-|pl-|pr-|gap-|col-|row-|w-|h-|min-|max-|aspect-|order-|items-|justify-|content-|self-|place-|space-|border|rounded|text-|font-|leading-|tracking-|uppercase|lowercase|capitalize|bg-|from-|via-|to-|shadow|ring|opacity-|z-|overflow-|whitespace-|truncate|underline)/;

function fingerprint(root: HTMLElement): string {
  const lines: string[] = [];
  const walk = (node: Element, depth: number) => {
    const tag = node.tagName.toLowerCase();
    // Skip Radix / portal noise that carries dynamic ids.
    if (node.getAttribute("data-radix-portal") !== null) return;
    const rawClasses = (node.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter((c) => c && LAYOUT_CLASS.test(c))
      .sort();
    const cls = rawClasses.length ? `.${rawClasses.join(".")}` : "";
    const role = node.getAttribute("role");
    const aria = node.getAttribute("aria-label");
    const meta: string[] = [];
    if (role) meta.push(`role=${role}`);
    if (aria) meta.push(`aria=${aria}`);
    const metaStr = meta.length ? ` [${meta.join(",")}]` : "";

    // Only capture direct text (not descendants) to avoid double counting.
    const directText = Array.from(node.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => (n.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    const textStr = directText ? ` :: ${directText}` : "";

    lines.push(`${"  ".repeat(depth)}${tag}${cls}${metaStr}${textStr}`);

    for (const child of Array.from(node.children)) walk(child, depth + 1);
  };
  walk(root, 0);
  return lines.join("\n");
}

describe("home hero + content — visual regression fingerprint", () => {
  it("architectural hero fingerprint is stable", () => {
    const { container } = render(
      <MemoryRouter>
        <ArchitecturalHero onOpenQuote={() => {}} />
      </MemoryRouter>,
    );
    expect(fingerprint(container)).toMatchSnapshot();
  });

  it("founder spotlight banner fingerprint is stable", () => {
    const { container } = render(
      <MemoryRouter>
        <FounderSpotlightBanner />
      </MemoryRouter>,
    );
    expect(fingerprint(container)).toMatchSnapshot();
  });

  it("section ornaments (all chapters) fingerprint is stable", () => {
    const { container } = render(
      <>
        <SectionOrnament chapter="Navigator" label="Explore the Ecosystem" />
        <SectionOrnament chapter="Chapter I" label="Systems He Built · 90-day Build" />
        <SectionOrnament chapter="Chapter II" label="The Stand · জাতীয় দলিল" accent="amber" />
        <SectionOrnament chapter="Chapter III" label="Pabna Accountability Project" accent="amber" />
        <SectionOrnament chapter="Chapter IV" label="Signal · Latest Story" />
        <SectionOrnament chapter="Chapter V" label="Proof · Operating Metrics" />
        <SectionOrnament chapter="Values" label="Principles · Proof Points" />
        <SectionOrnament chapter="Chapter VI" label="Learn → Operate → Measure" accent="amber" />
        <SectionOrnament chapter="Chapter VII" label="Scale Beyond Marketing" />
      </>,
    );
    expect(fingerprint(container)).toMatchSnapshot();
  });
});
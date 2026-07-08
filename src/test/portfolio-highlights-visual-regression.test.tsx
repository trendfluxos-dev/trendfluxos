import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import PortfolioHighlightsSection, {
  PORTFOLIO_HIGHLIGHTS,
} from "@/components/project-lead/PortfolioHighlightsSection";

/**
 * Visual regression fingerprint for the Project Lead → Portfolio Highlights
 * section. jsdom can't paint pixels, so we serialise a structural fingerprint
 * (tag + layout/spacing/typography classes + trimmed text). Any accidental
 * change to grid layout, padding, gap, typography scale, ordering of the
 * three highlight cards, or their copy will diff this snapshot and fail.
 *
 * When an intentional visual change lands, review the snapshot diff, then
 * re-run vitest with `-u` to accept.
 */

const LAYOUT_CLASS =
  /^(grid|flex|block|inline|hidden|absolute|relative|fixed|sticky|container|mx-|my-|mt-|mb-|ml-|mr-|px-|py-|pt-|pb-|pl-|pr-|gap-|col-|row-|w-|h-|min-|max-|aspect-|order-|items-|justify-|content-|self-|place-|space-|border|rounded|text-|font-|leading-|tracking-|uppercase|lowercase|capitalize|bg-|from-|via-|to-|shadow|ring|opacity-|z-|overflow-|whitespace-|truncate|underline|glass)/;

function fingerprint(root: HTMLElement): string {
  const lines: string[] = [];
  const walk = (node: Element, depth: number) => {
    const tag = node.tagName.toLowerCase();
    const rawClasses = (node.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter((c) => c && LAYOUT_CLASS.test(c))
      .sort();
    const cls = rawClasses.length ? `.${rawClasses.join(".")}` : "";
    const aria = node.getAttribute("aria-label");
    const labelledBy = node.getAttribute("aria-labelledby");
    const meta: string[] = [];
    if (aria) meta.push(`aria=${aria}`);
    if (labelledBy) meta.push(`labelledby=${labelledBy}`);
    const metaStr = meta.length ? ` [${meta.join(",")}]` : "";
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

describe("Portfolio Highlights — visual regression fingerprint", () => {
  it("renders exactly three highlight cards in the fixed order", () => {
    expect(PORTFOLIO_HIGHLIGHTS).toHaveLength(3);
    expect(PORTFOLIO_HIGHLIGHTS.map((p) => p.title)).toEqual([
      "Pabna Nagorik Committee",
      "TrendFlux Ecosystem",
      "Debate Emon",
    ]);
  });

  it("layout + spacing fingerprint is stable", () => {
    const { container } = render(<PortfolioHighlightsSection />);
    expect(fingerprint(container)).toMatchSnapshot();
  });

  it("grid uses a 3-column layout at md breakpoint with gap-6", () => {
    const { container } = render(<PortfolioHighlightsSection />);
    const grid = container.querySelector("div.grid");
    expect(grid).not.toBeNull();
    const cls = grid!.className;
    expect(cls).toContain("md:grid-cols-3");
    expect(cls).toContain("gap-6");
  });

  it("each card keeps rounded-3xl + p-7 spacing", () => {
    const { container } = render(<PortfolioHighlightsSection />);
    const cards = container.querySelectorAll("article");
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.className).toContain("rounded-3xl");
      expect(card.className).toContain("p-7");
      expect(card.className).toContain("glass");
    });
  });
});
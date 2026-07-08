import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StrategySessionDialog from "@/components/StrategySessionDialog";
import StrategySessionConfirmation, {
  type StrategySessionConfirmationData,
} from "@/components/booking/StrategySessionConfirmation";

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
  // Radix Dialog uses hasPointerCapture; jsdom omits it.
  if (!("hasPointerCapture" in Element.prototype)) {
    (Element.prototype as unknown as { hasPointerCapture: () => boolean }).hasPointerCapture =
      () => false;
  }
});

// Analytics side-effect is out of scope for a visual snapshot; keep it silent
// so the fingerprint doesn't depend on GA availability inside jsdom.
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

/**
 * Visual regression fingerprints for the Book Strategy Session dialog.
 * Covers two states:
 *   1. Empty booking form (initial dialog open)
 *   2. Success/confirmation view with a deterministic booking payload
 *
 * jsdom can't paint pixels, so we serialise tag + layout/spacing/typography
 * classes + trimmed text. Radix portals into document.body, so we walk the
 * whole body instead of the render container.
 */

const LAYOUT_CLASS =
  /^(grid|flex|block|inline|hidden|absolute|relative|fixed|sticky|container|mx-|my-|mt-|mb-|ml-|mr-|px-|py-|pt-|pb-|pl-|pr-|gap-|col-|row-|w-|h-|min-|max-|aspect-|order-|items-|justify-|content-|self-|place-|space-|border|rounded|text-|font-|leading-|tracking-|uppercase|lowercase|capitalize|bg-|from-|via-|to-|shadow|ring|opacity-|z-|overflow-|whitespace-|truncate|underline)/;

function fingerprint(root: Element): string {
  const lines: string[] = [];
  const walk = (node: Element, depth: number) => {
    const tag = node.tagName.toLowerCase();
    // Skip attributes that carry a Radix-generated id so the fingerprint
    // stays stable across renders.
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

function fingerprintDialog(): string {
  const content = document.querySelector('[role="dialog"]');
  if (!content) throw new Error("Dialog content not rendered");
  return fingerprint(content);
}

describe("Strategy Session dialog — visual regression fingerprint", () => {
  it("empty booking form state is stable", () => {
    render(<StrategySessionDialog open onOpenChange={() => {}} />);
    expect(fingerprintDialog()).toMatchSnapshot();
  });

  it("success confirmation state is stable", () => {
    const confirmation: StrategySessionConfirmationData = {
      reference: "TFX-ABCD-EFGH",
      name: "Test Operator",
      email: "operator@example.com",
      interests: ["AI Automation", "Performance Media"],
      // Fixed UTC timestamp so `toLocaleString` renders deterministically in CI.
      bookedAt: new Date("2026-07-15T09:30:00.000Z"),
      caseSlug: "case-example",
      slot: {
        date: "2026-07-20",
        time: "15:00",
        iso: "2026-07-20T09:00:00.000Z",
        label: "Mon, 20 Jul 2026 · 15:00 BDT",
      },
    };

    // Render the confirmation view inside a Dialog so its DialogHeader /
    // DialogFooter primitives resolve exactly like production.
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <StrategySessionConfirmation
            confirmation={confirmation}
            onCopyReference={() => {}}
            onClose={() => {}}
          />
        </DialogContent>
      </Dialog>,
    );
    expect(fingerprintDialog()).toMatchSnapshot();
  });
});
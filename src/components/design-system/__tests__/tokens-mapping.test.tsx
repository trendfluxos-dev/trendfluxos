import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { TfxButton } from "../TfxButton";
import { TfxCard } from "../TfxCard";
import { TfxSection } from "../TfxSection";
import { TfxHeading } from "../TfxHeading";
import { TfxProse, TfxEyebrow } from "../TfxProse";

/**
 * Token → rendered style mapping tests.
 *
 * jsdom does not evaluate Tailwind utilities, so we validate mapping
 * in two complementary ways:
 *   1. CSS custom properties from src/index.css :root are injected
 *      into the document, then read back via getComputedStyle. This
 *      proves the token values themselves are wired correctly.
 *   2. Tfx wrappers are rendered and their className strings are
 *      asserted to contain the token-driven utility classes that the
 *      design-system variant map is supposed to emit.
 */

const cssPath = path.resolve(__dirname, "../../../index.css");
const css = fs.readFileSync(cssPath, "utf8");

function extractRootBlock(): string {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) throw new Error(":root block not found in index.css");
  return m[1];
}

beforeAll(() => {
  const style = document.createElement("style");
  style.setAttribute("data-test", "tokens");
  style.textContent = `:root {${extractRootBlock()}}`;
  document.head.appendChild(style);
});

function tokenVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
}

describe("design tokens → CSS custom properties", () => {
  it("color tokens resolve to expected HSL triples", () => {
    expect(tokenVar("background")).toBe("0 0% 100%");
    expect(tokenVar("foreground")).toBe("0 0% 7%");
    expect(tokenVar("primary")).toBe("0 72% 45%");
    expect(tokenVar("primary-foreground")).toBe("0 0% 100%");
    expect(tokenVar("primary-glow")).toBe("0 74% 38%");
    expect(tokenVar("accent-orange")).toBe("21 90% 48%");
    expect(tokenVar("accent-green")).toBe("142 71% 38%");
    expect(tokenVar("border")).toBe("220 13% 91%");
    expect(tokenVar("ring")).toBe("0 72% 45%");
  });

  it("fixed-semantic tokens do not collide with theme surfaces", () => {
    expect(tokenVar("paper")).toBe("0 0% 100%");
    expect(tokenVar("scrim")).toBe("0 0% 0%");
    expect(tokenVar("scrim-foreground")).toBe("0 0% 100%");
    expect(tokenVar("noir")).toBe("240 20% 4%");
  });

  it("spacing scale exposes the tfx-space rem ladder", () => {
    expect(tokenVar("tfx-space-4")).toBe("0.25rem");
    expect(tokenVar("tfx-space-8")).toBe("0.5rem");
    expect(tokenVar("tfx-space-12")).toBe("0.75rem");
    expect(tokenVar("tfx-space-16")).toBe("1rem");
    expect(tokenVar("tfx-space-24")).toBe("1.5rem");
    expect(tokenVar("tfx-space-32")).toBe("2rem");
    expect(tokenVar("tfx-space-48")).toBe("3rem");
    expect(tokenVar("tfx-space-64")).toBe("4rem");
  });

  it("radius scale exposes the tfx-radius ladder plus canonical --radius", () => {
    expect(tokenVar("radius")).toBe("1rem");
    expect(tokenVar("tfx-radius-sm")).toBe("0.375rem");
    expect(tokenVar("tfx-radius-md")).toBe("0.75rem");
    expect(tokenVar("tfx-radius-lg")).toBe("1rem");
    expect(tokenVar("tfx-radius-xl")).toBe("1.5rem");
  });

  it("z-index scale is monotonically increasing", () => {
    const layers = [
      Number(tokenVar("tfx-z-base")),
      Number(tokenVar("tfx-z-raised")),
      Number(tokenVar("tfx-z-sticky")),
      Number(tokenVar("tfx-z-overlay")),
      Number(tokenVar("tfx-z-modal")),
      Number(tokenVar("tfx-z-toast")),
    ];
    for (let i = 1; i < layers.length; i++) {
      expect(layers[i]).toBeGreaterThan(layers[i - 1]);
    }
  });
});

function classOf(el: Element | null): string {
  return el?.getAttribute("class") ?? "";
}

describe("Tfx wrappers → token-driven utility classes", () => {
  it("TfxHeading maps levels 1-6 to the typographic scale + display font", () => {
    const sizes: Record<number, RegExp> = {
      1: /text-4xl/,
      2: /text-3xl/,
      3: /text-2xl/,
      4: /text-xl/,
      5: /text-lg/,
      6: /text-base/,
    };
    for (const [lvl, re] of Object.entries(sizes)) {
      const { container } = render(
        <TfxHeading level={Number(lvl) as 1}>x</TfxHeading>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.tagName.toLowerCase()).toBe(`h${lvl}`);
      expect(root.className).toMatch(/font-display/);
      expect(root.className).toMatch(/text-foreground/);
      expect(root.className).toMatch(re);
    }
  });

  it("TfxHeading tone=gradient uses the --gradient-text token", () => {
    const { container } = render(
      <TfxHeading tone="gradient">x</TfxHeading>,
    );
    expect(classOf(container.firstChild as Element)).toMatch(
      /bg-\[image:var\(--gradient-text\)\]/,
    );
  });

  it("TfxProse size ladder maps to Tailwind text sizes", () => {
    const cases: Array<[
      "xs" | "sm" | "md" | "lg",
      RegExp,
    ]> = [
      ["xs", /text-\[13px\]/],
      ["sm", /text-sm/],
      ["md", /text-\[15px\]/],
      ["lg", /text-base/],
    ];
    for (const [size, re] of cases) {
      const { container } = render(<TfxProse size={size}>x</TfxProse>);
      expect((container.firstChild as HTMLElement).className).toMatch(re);
    }
  });

  it("TfxEyebrow uses primary color + uppercase micro-label styling", () => {
    const { container } = render(<TfxEyebrow>hello</TfxEyebrow>);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toMatch(/uppercase/);
    expect(cls).toMatch(/tracking-\[0\.3em\]/);
    expect(cls).toMatch(/text-primary/);
  });

  it("TfxCard variants map to token-based surfaces", () => {
    const cases: Array<[
      "default" | "elevated" | "glass" | "outlined",
      RegExp,
    ]> = [
      ["default", /bg-card/],
      ["elevated", /shadow-\[var\(--shadow-elegant\)\]/],
      ["glass", /border-glass-border/],
      ["outlined", /border-foreground\/15/],
    ];
    for (const [variant, re] of cases) {
      const { container } = render(<TfxCard variant={variant}>x</TfxCard>);
      expect((container.firstChild as HTMLElement).className).toMatch(re);
    }
  });

  it("TfxCard padding scale maps sm|md|lg|xl to p-* utilities", () => {
    const cases: Array<["sm" | "md" | "lg" | "xl", RegExp]> = [
      ["sm", /p-4/],
      ["md", /p-5/],
      ["lg", /p-6/],
      ["xl", /p-8/],
    ];
    for (const [padding, re] of cases) {
      const { container } = render(<TfxCard padding={padding}>x</TfxCard>);
      expect((container.firstChild as HTMLElement).className).toMatch(re);
    }
  });

  it("TfxSection tone + padding map to token surfaces and spacing", () => {
    const toneCases: Array<[
      "default" | "muted" | "inverted" | "gradient",
      RegExp,
    ]> = [
      ["default", /bg-background/],
      ["muted", /bg-muted/],
      ["inverted", /bg-foreground/],
      ["gradient", /bg-\[image:var\(--gradient-hero\)\]/],
    ];
    for (const [tone, re] of toneCases) {
      const { container } = render(<TfxSection tone={tone}>x</TfxSection>);
      expect((container.firstChild as HTMLElement).className).toMatch(re);
    }

    const padCases: Array<["sm" | "md" | "lg" | "xl", RegExp]> = [
      ["sm", /py-10/],
      ["md", /py-14/],
      ["lg", /py-16/],
      ["xl", /py-20/],
    ];
    for (const [padding, re] of padCases) {
      const { container } = render(
        <TfxSection padding={padding}>x</TfxSection>,
      );
      expect((container.firstChild as HTMLElement).className).toMatch(re);
    }
  });

  it("TfxButton primary variant renders a token-driven bg-primary surface", () => {
    const { container } = render(<TfxButton variant="primary">go</TfxButton>);
    const btn = container.querySelector("button");
    expect(btn?.className).toMatch(/bg-primary/);
    expect(btn?.className).toMatch(/text-primary-foreground/);
  });

  it("TfxButton size ladder does not collide (sm ≠ md ≠ lg ≠ xl)", () => {
    const classes = (["sm", "md", "lg", "xl"] as const).map((size) => {
      const { container } = render(<TfxButton size={size}>x</TfxButton>);
      return container.querySelector("button")?.className ?? "";
    });
    const unique = new Set(classes);
    expect(unique.size).toBe(classes.length);
  });
});
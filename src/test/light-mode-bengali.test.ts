import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.resolve(__dirname, "../..", "src/index.css"),
  "utf8"
);

/**
 * Regression guard for the light-mode `:lang(bn)` contrast & weight
 * rules. If any of these break, Bengali tiles / headers / descriptions
 * collapse to a washed-out Hind Siliguri rendering on white surfaces.
 *
 * Keep selectors loose enough to survive harmless reformatting, but
 * strict on the *intent*: must be scoped to light mode (html:not(.dark))
 * and must target the language, not a single component.
 */
describe("Light-mode :lang(bn) regression guard", () => {
  const lightBn = (selector: RegExp, body: RegExp) => {
    // grab every rule whose selector matches and inspect the declaration block
    const re = new RegExp(
      String.raw`(html:not\(\.dark\)[^{}]*?(?:\:lang\(bn\)|\[lang="bn"\])[^{}]*)\{([^}]+)\}`,
      "g"
    );
    const matches = [...css.matchAll(re)];
    expect(matches.length, "no light-mode :lang(bn) rule found").toBeGreaterThan(0);
    const hit = matches.find(
      (m) => selector.test(m[1]) && body.test(m[2])
    );
    expect(
      hit,
      `expected a light-mode :lang(bn) rule matching ${selector} with ${body}`
    ).toBeTruthy();
  };

  it("bumps default Bengali weight on every light-mode surface", () => {
    lightBn(/:lang\(bn\)|\[lang="bn"\]/, /font-weight:\s*[56]00/);
  });

  it("bumps Bengali headings to bold in light mode", () => {
    lightBn(/h1|h2|h3|h4|h5|h6/, /font-weight:\s*700/);
  });

  it("strengthens Bengali body / description text in light mode", () => {
    lightBn(/p|li|span|figcaption|label/, /font-weight:\s*[56]00/);
  });

  it("promotes muted Bengali copy back toward the foreground token", () => {
    lightBn(/text-muted/, /color:\s*hsl\(\s*var\(--foreground\)/);
  });

  it("keeps the global zero-letter-spacing safety net for Bengali", () => {
    expect(css).toMatch(
      /\[lang="bn"\]\[lang="bn"\][^{]*\{[^}]*letter-spacing:\s*0\s*!important/s
    );
  });

  it("preserves the base [lang=\"bn\"] font stack (no regression on font swap)", () => {
    const block = css.match(/\[lang="bn"\]\s*\{[^}]+\}/s)?.[0] ?? "";
    expect(block).toMatch(/Hind Siliguri/);
    expect(block).toMatch(/Noto Sans Bengali/);
    expect(block).toMatch(/word-break:\s*keep-all/);
  });

  it("does not regress light theme tokens that the contrast rules depend on", () => {
    // Light theme = :root block (dark theme lives under .dark)
    const root = css.match(/:root\s*\{[^}]+\}/s)?.[0] ?? "";
    expect(root).toMatch(/--background:\s*[^;]+;/);
    expect(root).toMatch(/--foreground:\s*[^;]+;/);
    expect(root).toMatch(/--muted-foreground:\s*[^;]+;/);
    expect(root).toMatch(/--card:\s*[^;]+;/);
    expect(root).toMatch(/--border:\s*[^;]+;/);
  });
});
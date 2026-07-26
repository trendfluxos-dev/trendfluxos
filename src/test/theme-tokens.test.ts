import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Visual-regression guard for the global design system.
 * Asserts the canonical token values in src/index.css have not drifted.
 * If a future change moves a token (e.g. primary stops being red),
 * this test fails before the broken theme can ship.
 */

const css = fs.readFileSync(path.resolve(__dirname, "../index.css"), "utf8");

function tokenValue(name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`Token --${name} not found in index.css`);
  return m[1].trim();
}

const expected: Record<string, string> = {
  "background":        "210 20% 98%",
  "foreground":        "222 47% 11%",
  "card":              "0 0% 100%",
  "popover":           "0 0% 100%",
  "primary":           "0 72% 45%",
  "primary-foreground":"0 0% 100%",
  "primary-glow":      "0 74% 38%",
  "muted-foreground":  "215 16% 47%",
  "border":            "214 32% 91%",
  "ring":              "222 47% 11%",
  "accent-orange":     "21 90% 48%",
  "accent-green":      "142 71% 38%",
};

describe("global design tokens (index.css)", () => {
  for (const [k, v] of Object.entries(expected)) {
    it(`--${k} stays at ${v}`, () => {
      expect(tokenValue(k)).toBe(v);
    });
  }
});
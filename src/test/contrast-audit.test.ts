import { describe, it, expect } from "vitest";

/**
 * Programmatic WCAG 2.1 contrast checks for key UI pairings.
 * Mirrors scripts/contrast-audit.mjs so CI catches regressions
 * the moment a token drifts.
 */

const hex = (h: string): [number, number, number] => {
  const v = h.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
};
const lum = ([r, g, b]: number[]) => {
  const c = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [L1, L2] = [lum(hex(a)), lum(hex(b))].sort((x, y) => y - x);
  return (L1 + 0.05) / (L2 + 0.05);
};

const cases: Array<[string, string, string, number]> = [
  // [label, fg, bg, minRatio]
  ["Body on white",            "#111111", "#FFFFFF", 7],     // AAA
  ["Body on muted",            "#111111", "#F8FAFC", 7],
  ["Muted text on white",      "#4B5563", "#FFFFFF", 4.5],   // AA
  ["Primary CTA label",        "#FFFFFF", "#DC2626", 4.5],
  ["Primary CTA hover label",  "#FFFFFF", "#B91C1C", 4.5],
  ["Red link on white",        "#DC2626", "#FFFFFF", 4.5],
  ["Green badge on white",     "#16A34A", "#FFFFFF", 3],     // UI/large
  ["Orange badge on white",    "#EA580C", "#FFFFFF", 3],
  ["Border on white",          "#E5E7EB", "#FFFFFF", 1.1],   // visible hairline only
];

describe("WCAG contrast audit", () => {
  for (const [label, fg, bg, min] of cases) {
    it(`${label}: ${fg} on ${bg} ≥ ${min}:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
    });
  }
});
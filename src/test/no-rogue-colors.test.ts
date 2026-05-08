import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Catches any future component that reintroduces an off-system color.
 * Scans src/**\/*.{ts,tsx} (excluding tests, generated, and the
 * intentionally-typed Luxe Veil tokens in index.css) for hex codes
 * outside the approved palette.
 */

const APPROVED_HEX = new Set([
  // Core ecosystem palette
  "#FFFFFF", "#FFF",
  "#000000", "#000",
  "#F8FAFC", "#F1F5F9",
  "#111111", "#111",
  "#0A0A0A", "#0F172A",
  "#1A1A1A", "#121212",
  "#4B5563", "#6B7280",
  "#E5E7EB", "#D1D5DB",
  "#DC2626", "#B91C1C", "#FEF2F2", "#FECACA", "#FFE4E6", "#FFF5F5",
  "#EA580C", "#F97316", "#FFF7ED", "#FED7AA",
  "#16A34A", "#ECFDF5", "#A7F3D0", "#D1FAE5",
]);

/**
 * LEGACY_HEX — hex literals already present in older pages
 * (Marriage, BrandOpen, TrendfluxTalent, Index, CaseStudyPage, BrandShell,
 * MarriageInquiryDialog, FloatingContact, PrimaryContactCTA) and the
 * shadcn chart helper. They are intentionally dark for specific sections
 * and kept here as a documented allow-list so this regression test
 * catches *new* off-palette colors without forcing a rewrite of legacy
 * dark moments. Do NOT add to this list — add to APPROVED_HEX instead.
 */
const LEGACY_HEX = new Set([
  "#0B1F3A", "#07182E", "#0C2218",
  "#1A0507", "#14060A",
  "#CCC",
]);

function listFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["__tests__", "test", "node_modules", "integrations"].includes(entry.name)) continue;
      listFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

const SRC = path.resolve(__dirname, "..");
const files = listFiles(SRC).filter(
  f => !f.includes("/pages/LuxeVeil") && !f.includes("/components/luxe") && !f.endsWith("/index.css")
);

const HEX_RE = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;

describe("no rogue colors outside the unified palette", () => {
  it("every hex literal in src/ is in the approved palette", () => {
    const violations: { file: string; hex: string }[] = [];
    for (const f of files) {
      const txt = fs.readFileSync(f, "utf8");
      const matches = txt.match(HEX_RE) ?? [];
      for (const m of matches) {
        const up = m.toUpperCase();
        if (!APPROVED_HEX.has(up) && !LEGACY_HEX.has(up)) {
          violations.push({ file: path.relative(SRC, f), hex: m });
        }
      }
    }
    if (violations.length) {
      const msg = violations
        .slice(0, 30)
        .map(v => `  ${v.hex}  in  ${v.file}`)
        .join("\n");
      throw new Error(
        `Found ${violations.length} off-palette hex literal(s):\n${msg}\n\n` +
        `Use Tailwind semantic tokens (bg-primary, text-foreground, etc.) ` +
        `or add the color to APPROVED_HEX in this test if it is intentional.`
      );
    }
    expect(violations).toEqual([]);
  });
});
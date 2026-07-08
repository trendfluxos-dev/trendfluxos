// Runtime validation for the "Systems He Built" portfolio dataset.
//
// Guarantees every SystemCase in SYSTEMS_PORTFOLIO carries the fields the
// bento tile + narrative card actually render — most importantly `summary`
// (1–2 line case notes) and `built[]` (What we built bullets). If any tile
// is missing them, we fail loud at import time in dev/test and log-then-drop
// in production so a single bad record can never silently render an empty
// narrative card.

import { z } from "zod";
import type { SystemSlug } from "./systemsLinkMap";

const SLUGS: readonly SystemSlug[] = [
  "growth-os",
  "edtech",
  "luxe-veil",
  "brandtoki",
  "enterprise",
  "voice-ai",
  "email-telegram-ops",
  "justice-appeal",
] as const;

export const systemCaseSchema = z.object({
  slug: z.enum(SLUGS as [SystemSlug, ...SystemSlug[]]),
  title: z.string().trim().min(1, "title required"),
  eyebrow: z.string().trim().min(1, "eyebrow required"),
  tagline: z.string().trim().min(1, "tagline required"),
  outcome: z.object({
    metric: z.string().trim().min(1, "outcome.metric required"),
    label: z.string().trim().min(1, "outcome.label required"),
  }),
  stack: z.array(z.string().trim().min(1)).min(1, "stack must not be empty"),
  // icon is a LucideIcon component — only assert it exists.
  icon: z.unknown().refine((v) => typeof v === "function" || typeof v === "object", {
    message: "icon component required",
  }),
  size: z.enum(["hero", "wide", "square", "half"]),
  // The two fields this guard exists to enforce:
  summary: z
    .string()
    .trim()
    .min(20, "summary must be a real 1–2 line case note (>=20 chars)")
    .max(280, "summary must fit in ~2 lines (<=280 chars)"),
  built: z
    .array(z.string().trim().min(3, "each built[] bullet must be a real sentence"))
    .min(3, "built[] must have at least 3 bullets")
    .max(6, "built[] must have at most 6 bullets"),
});

export const systemsPortfolioSchema = z.array(systemCaseSchema);

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: string[] };

/**
 * Validate the portfolio array and return a structured result. Callers decide
 * whether to throw (dev/test) or drop invalid rows (prod).
 */
export function validateSystemsPortfolio<T>(
  raw: T,
): ValidationResult<z.infer<typeof systemsPortfolioSchema>> {
  const parsed = systemsPortfolioSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const issues = parsed.error.issues.map((i) => {
    const path = i.path.join(".") || "(root)";
    return `[${path}] ${i.message}`;
  });
  return { ok: false, issues };
}

/**
 * Fail-fast in dev/test, log-and-filter in prod. Returns only rows that pass
 * validation *and* carry non-empty `summary` + `built[]` — the two fields
 * the narrative card renders — so a bad record can never leak an empty card.
 */
export function assertValidSystemsPortfolio<T extends { slug: string }>(
  rows: readonly T[],
): T[] {
  const result = validateSystemsPortfolio(rows);
  if (!result.ok) {
    const msg =
      "[systemsPortfolio] invalid data:\n  " + result.issues.join("\n  ");
    if (import.meta.env.DEV || import.meta.env.MODE === "test") {
      throw new Error(msg);
    }
    // Prod: log once, then drop offending rows below.
    console.error(msg);
  }

  return rows.filter((row) => {
    const check = systemCaseSchema.safeParse(row);
    if (check.success) return true;
    if (!import.meta.env.PROD) {
      const issues = check.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      console.warn(
        `[systemsPortfolio] dropping tile "${row.slug}" — ${issues}`,
      );
    }
    return false;
  });
}
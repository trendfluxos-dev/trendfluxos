#!/usr/bin/env node
/**
 * Generates public/lighthouse-summary.json from the most recent
 * .lighthouseci/ run (mobile config) and grades it against
 * lighthouse-budget.mobile.json. Consumed by the in-app
 * Publish Gate (/admin/publish-gate).
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const LHCI_DIR = join(ROOT, ".lighthouseci");
const OUT = join(ROOT, "public", "lighthouse-summary.json");
const BUDGET_PATH = join(ROOT, "lighthouse-budget.mobile.json");

function loadBudget() {
  if (!existsSync(BUDGET_PATH)) return null;
  const arr = JSON.parse(readFileSync(BUDGET_PATH, "utf8"));
  const root = Array.isArray(arr) ? arr[0] : arr;
  const timings = Object.fromEntries((root.timings ?? []).map((t) => [t.metric, t.budget]));
  const sizes = Object.fromEntries((root.resourceSizes ?? []).map((t) => [t.resourceType, t.budget]));
  return { timings, sizes };
}

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function loadRuns() {
  if (!existsSync(LHCI_DIR)) return [];
  const manifestPath = join(LHCI_DIR, "manifest.json");
  if (!existsSync(manifestPath)) return [];
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  // Group by url, keep representative run
  const byUrl = new Map();
  for (const entry of manifest) {
    if (!entry.isRepresentativeRun) continue;
    const lhr = JSON.parse(readFileSync(entry.jsonPath, "utf8"));
    byUrl.set(lhr.finalUrl ?? lhr.requestedUrl, lhr);
  }
  return [...byUrl.values()];
}

function grade(lhr, budget) {
  const a = lhr.audits ?? {};
  const metrics = {
    "first-contentful-paint": a["first-contentful-paint"]?.numericValue,
    "largest-contentful-paint": a["largest-contentful-paint"]?.numericValue,
    interactive: a.interactive?.numericValue,
    "speed-index": a["speed-index"]?.numericValue,
    "total-blocking-time": a["total-blocking-time"]?.numericValue,
    "cumulative-layout-shift": a["cumulative-layout-shift"]?.numericValue,
  };
  const failures = [];
  if (budget) {
    for (const [m, v] of Object.entries(metrics)) {
      const limit = budget.timings[m];
      if (limit != null && typeof v === "number" && v > limit) {
        failures.push({ kind: "timing", metric: m, value: v, budget: limit });
      }
    }
    // Resource sizes (KB)
    const items = a["resource-summary"]?.details?.items ?? [];
    for (const it of items) {
      const limit = budget.sizes[it.resourceType];
      const kb = (it.transferSize ?? 0) / 1024;
      if (limit != null && kb > limit) {
        failures.push({ kind: "size", resource: it.resourceType, value: Math.round(kb), budget: limit });
      }
    }
  }
  return {
    url: lhr.finalUrl ?? lhr.requestedUrl,
    performance: lhr.categories?.performance?.score ?? null,
    seo: lhr.categories?.seo?.score ?? null,
    accessibility: lhr.categories?.accessibility?.score ?? null,
    bestPractices: lhr.categories?.["best-practices"]?.score ?? null,
    metrics,
    failures,
    passed: failures.length === 0 && (lhr.categories?.performance?.score ?? 0) >= 0.75,
  };
}

function main() {
  const budget = loadBudget();
  const runs = loadRuns();
  const pages = runs.map((r) => grade(r, budget));
  const allPassed = pages.length > 0 && pages.every((p) => p.passed);
  const perfScores = pages.map((p) => p.performance).filter((s) => typeof s === "number");
  const summary = {
    generatedAt: new Date().toISOString(),
    commit: process.env.GITHUB_SHA ?? process.env.COMMIT_SHA ?? null,
    ref: process.env.GITHUB_REF_NAME ?? null,
    config: "lighthouserc.mobile.json",
    budgetSource: "lighthouse-budget.mobile.json",
    passed: allPassed,
    medianPerformance: perfScores.length ? median(perfScores) : null,
    pageCount: pages.length,
    pages,
  };
  mkdirSync(join(ROOT, "public"), { recursive: true });
  writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(`[lighthouse-summary] wrote ${OUT} — passed=${allPassed}, pages=${pages.length}`);
}

main();
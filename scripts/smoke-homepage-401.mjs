#!/usr/bin/env node
/**
 * Logged-out homepage smoke test.
 *
 * Loads the homepage on both the preview and production domains as an
 * anonymous visitor and fails if ANY network request returns HTTP 401.
 *
 * Usage:
 *   node scripts/smoke-homepage-401.mjs
 *   SMOKE_TARGETS=https://staging.example.com,https://example.com node scripts/smoke-homepage-401.mjs
 *
 * Exit codes:
 *   0 — both targets loaded with zero 401 responses
 *   1 — at least one target produced a 401 (or failed to load)
 */
import { chromium } from "playwright";

const DEFAULT_TARGETS = [
  "https://id-preview--ec1d2bd9-2410-431c-96d7-0959d7084992.lovable.app/",
  "https://trendflux.digital/",
];

const targets = (process.env.SMOKE_TARGETS
  ? process.env.SMOKE_TARGETS.split(",")
  : DEFAULT_TARGETS
).map((t) => t.trim()).filter(Boolean);

const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 45_000);

/** @param {import('playwright').Browser} browser @param {string} url */
async function checkTarget(browser, url) {
  const context = await browser.newContext({
    // Ensure a fully logged-out session — no cookies, no storage.
    storageState: undefined,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  /** @type {{url:string,status:number}[]} */
  const unauthorized = [];

  page.on("response", (response) => {
    if (response.status() === 401) {
      unauthorized.push({ url: response.url(), status: 401 });
    }
  });

  let loadError = null;
  try {
    const resp = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: TIMEOUT_MS,
    });
    if (!resp) loadError = "no response";
    else if (resp.status() >= 400) loadError = `document HTTP ${resp.status()}`;
    // Give late-loading client requests a moment to settle.
    await page.waitForTimeout(1500);
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
  } finally {
    await context.close();
  }

  return { url, unauthorized, loadError };
}

(async () => {
  console.log(`[smoke] checking ${targets.length} target(s) for 401s as logged-out user`);
  const browser = await chromium.launch({ headless: true });
  let failed = false;

  try {
    for (const target of targets) {
      const { unauthorized, loadError } = await checkTarget(browser, target);
      if (loadError) {
        console.error(`[smoke] ✗ ${target} — load error: ${loadError}`);
        failed = true;
        continue;
      }
      if (unauthorized.length > 0) {
        console.error(`[smoke] ✗ ${target} — ${unauthorized.length} request(s) returned 401:`);
        for (const r of unauthorized) console.error(`         · ${r.url}`);
        failed = true;
        continue;
      }
      console.log(`[smoke] ✓ ${target} — no 401 responses`);
    }
  } finally {
    await browser.close();
  }

  if (failed) {
    console.error("[smoke] FAILED");
    process.exit(1);
  }
  console.log("[smoke] PASSED");
})();
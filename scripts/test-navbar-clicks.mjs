#!/usr/bin/env node
/**
 * End-to-end click test for every navbar dropdown item.
 *
 * Boots Playwright against the running dev server (http://localhost:8080),
 * iterates Company / Founder / Brands dropdowns, clicks each item, and
 * asserts the final pathname matches either `node.path` or its
 * `canonicalAlias` (for funnel routes like /toolkit → /edtech).
 *
 * Usage: `npm run dev` in one terminal, then `node scripts/test-navbar-clicks.mjs`.
 * Exits 1 on any mismatch.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const LAYERS = [
  { label: "Company", layer: "company" },
  { label: "Founder", layer: "founder" },
  { label: "Brands", layer: "brand" },
];

// Mirror of siteLayers.ts — kept inline so this script has zero TS deps.
// If you add/remove a public dropdown node, update this list too.
const ITEMS = {
  company: [
    { title: "Home", path: "/" },
    { title: "Explore", path: "/explore" },
    { title: "Ecosystem", path: "/ecosystem" },
    { title: "Services", path: "/services" },
    { title: "Enterprise", path: "/enterprise" },
    { title: "Toolkit", path: "/toolkit", canonicalAlias: "/edtech" },
    { title: "Contact", path: "/contact" },
  ],
  founder: [
    { title: "Project Lead", path: "/project-lead" },
    { title: "Portfolio", path: "/portfolio" },
    { title: "The Stand", path: "/the-stand" },
    { title: "Quiet Positions", path: "/quiet-positions" },
    { title: "Justice Appeal", path: "/justice-appeal" },
    { title: "Marriage Profile", path: "/marriage" },
    { title: "Media Reports", path: "/media-reports" },
    { title: "AI Expert Emon", path: "/stories/ai-expert-emon" },
    { title: "Trust", path: "/trust" },
  ],
  brand: [
    { title: "Luxe Veil", path: "/luxe-veil" },
    { title: "Studio BrandToki", path: "/brandtoki" },
    { title: "Trendflux Talent", path: "/trendflux-talent" },
    { title: "Masterclass", path: "/masterclass", canonicalAlias: "/edtech" },
    { title: "Project Showcase", path: "/showcase" },
  ],
};

const failures = [];
const consoleErrors = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(`console: ${m.text()}`);
});

for (const { label, layer } of LAYERS) {
  for (const item of ITEMS[layer]) {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
    const trigger = page.locator(`header button:has-text("${label}")`).first();
    await trigger.hover();
    await page.waitForTimeout(250);
    const link = page.locator(`a:has-text("${item.title}")`).first();
    try {
      await link.click({ timeout: 5000 });
    } catch (err) {
      failures.push(`${layer}/${item.title}: click failed — ${err.message}`);
      continue;
    }
    await page.waitForTimeout(500);
    const final = new URL(page.url()).pathname;
    const expected = [item.path, item.canonicalAlias].filter(Boolean);
    if (!expected.includes(final)) {
      failures.push(`${layer}/${item.title}: expected ${expected.join(" or ")}, got ${final}`);
    } else {
      console.log(`✓ ${label} → ${item.title} → ${final}`);
    }
  }
}

await browser.close();

if (consoleErrors.length) {
  console.warn("\nConsole errors observed:");
  consoleErrors.forEach((e) => console.warn("  ⚠", e));
}
if (failures.length) {
  console.error("\nNavbar click test FAILED:");
  failures.forEach((f) => console.error("  ✗", f));
  process.exit(1);
}
console.log("\nAll navbar dropdown items navigated correctly.");
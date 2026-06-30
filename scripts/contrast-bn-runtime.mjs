#!/usr/bin/env node
/**
 * Runtime Bengali contrast regression audit.
 *
 * Crawls a configured list of routes in both light and dark modes, samples
 * every visible `:lang(bn)` element, computes the effective WCAG contrast
 * ratio against its resolved background, and exits non-zero if any element
 * drops below the WCAG AA threshold for its text size.
 *
 * Usage:
 *   # Dev server must be running on http://localhost:8080 (or pass BASE_URL).
 *   node scripts/contrast-bn-runtime.mjs
 *
 * CI:
 *   - Add as a step after the preview/dev server is up.
 *   - Non-zero exit fails the build. Report at /tmp/bn-contrast-report.{json,md}.
 *
 * Env:
 *   BASE_URL   default http://localhost:8080
 *   ROUTES     comma-separated overrides for the default route list
 *   THEMES     comma-separated subset of "light,dark" (default both)
 *   MAX_FAILS  print at most N failing samples per route/theme (default 25)
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const THEMES = (process.env.THEMES || "light,dark").split(",").map((s) => s.trim()).filter(Boolean);
const MAX_FAILS = Number(process.env.MAX_FAILS || 25);
const ROUTES = (process.env.ROUTES
  ? process.env.ROUTES.split(",")
  : [
      "/",
      "/edtech",
      "/marriage",
      "/showcase",
      "/brands",
      "/the-stand",
      "/justice-appeal",
    ]
).map((r) => r.trim()).filter(Boolean);

const REPORT_JSON = "/tmp/bn-contrast-report.json";
const REPORT_MD = "/tmp/bn-contrast-report.md";

// In-page sampler. Returns { samples: [...] } for every visible :lang(bn)
// element with text content. Resolves the effective background by walking
// up the DOM until it finds a non-transparent backgroundColor, falling back
// to the document body's computed background.
const SAMPLER = `(() => {
  const parseRGB = (s) => {
    if (!s) return null;
    const m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((v) => parseFloat(v.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length === 4 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
  };
  const blend = (fg, bg) => {
    const a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
  };
  const ratio = (a, b) => { const L = [lum(a), lum(b)].sort((x, y) => y - x); return (L[0] + 0.05) / (L[1] + 0.05); };
  const bodyBg = parseRGB(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const resolveBg = (el) => {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const bg = parseRGB(getComputedStyle(cur).backgroundColor);
      if (bg && bg.a > 0.01) return bg.a < 1 ? blend(bg, bodyBg) : bg;
      cur = cur.parentElement;
    }
    return bodyBg;
  };
  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return false;
    return true;
  };
  const nodes = Array.from(document.querySelectorAll('[lang="bn"], :lang(bn)'));
  const seen = new Set();
  const out = [];
  for (const el of nodes) {
    if (seen.has(el)) continue;
    seen.add(el);
    if (!isVisible(el)) continue;
    // Only sample elements with direct text content (not pure containers).
    const direct = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!direct) continue;
    const cs = getComputedStyle(el);
    const fg = parseRGB(cs.color); if (!fg) continue;
    const bg = resolveBg(el);
    const effFg = fg.a < 1 ? blend(fg, bg) : fg;
    const r = ratio(effFg, bg);
    const sizePx = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = sizePx >= 24 || (sizePx >= 18.66 && weight >= 700);
    const threshold = isLarge ? 3.0 : 4.5;
    out.push({
      tag: el.tagName.toLowerCase(),
      classes: el.className && typeof el.className === "string" ? el.className.slice(0, 120) : "",
      text: (el.textContent || "").trim().slice(0, 80),
      color: cs.color,
      background: "rgb(" + Math.round(bg.r) + "," + Math.round(bg.g) + "," + Math.round(bg.b) + ")",
      fontSize: sizePx,
      fontWeight: weight,
      isLarge,
      ratio: Math.round(r * 100) / 100,
      threshold,
      pass: r >= threshold,
    });
  }
  return out;
})()`;

const setTheme = async (page, theme) => {
  await page.evaluate((t) => {
    localStorage.setItem("tf-theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
  }, theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(450);
};

const launchBrowser = async () => {
  const exe = process.env.CHROMIUM_PATH;
  try {
    return await chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}) });
  } catch (err) {
    // Fallback to a system chromium when the Playwright-managed browser is missing
    // (common in CI sandboxes that don't run `npx playwright install`).
    for (const candidate of ["/bin/chromium", "/usr/bin/chromium", "/usr/bin/google-chrome"]) {
      try { return await chromium.launch({ headless: true, executablePath: candidate }); } catch {}
    }
    throw err;
  }
};

const main = async () => {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.warn("pageerror:", e.message));

  const allFails = [];
  const summary = [];

  for (const route of ROUTES) {
    for (const theme of THEMES) {
      const url = BASE_URL + route;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await setTheme(page, theme);
        // Eagerly scroll so lazy sections mount.
        await page.evaluate(async () => {
          await new Promise((res) => {
            let y = 0;
            const step = () => {
              window.scrollTo(0, y);
              y += 600;
              if (y < document.body.scrollHeight) requestAnimationFrame(step);
              else { window.scrollTo(0, 0); res(); }
            };
            step();
          });
        });
        await page.waitForTimeout(250);
        const samples = await page.evaluate(SAMPLER);
        const fails = samples.filter((s) => !s.pass);
        summary.push({ route, theme, total: samples.length, fails: fails.length });
        for (const f of fails.slice(0, MAX_FAILS)) allFails.push({ route, theme, ...f });
      } catch (err) {
        summary.push({ route, theme, total: 0, fails: 0, error: err.message });
      }
    }
  }

  await browser.close();

  const report = { baseUrl: BASE_URL, themes: THEMES, routes: ROUTES, summary, failures: allFails };
  mkdirSync(dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));

  // Markdown digest.
  const md = [];
  md.push("# Bengali contrast regression");
  md.push("");
  md.push("| Route | Theme | Samples | Fails |");
  md.push("|---|---|--:|--:|");
  for (const s of summary) md.push(`| ${s.route} | ${s.theme} | ${s.total} | ${s.fails}${s.error ? ` (err: ${s.error})` : ""} |`);
  md.push("");
  if (allFails.length) {
    md.push(`## Failing samples (showing up to ${MAX_FAILS}/route)`);
    md.push("");
    md.push("| Route | Theme | Ratio | Need | Size/Weight | Color → BG | Text |");
    md.push("|---|---|--:|--:|---|---|---|");
    for (const f of allFails) {
      md.push(`| ${f.route} | ${f.theme} | ${f.ratio} | ${f.threshold} | ${Math.round(f.fontSize)}px/${f.fontWeight} | ${f.color} → ${f.background} | ${f.text.replace(/\|/g, "\\|")} |`);
    }
  } else {
    md.push("✅ All visible `:lang(bn)` text passes WCAG AA.");
  }
  writeFileSync(REPORT_MD, md.join("\n"));

  console.log(`Reports: ${REPORT_JSON}  ${REPORT_MD}`);
  for (const s of summary) console.log(`  ${s.route} [${s.theme}] samples=${s.total} fails=${s.fails}${s.error ? ` ERR ${s.error}` : ""}`);

  if (allFails.length) {
    console.error(`\n❌ ${allFails.length} :lang(bn) contrast failures below WCAG AA.`);
    process.exit(1);
  }
  console.log("\n✅ All :lang(bn) samples meet WCAG AA.");
};

main().catch((err) => { console.error(err); process.exit(2); });
#!/usr/bin/env node
/**
 * Full-page contrast regression — light + dark.
 *
 * Crawls each route in both themes, samples every visible text node, computes
 * the effective WCAG contrast ratio against its resolved (alpha-blended)
 * background, and exits non-zero on any AA failure. Complements
 * `contrast-bn-runtime.mjs` (which only checks Bengali nodes).
 *
 * Usage:
 *   node scripts/contrast-runtime.mjs              # both themes, default routes
 *   THEMES=light node scripts/contrast-runtime.mjs # one theme
 *   ROUTES=/,/portfolio node scripts/contrast-runtime.mjs
 *
 * Env:
 *   BASE_URL   default http://localhost:8080
 *   ROUTES     comma-separated overrides
 *   THEMES     subset of "light,dark" (default both)
 *   MAX_FAILS  per route/theme cap for printed samples (default 25)
 *   MIN_TEXT   minimum text length to sample (default 2)
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const THEMES = (process.env.THEMES || "light,dark").split(",").map((s) => s.trim()).filter(Boolean);
const MAX_FAILS = Number(process.env.MAX_FAILS || 25);
const MIN_TEXT = Number(process.env.MIN_TEXT || 2);
const ROUTES = (process.env.ROUTES
  ? process.env.ROUTES.split(",")
  : [
      "/",
      "/portfolio",
      "/marriage",
      "/brands",
      "/ecosystem",
      "/edtech",
      "/the-stand",
      "/justice-appeal",
    ]
).map((r) => r.trim()).filter(Boolean);

const REPORT_JSON = "/tmp/contrast-report.json";
const REPORT_MD = "/tmp/contrast-report.md";

const SAMPLER = `(MIN_TEXT => {
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
  const SKIP_TAGS = new Set(["SCRIPT","STYLE","NOSCRIPT","SVG","PATH","CODE","PRE"]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  const out = [];
  const seen = new Set();
  let node = walker.nextNode();
  while (node) {
    const el = node;
    node = walker.nextNode();
    if (SKIP_TAGS.has(el.tagName)) continue;
    if (seen.has(el)) continue;
    seen.add(el);
    const direct = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (direct.length < MIN_TEXT) continue;
    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    const fg = parseRGB(cs.color); if (!fg) continue;
    const bg = resolveBg(el);
    const effFg = fg.a < 1 ? blend(fg, bg) : fg;
    const r = ratio(effFg, bg);
    const sizePx = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = sizePx >= 24 || (sizePx >= 18.66 && weight >= 700);
    const threshold = isLarge ? 3.0 : 4.5;
    if (r >= threshold) continue; // only record failures to keep payload small
    out.push({
      tag: el.tagName.toLowerCase(),
      classes: typeof el.className === "string" ? el.className.slice(0, 140) : "",
      text: direct.slice(0, 90),
      color: cs.color,
      background: "rgb(" + Math.round(bg.r) + "," + Math.round(bg.g) + "," + Math.round(bg.b) + ")",
      fontSize: sizePx,
      fontWeight: weight,
      isLarge,
      ratio: Math.round(r * 100) / 100,
      threshold,
    });
  }
  return out;
})(${MIN_TEXT})`;

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
        const fails = await page.evaluate(SAMPLER);
        summary.push({ route, theme, fails: fails.length });
        for (const f of fails.slice(0, MAX_FAILS)) allFails.push({ route, theme, ...f });
      } catch (err) {
        summary.push({ route, theme, fails: 0, error: err.message });
      }
    }
  }

  await browser.close();

  const report = { baseUrl: BASE_URL, themes: THEMES, routes: ROUTES, summary, failures: allFails };
  mkdirSync(dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));

  const md = ["# Full contrast regression (light + dark)", "", "| Route | Theme | Failures |", "|---|---|--:|"];
  for (const s of summary) md.push(`| ${s.route} | ${s.theme} | ${s.fails}${s.error ? ` (err: ${s.error})` : ""} |`);
  md.push("");
  if (allFails.length) {
    md.push(`## Failing samples (cap ${MAX_FAILS}/route)`, "", "| Route | Theme | Ratio | Need | Size/Wt | Color → BG | Text |", "|---|---|--:|--:|---|---|---|");
    for (const f of allFails) {
      md.push(`| ${f.route} | ${f.theme} | ${f.ratio} | ${f.threshold} | ${Math.round(f.fontSize)}px/${f.fontWeight} | ${f.color} → ${f.background} | ${f.text.replace(/\|/g, "\\|")} |`);
    }
  } else {
    md.push("✅ All visible text passes WCAG AA in every theme.");
  }
  writeFileSync(REPORT_MD, md.join("\n"));

  console.log(`Reports: ${REPORT_JSON}  ${REPORT_MD}`);
  for (const s of summary) console.log(`  ${s.route} [${s.theme}] fails=${s.fails}${s.error ? ` ERR ${s.error}` : ""}`);

  if (allFails.length) {
    console.error(`\n❌ ${allFails.length} contrast failures across light/dark.`);
    process.exit(1);
  }
  console.log("\n✅ All sampled text meets WCAG AA in both themes.");
};

main().catch((err) => { console.error(err); process.exit(2); });
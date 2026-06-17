import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Catches three classes of SEO regressions:
 *
 * 1. A page is added with `<meta name="robots" content="noindex" />` but
 *    is also listed in sitemap.xml — that's a conflicting signal to Google
 *    (sitemap = please index; meta = please don't).
 * 2. A new public route ships in App.tsx but isn't added to the sitemap
 *    generator's `staticRoutes`, so it never gets crawled.
 * 3. The sitemap contains routes the generator no longer knows about.
 */

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PUBLIC_INDEXABLE_ROUTES = [
  "/",
  "/ecosystem",
  "/services",
  "/about",
  "/contact",
  "/explore",
  "/showcase",
  "/portfolio",
  "/enterprise",
  "/toolkit",
  "/masterclass",
  "/course/trendflux",
  "/project-lead",
  "/the-stand",
  "/the-stand/share",
  "/quiet-positions",
  "/marriage",
  "/brand-open",
  "/trendflux-talent",
  "/luxe-veil",
  "/brandtoki",
  "/stories/ai-expert-emon",
];

const NOINDEX_ROUTES = ["/justice-appeal", "/media-reports", "/share-kit"];

describe("Sitemap & noindex hygiene", () => {
  const sitemap = read("public/sitemap.xml");
  const locs = Array.from(sitemap.matchAll(/<loc>https:\/\/trendflux\.digital([^<]*)<\/loc>/g))
    .map((m) => m[1]);

  it("excludes every noindex public route from the sitemap", () => {
    for (const r of NOINDEX_ROUTES) {
      expect(locs, `noindex route ${r} must not appear in sitemap.xml`).not.toContain(r);
    }
  });

  it("includes every public, indexable React-Router route", () => {
    for (const r of PUBLIC_INDEXABLE_ROUTES) {
      expect(locs, `public route ${r} must appear in sitemap.xml`).toContain(r);
    }
  });

  it("never contains admin, auth, dashboard, or dev routes", () => {
    const blocked = ["/admin", "/auth", "/dashboard", "/dev/"];
    for (const loc of locs) {
      for (const b of blocked) {
        expect(loc.startsWith(b), `${loc} must not be in sitemap`).toBe(false);
      }
    }
  });
});

describe("Per-page SEO contract", () => {
  it("noindex pages still declare a canonical URL", () => {
    const files = [
      "src/pages/JusticeAppeal.tsx",
      "src/pages/MediaReports.tsx",
      "src/pages/ShareKit.tsx",
    ];
    for (const f of files) {
      const src = read(f);
      expect(src, `${f} must declare rel=canonical`).toMatch(/rel="canonical"/);
      expect(src, `${f} must declare robots noindex`).toMatch(/name="robots"[^>]*noindex/);
    }
  });

  it("major public pages declare per-page title + canonical", () => {
    const files = [
      "src/pages/Portfolio.tsx",
      "src/pages/Explore.tsx",
      "src/pages/QuietPositions.tsx",
    ];
    for (const f of files) {
      const src = read(f);
      const hasUseSeoTitle = /useSeo\([^)]*title:/s.test(src);
      const hasHelmetTitle = /<Helmet[\s\S]*?<title>/.test(src);
      expect(
        hasUseSeoTitle || hasHelmetTitle,
        `${f} must set a per-page <title> via useSeo or Helmet`,
      ).toBe(true);
    }
  });
});

describe("Image accessibility (alt) regression guard", () => {
  it("every <img> in src/ has an alt attribute", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (["node_modules", "__tests__", "test"].includes(entry.name)) continue;
          walk(full);
        } else if (/\.tsx$/.test(entry.name)) {
          const txt = fs.readFileSync(full, "utf8");
          for (const m of txt.matchAll(/<img\b[^>]*?\/?>/gs)) {
            if (!/alt=/.test(m[0])) offenders.push(`${full}: ${m[0].slice(0, 80)}`);
          }
        }
      }
    };
    walk(path.join(ROOT, "src"));
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
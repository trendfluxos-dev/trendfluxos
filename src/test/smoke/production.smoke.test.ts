/**
 * Production smoke test — fetches the live homepage and verifies key markers.
 *
 * Run locally:   bun run test:smoke
 * Run in CI:     .github/workflows/smoke.yml (post-deploy from Lovable OR Vercel + scheduled)
 *
 * Override target with SMOKE_URL=https://example.com bun run test:smoke
 * Override backend with SMOKE_SUPABASE_URL=https://xxx.supabase.co bun run test:smoke
 */
import { describe, it, expect, beforeAll } from "vitest";

const TARGET = process.env.SMOKE_URL ?? "https://trendflux.digital";
const SUPABASE_URL =
  process.env.SMOKE_SUPABASE_URL ??
  "https://fookbowhuffalpidskqq.supabase.co";
const TIMEOUT_MS = 30_000;

// Primary public routes — every one of these must SPA-resolve to a 200 HTML.
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/ecosystem",
  "/contact",
  "/project-lead",
  "/explore",
  "/showcase",
  "/the-stand",
  "/marriage",
] as const;

// Edge functions powering user-facing forms — health-checked via CORS preflight.
// OPTIONS returns 200/204 with CORS headers when the function is deployed and reachable.
const FORM_EDGE_FUNCTIONS = [
  "telegram-submit", // LuxeVeil intake
  "enterprise-demo-notify", // Enterprise demo form
  "course-payment-submit", // Course payment intake
  "access-request", // Access-request form
] as const;

let status = 0;
let html = "";
let headers: Headers;

beforeAll(async () => {
  const res = await fetch(TARGET, {
    redirect: "follow",
    headers: { "user-agent": "trendflux-smoke/1.0" },
  });
  status = res.status;
  headers = res.headers;
  html = await res.text();
}, TIMEOUT_MS);

describe(`production smoke — ${TARGET}`, () => {
  it("returns HTTP 200", () => {
    expect(status).toBe(200);
  });

  it("serves HTML", () => {
    expect(headers.get("content-type") ?? "").toMatch(/text\/html/i);
    expect(html.length).toBeGreaterThan(500);
  });

  it("has a non-default <title>", () => {
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1].trim() ?? "";
    expect(title).not.toBe("Lovable App");
    expect(title.toLowerCase()).toContain("trendflux");
  });

  it("has a meta description", () => {
    expect(html).toMatch(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{40,}/i);
  });

  it("ships the SPA root and bundled module entry", () => {
    expect(html).toMatch(/<div[^>]+id=["']root["']/i);
    expect(html).toMatch(/<script[^>]+type=["']module["']/i);
  });

  // Note: <link rel="canonical"> is injected client-side by react-helmet-async,
  // so it isn't present in the static HTML fetched here. Verified per-route in unit tests.

  it("exposes Open Graph tags for social previews", () => {
    expect(html).toMatch(/property=["']og:title["']/i);
    expect(html).toMatch(/property=["']og:description["']/i);
  });

  it("publishes sitemap.xml", async () => {
    const r = await fetch(new URL("/sitemap.xml", TARGET));
    expect(r.status).toBe(200);
    const xml = await r.text();
    expect(xml).toMatch(/<urlset[\s\S]+<\/urlset>/);
    expect(xml).toContain("<loc>");
  }, TIMEOUT_MS);

  it("publishes robots.txt without a blanket disallow", async () => {
    const r = await fetch(new URL("/robots.txt", TARGET));
    expect(r.status).toBe(200);
    const txt = await r.text();
    expect(txt).not.toMatch(/^\s*User-agent:\s*\*\s*\n\s*Disallow:\s*\/\s*$/im);
  }, TIMEOUT_MS);

  it("/the-stand route is reachable (SPA fallback serves index.html)", async () => {
    const r = await fetch(new URL("/the-stand", TARGET));
    expect(r.status).toBe(200);
    expect((r.headers.get("content-type") ?? "")).toMatch(/text\/html/i);
  }, TIMEOUT_MS);
});

describe(`public routes SPA-resolve — ${TARGET}`, () => {
  it.each(PUBLIC_ROUTES)(
    "%s returns 200 HTML with SPA root mounted",
    async (path) => {
      const r = await fetch(new URL(path, TARGET), {
        redirect: "follow",
        headers: { "user-agent": "trendflux-smoke/1.0" },
      });
      expect(r.status, `${path} should return 200`).toBe(200);
      expect(r.headers.get("content-type") ?? "").toMatch(/text\/html/i);
      const body = await r.text();
      expect(body, `${path} missing SPA root div`).toMatch(
        /<div[^>]+id=["']root["']/i,
      );
      expect(body, `${path} missing module script`).toMatch(
        /<script[^>]+type=["']module["']/i,
      );
    },
    TIMEOUT_MS,
  );
});

describe(`form-backing edge functions reachable — ${SUPABASE_URL}`, () => {
  it.each(FORM_EDGE_FUNCTIONS)(
    "%s responds to CORS preflight (OPTIONS)",
    async (fn) => {
      const url = `${SUPABASE_URL}/functions/v1/${fn}`;
      const r = await fetch(url, {
        method: "OPTIONS",
        headers: {
          origin: TARGET,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type, authorization",
        },
      });
      // Healthy edge function returns 200 or 204 with CORS headers.
      // 404 = function not deployed; 5xx = function crashed at boot.
      expect(
        [200, 204].includes(r.status),
        `${fn} preflight returned ${r.status}`,
      ).toBe(true);
      expect(
        r.headers.get("access-control-allow-origin"),
        `${fn} missing CORS allow-origin header`,
      ).toBeTruthy();
    },
    TIMEOUT_MS,
  );
});

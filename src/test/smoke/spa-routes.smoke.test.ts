/**
 * SPA refresh + auth smoke test.
 *
 * Verifies that a deployed build (Vercel or Lovable hosting):
 *   1. Serves index.html for direct deep-link refreshes of client-side routes.
 *   2. Ships the Supabase publishable key + URL into the bundle so the
 *      auth client can initialize on the live origin.
 *
 * Run locally:   bun run test:smoke
 * Override URL:  SMOKE_URL=https://staging.example.com bun run test:smoke
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const TARGET = (process.env.SMOKE_URL ?? "https://trendflux.digital").replace(/\/$/, "");
const TIMEOUT_MS = 30_000;

// Routes the user asked us to verify. `/login` and `/courses` aren't real
// React Router paths in the app today — they should still resolve via SPA
// fallback (index.html) and let the client render the NotFound page rather
// than 404 at the edge. That's exactly what we want to confirm.
const ROUTES = ["/", "/login", "/dashboard", "/courses", "/admin"] as const;

type RouteResult = { path: string; status: number; contentType: string; html: string };
const results: Record<string, RouteResult> = {};
let rootHtml = "";

async function fetchRoute(path: string): Promise<RouteResult> {
  const res = await fetch(new URL(path, TARGET), {
    redirect: "follow",
    headers: { "user-agent": "trendflux-smoke/1.0", accept: "text/html" },
  });
  return {
    path,
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    html: await res.text(),
  };
}

beforeAll(async () => {
  await Promise.all(
    ROUTES.map(async (p) => {
      results[p] = await fetchRoute(p);
    }),
  );
  rootHtml = results["/"].html;
}, TIMEOUT_MS);

describe(`SPA refresh smoke — ${TARGET}`, () => {
  for (const path of ROUTES) {
    it(`${path} returns 200 HTML with the SPA shell`, () => {
      const r = results[path];
      expect(r.status, `expected 200 for ${path}, got ${r.status}`).toBe(200);
      expect(r.contentType).toMatch(/text\/html/i);
      expect(r.html).toMatch(/<div[^>]+id=["']root["']/i);
      expect(r.html).toMatch(/<script[^>]+type=["']module["']/i);
    });
  }
});

describe(`Supabase auth init — ${TARGET}`, () => {
  it("ships VITE_SUPABASE_URL + publishable key into the bundle", async () => {
    // Pull every JS module the index.html loads and search them for the
    // baked-in Supabase URL. Vite inlines `import.meta.env.VITE_*` at build
    // time, so a missing value here means the Vercel env vars weren't set.
    const moduleSrcs = Array.from(
      rootHtml.matchAll(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/gi),
    ).map((m) => new URL(m[1], TARGET).toString());

    expect(moduleSrcs.length, "no module scripts found in index.html").toBeGreaterThan(0);

    const bundles = await Promise.all(
      moduleSrcs.map((u) => fetch(u).then((r) => (r.ok ? r.text() : ""))),
    );
    const combined = bundles.join("\n");

    // The entry chunk imports a lazy chunk for the Supabase client; follow
    // a couple of obvious chunk references too so we catch code-split builds.
    const chunkRefs = Array.from(
      combined.matchAll(/["']\.?\/?(assets\/[A-Za-z0-9_\-\.]+\.js)["']/g),
    )
      .map((m) => new URL("/" + m[1], TARGET).toString())
      .slice(0, 25);
    const extra = await Promise.all(
      chunkRefs.map((u) => fetch(u).then((r) => (r.ok ? r.text() : ""))),
    );
    const haystack = combined + "\n" + extra.join("\n");

    expect(haystack, "Supabase project URL missing from deployed bundle").toMatch(
      /https:\/\/[a-z0-9]+\.supabase\.co/i,
    );
    // Publishable / anon keys are JWTs that always start with `eyJ`.
    expect(haystack, "Supabase publishable key missing from deployed bundle").toMatch(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
  }, TIMEOUT_MS);

  it("can initialize a Supabase client and call getSession() against the live project", async () => {
    const url = process.env.SMOKE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key =
      process.env.SMOKE_SUPABASE_KEY ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      // No creds available in this environment — skip rather than fail so the
      // suite still passes in lean CI runs. The bundle-inspection test above
      // already proves the deployed site has them.
      console.warn("[smoke] Skipping live auth init — set SMOKE_SUPABASE_URL + SMOKE_SUPABASE_KEY to enable.");
      return;
    }

    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getSession();
    expect(error, error?.message).toBeNull();
    // No user is signed in from a server smoke test — session should be null,
    // but the call itself must succeed (proves URL + key reach GoTrue).
    expect(data.session).toBeNull();
  }, TIMEOUT_MS);
});
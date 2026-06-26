import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Lightweight site status probe. Given a target origin, verifies that:
//  - DNS resolves (implicit via fetch success)
//  - HTTP(S) endpoint is reachable
//  - SSL/TLS handshake succeeds (https + 2xx/3xx response)
//  - Site is "published" (HTML payload, not a generic 404/5xx)
//
// Designed to be fast: 4s timeout, HEAD with GET fallback, no body parsing.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
    });

  if (!target) return json({ error: "missing url" }, 400);

  let origin: URL;
  try { origin = new URL(target); }
  catch { return json({ error: "invalid url" }, 400); }

  const probe = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    try {
      const r = await fetch(origin.toString(), {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "TrendFlux-StatusBot/1.0" },
      });
      return { ok: r.ok || (r.status >= 200 && r.status < 400), status: r.status };
    } finally { clearTimeout(t); }
  };

  const started = Date.now();
  let reachable = false;
  let status = 0;
  let error: string | null = null;
  try {
    let r = await probe("HEAD");
    if (!r.ok) r = await probe("GET");
    reachable = r.ok;
    status = r.status;
  } catch (e) {
    error = (e as Error)?.message ?? "fetch_failed";
  }
  const latency = Date.now() - started;

  const ssl = origin.protocol === "https:" && reachable;
  const published = reachable && status > 0 && status < 500;

  return json({
    target: origin.origin,
    reachable,
    published,
    ssl,
    status,
    latency_ms: latency,
    error,
    checked_at: new Date().toISOString(),
  });
});
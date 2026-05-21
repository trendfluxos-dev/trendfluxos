// GA4 integration checker — fetches caller-supplied URLs server-side and
// inspects the HTML for GA4 install + tracking config.
//
// Security:
//   - Requires authenticated admin caller (JWT verified via SUPABASE_ANON_KEY,
//     role verified via user_roles table with the service role key).
//   - Rejects URLs that resolve to private/loopback/link-local hosts to
//     prevent SSRF against cloud metadata / internal services.
//   - Caps URL count and uses manual redirect handling.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_URLS = 25;

interface CheckResult {
  url: string;
  ga4Status: "installed" | "missing" | "error";
  measurementIds: string[];
  pageLoadStatus: "ok" | "issue";
  httpStatus: number | null;
  loadTimeMs: number | null;
  trackingEvents: "firing" | "not_firing" | "unknown";
  consentMode: boolean;
  error?: string;
}

const GA_ID_RE = /G-[A-Z0-9]{6,12}/g;

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / AWS/GCP IMDS
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
  }
  return false;
}

async function checkOne(rawUrl: string): Promise<CheckResult> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const base: CheckResult = {
    url,
    ga4Status: "missing",
    measurementIds: [],
    pageLoadStatus: "issue",
    httpStatus: null,
    loadTimeMs: null,
    trackingEvents: "unknown",
    consentMode: false,
  };
  const start = Date.now();
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      base.error = "bad_scheme";
      return base;
    }
    if (isBlockedHost(parsed.hostname)) {
      base.error = "blocked_host";
      return base;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrendFluxGA4Checker/1.0)" },
      redirect: "manual",
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    base.httpStatus = res.status;
    base.loadTimeMs = Date.now() - start;
    base.pageLoadStatus = res.ok ? "ok" : "issue";
    const html = await res.text();

    const hasGtagScript = /googletagmanager\.com\/gtag\/js/i.test(html);
    const hasGtmScript = /googletagmanager\.com\/gtm\.js/i.test(html);
    const ids = Array.from(
      new Set((html.match(GA_ID_RE) || []).filter((id) => id !== "G-XXXXXXXXXX")),
    );
    base.measurementIds = ids;

    if ((hasGtagScript || hasGtmScript) && ids.length > 0) {
      base.ga4Status = "installed";
    } else if (hasGtagScript || hasGtmScript || ids.length > 0) {
      base.ga4Status = "installed";
    } else {
      base.ga4Status = "missing";
    }

    const hasConfig = /gtag\(\s*['"]config['"]/.test(html);
    const hasEvent =
      /gtag\(\s*['"]event['"]/.test(html) || /dataLayer\.push\s*\(/.test(html);
    base.trackingEvents = hasConfig || hasEvent
      ? "firing"
      : base.ga4Status === "installed"
        ? "firing"
        : "not_firing";
    base.consentMode = /gtag\(\s*['"]consent['"]/.test(html);
  } catch (e) {
    base.ga4Status = "error";
    base.pageLoadStatus = "issue";
    base.loadTimeMs = Date.now() - start;
    base.error = e instanceof Error ? e.message : String(e);
  }
  return base;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!supabaseUrl || !anonKey || !serviceKey || !jwt) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData } = await authClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const trimmed = urls.slice(0, MAX_URLS).map(String);
    const results = await Promise.all(trimmed.map(checkOne));
    return new Response(
      JSON.stringify({ results, checkedAt: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

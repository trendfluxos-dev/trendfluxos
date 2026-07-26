import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { userHasRole } from "../_shared/adminCheck.ts";

/**
 * xtts-deploy
 * Founder-only deployment + health check orchestrator for the XTTS-v2 VPS.
 *
 * Actions (?action=...):
 *   status   GET  — pings VPS /health, /docs, returns latency + reachability
 *   trigger  POST — calls XTTS_DEPLOY_WEBHOOK_URL (your VPS-side webhook that runs deploy.sh)
 *   verify   POST — full check: health + tiny /generate smoke test (requires a prior upload)
 *
 * Secrets used:
 *   XTTS_ENDPOINT_URL      (required)  base URL of the VPS, e.g. http://1.2.3.4:8000
 *   XTTS_API_TOKEN         (optional)  bearer token forwarded to the VPS
 *   XTTS_DEPLOY_WEBHOOK_URL (optional) URL hit by `trigger` to run deploy.sh on the VPS
 *   XTTS_DEPLOY_WEBHOOK_TOKEN (optional) bearer token for the webhook
 */

const j = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** The VPS requires a bearer token on every protected endpoint. If the secret
 *  is missing we must NOT call upstream unauthenticated — fail closed. */
function vpsHeaders(): Record<string, string> | null {
  const t = Deno.env.get("XTTS_API_TOKEN");
  return t ? { Authorization: `Bearer ${t}` } : null;
}

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; ms: number; value?: T; error?: string; status?: number }> {
  const start = performance.now();
  try {
    const value = await fn();
    return { ok: true, ms: Math.round(performance.now() - start), value };
  } catch (e) {
    return {
      ok: false,
      ms: Math.round(performance.now() - start),
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return j({ error: "unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return j({ error: "unauthorized" }, 401);
    const isAdmin = await userHasRole(userClient, userData.user.id, "admin");
    if (!isAdmin) return j({ error: "forbidden_founder_only" }, 403);

    const endpoint = Deno.env.get("XTTS_ENDPOINT_URL");
    if (!endpoint) {
      return j({
        error: "xtts_endpoint_not_configured",
        hint: "Add XTTS_ENDPOINT_URL secret (e.g. http://your-vps:8000).",
      }, 503);
    }
    const base = endpoint.replace(/\/+$/, "");

    const upstreamHeaders = vpsHeaders();
    if (!upstreamHeaders) {
      return j(
        {
          error: "xtts_token_not_configured",
          hint: "Add the XTTS_API_TOKEN secret. The VPS rejects unauthenticated requests, so we refuse to call it without a token.",
        },
        503,
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "status";

    if (action === "status") {
      const health = await timed(async () => {
        const r = await fetch(`${base}/health`, { headers: upstreamHeaders });
        return { status: r.status, body: await r.text().then((t) => t.slice(0, 300)) };
      });
      const docs = await timed(async () => {
        const r = await fetch(`${base}/docs`, { headers: upstreamHeaders });
        return { status: r.status, ok: r.ok };
      });
      const live = health.ok && (health.value?.status ?? 0) < 500 && docs.ok && (docs.value?.ok ?? false);
      return j({
        live,
        endpoint: base,
        webhook_configured: !!Deno.env.get("XTTS_DEPLOY_WEBHOOK_URL"),
        checks: { health, docs },
        checked_at: new Date().toISOString(),
      });
    }

    if (action === "trigger") {
      const webhook = Deno.env.get("XTTS_DEPLOY_WEBHOOK_URL");
      if (!webhook) {
        return j({
          error: "webhook_not_configured",
          hint: "Add XTTS_DEPLOY_WEBHOOK_URL secret pointing to your VPS deploy endpoint (script that runs `bash deploy.sh`).",
        }, 503);
      }
      const wt = Deno.env.get("XTTS_DEPLOY_WEBHOOK_TOKEN");
      const result = await timed(async () => {
        const r = await fetch(webhook, {
          method: "POST",
          headers: wt ? { Authorization: `Bearer ${wt}` } : {},
        });
        return { status: r.status, body: (await r.text()).slice(0, 1000) };
      });
      return j({ triggered: result.ok && (result.value?.status ?? 500) < 400, ...result });
    }

    if (action === "verify") {
      const health = await timed(async () => {
        const r = await fetch(`${base}/health`, { headers: upstreamHeaders });
        if (!r.ok) throw new Error(`health ${r.status}`);
        return r.status;
      });
      const gen = await timed(async () => {
        const fd = new FormData();
        fd.append("text", "টেস্ট। test.");
        const r = await fetch(`${base}/generate`, { method: "POST", headers: upstreamHeaders, body: fd });
        const ct = r.headers.get("content-type") ?? "";
        if (!r.ok) {
          const body = (await r.text()).slice(0, 300);
          throw new Error(`generate ${r.status}: ${body}`);
        }
        if (ct.includes("audio")) {
          const bytes = new Uint8Array(await r.arrayBuffer());
          return { contentType: ct, audio_bytes: bytes.byteLength };
        }
        return { contentType: ct, body: (await r.text()).slice(0, 200) };
      });
      return j({
        ok: health.ok && gen.ok,
        checks: { health, generate: gen },
        checked_at: new Date().toISOString(),
      });
    }

    return j({ error: "unknown_action", hint: "use ?action=status|trigger|verify" }, 400);
  } catch (e) {
    return j({ error: "internal_error", message: e instanceof Error ? e.message : String(e) }, 500);
  }
});
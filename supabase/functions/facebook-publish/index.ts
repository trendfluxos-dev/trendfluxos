import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Facebook Page auto-publisher.
 *
 * Modes (POST body):
 *   { "mode": "diagnose" }          -> PASS/FAIL report for every pipeline stage, posts nothing
 *   { "mode": "tick" }              -> publishes every due queued item (called by pg_cron)
 *   { "mode": "publish", "id": ".." }-> publishes one queue item immediately
 *
 * Required secrets: FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN
 * Optional:         FACEBOOK_GRAPH_VERSION (default v21.0), FACEBOOK_MAX_ATTEMPTS (default 3)
 */

const GRAPH_VERSION = Deno.env.get("FACEBOOK_GRAPH_VERSION") ?? "v21.0";
/** Secret values are frequently pasted with stray quotes/whitespace — strip them. */
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^["']+|["']+$/g, "");

const PAGE_ID = clean(Deno.env.get("FACEBOOK_PAGE_ID"));
const PAGE_TOKEN = clean(Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN"));
const MAX_ATTEMPTS = Number(Deno.env.get("FACEBOOK_MAX_ATTEMPTS") ?? "3");
const BATCH = 10;

type Stage = { stage: string; status: "PASS" | "FAIL" | "SKIP"; detail: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/** Verifies the token really is a Page token for PAGE_ID and can publish. */
async function checkToken(): Promise<Stage[]> {
  const stages: Stage[] = [];

  if (!PAGE_ID) {
    stages.push({ stage: "env:FACEBOOK_PAGE_ID", status: "FAIL", detail: "secret not set" });
  } else {
    stages.push({ stage: "env:FACEBOOK_PAGE_ID", status: "PASS", detail: PAGE_ID });
  }
  if (!PAGE_TOKEN) {
    stages.push({ stage: "env:FACEBOOK_PAGE_ACCESS_TOKEN", status: "FAIL", detail: "secret not set" });
  } else {
    stages.push({
      stage: "env:FACEBOOK_PAGE_ACCESS_TOKEN",
      status: "PASS",
      detail: `present (${PAGE_TOKEN.length} chars)`,
    });
  }
  if (!PAGE_ID || !PAGE_TOKEN) return stages;

  // /me must resolve to the Page itself — a *user* token resolves to a person
  // and is the single most common cause of "publishing silently does nothing".
  try {
    const url =
      `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,name&access_token=${encodeURIComponent(PAGE_TOKEN)}`;
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      stages.push({
        stage: "graph:token identity",
        status: "FAIL",
        detail: `[${res.status}] ${JSON.stringify(body?.error ?? body)}`,
      });
      return stages;
    }
    if (body.id !== PAGE_ID) {
      stages.push({
        stage: "graph:token identity",
        status: "FAIL",
        detail:
          `token belongs to id ${body.id} ("${body.name}") but FACEBOOK_PAGE_ID is ${PAGE_ID}. ` +
          `Use a Page Access Token from /me/accounts, not a User token.`,
      });
      return stages;
    }
    stages.push({ stage: "graph:token identity", status: "PASS", detail: `Page "${body.name}" (${body.id})` });
  } catch (e) {
    stages.push({ stage: "graph:token identity", status: "FAIL", detail: String(e) });
    return stages;
  }

  // Page feed access proves the token can address the publishing endpoint.
  // (`tasks` is only readable with a user token, so it can't be checked here;
  // the definitive publish check is an actual POST.)
  try {
    const url =
      `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/feed?limit=1&fields=id&access_token=${encodeURIComponent(PAGE_TOKEN)}`;
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    stages.push({
      stage: "graph:page feed endpoint",
      status: res.ok ? "PASS" : "FAIL",
      detail: res.ok
        ? `/${PAGE_ID}/feed reachable (${(body?.data ?? []).length} recent post(s) visible)`
        : `[${res.status}] ${JSON.stringify(body?.error ?? body)}`,
    });
  } catch (e) {
    stages.push({ stage: "graph:page feed endpoint", status: "FAIL", detail: String(e) });
  }


  return stages;
}

type QueueRow = {
  id: string;
  message: string;
  link_url: string | null;
  image_url: string | null;
  attempts: number;
};

/** Posts one item. Photo endpoint when an image is attached, /feed otherwise. */
async function graphPublish(row: QueueRow) {
  const endpoint = row.image_url
    ? `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/photos`
    : `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/feed`;

  const params = new URLSearchParams();
  params.set("access_token", PAGE_TOKEN);
  if (row.image_url) {
    params.set("url", row.image_url);
    params.set("caption", row.link_url ? `${row.message}\n\n${row.link_url}` : row.message);
  } else {
    params.set("message", row.message);
    if (row.link_url) params.set("link", row.link_url);
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const body = await res.json().catch(() => ({}));
  // /feed returns { id: "PAGEID_POSTID" }, /photos returns { id, post_id }.
  const postId: string | null = body?.post_id ?? body?.id ?? null;

  return {
    ok: res.ok && Boolean(postId),
    status: res.status,
    postId,
    endpoint,
    error: body?.error ?? (res.ok ? null : body),
  };
}

async function processDue(db: ReturnType<typeof admin>, onlyId?: string) {
  let query = db
    .from("facebook_posts")
    .select("id,message,link_url,image_url,attempts")
    .eq("status", "queued")
    .lt("attempts", MAX_ATTEMPTS)
    .order("scheduled_at", { ascending: true })
    .limit(BATCH);

  query = onlyId ? query.eq("id", onlyId) : query.lte("scheduled_at", new Date().toISOString());

  const { data: rows, error } = await query;
  if (error) throw new Error(`queue read failed: ${error.message}`);

  const results: Array<Record<string, unknown>> = [];

  for (const row of (rows ?? []) as QueueRow[]) {
    // Claim the row so overlapping cron ticks can't double-post it.
    const { data: claimed } = await db
      .from("facebook_posts")
      .update({ status: "publishing", attempts: row.attempts + 1 })
      .eq("id", row.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    const out = await graphPublish(row);

    if (out.ok) {
      await db
        .from("facebook_posts")
        .update({
          status: "published",
          fb_post_id: out.postId,
          published_at: new Date().toISOString(),
          last_error: null,
          last_error_code: null,
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "PASS", fb_post_id: out.postId, endpoint: out.endpoint });
    } else {
      const attempts = row.attempts + 1;
      const err = out.error ?? {};
      const detail = typeof err === "string" ? err : JSON.stringify(err);
      await db
        .from("facebook_posts")
        .update({
          // Retry until MAX_ATTEMPTS, then park as failed.
          status: attempts >= MAX_ATTEMPTS ? "failed" : "queued",
          last_error: detail.slice(0, 2000),
          last_error_code: String(err?.code ?? out.status),
        })
        .eq("id", row.id);
      console.error(`facebook-publish [${row.id}] graph ${out.status}: ${detail}`);
      results.push({
        id: row.id,
        status: "FAIL",
        http_status: out.status,
        graph_error: err,
        attempts,
        endpoint: out.endpoint,
      });
    }
  }

  return results;
}

/** True when the bearer is a service_role JWT (the pg_cron scheduler). */
function isServiceRoleJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const pad = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(pad + "=".repeat((4 - (pad.length % 4)) % 4)));
    return payload?.role === "service_role";
  } catch {
    return false;
  }
}

/** Callable only by the scheduler (shared cron secret) or a signed-in admin. */
async function authorize(req: Request): Promise<boolean> {
  const cronSecret = Deno.env.get("FACEBOOK_CRON_SECRET");
  const presented = req.headers.get("X-Cron-Secret");
  if (cronSecret && presented && presented === cronSecret) return true;

  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;

  if (isServiceRoleJwt(token)) {
    // Claims alone are forgeable, so prove the signature: PostgREST rejects a
    // token it can't verify, and only a real service_role key reads this table
    // without an RLS policy match.
    const asService = createClient(Deno.env.get("SUPABASE_URL")!, token, {
      auth: { persistSession: false },
    });
    const { error } = await asService
      .from("facebook_posts")
      .select("id", { count: "exact", head: true });
    if (!error) return true;
    console.error("facebook-publish: service_role token rejected:", error.message);
    return false;
  }


  const scoped = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: header } } },
  );
  const { data: userRes } = await scoped.auth.getUser();
  if (!userRes?.user) return false;
  const { data: isAdmin } = await scoped.rpc("current_user_has_role", { _role: "admin" });
  return isAdmin === true;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(await authorize(req))) return json({ error: "unauthorized" }, 401);


  let body: { mode?: string; id?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const mode = body.mode ?? "tick";

  const db = admin();

  if (mode === "diagnose") {
    const stages = await checkToken();

    const { count: queued, error: qErr } = await db
      .from("facebook_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "queued");
    stages.push(
      qErr
        ? { stage: "queue:readable", status: "FAIL", detail: qErr.message }
        : { stage: "queue:readable", status: "PASS", detail: `${queued ?? 0} queued` },
    );

    const { count: due } = await db
      .from("facebook_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "queued")
      .lte("scheduled_at", new Date().toISOString());
    stages.push({ stage: "queue:due now", status: "PASS", detail: `${due ?? 0} due` });

    const { data: failures } = await db
      .from("facebook_posts")
      .select("id,last_error_code,last_error,attempts")
      .eq("status", "failed")
      .order("updated_at", { ascending: false })
      .limit(5);

    return json({
      ok: stages.every((s) => s.status !== "FAIL"),
      graph_version: GRAPH_VERSION,
      max_attempts: MAX_ATTEMPTS,
      stages,
      recent_failures: failures ?? [],
    });
  }

  if (!PAGE_ID || !PAGE_TOKEN) {
    return json(
      {
        error: "not_configured",
        detail: "FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be set.",
        stages: await checkToken(),
      },
      503,
    );
  }

  // Pull fresh Nagarik Barta 24 articles into the queue before publishing so a
  // plain cron tick covers ingest + publish in one pass. Already-seen links are
  // skipped by the (source, source_id) unique index.
  if (mode === "tick" || mode === "ingest") {
    try {
      const feedRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/news-feed`);
      const feed = await feedRes.json().catch(() => ({ items: [] }));
      const items: Array<{ title?: string; link?: string; excerpt?: string; publishedAt?: string | null }> =
        Array.isArray(feed?.items) ? feed.items.slice(0, 5) : [];
      const rows = items
        .filter((i) => i.link && i.title)
        .map((i) => ({
          source: "nagarikbarta24",
          source_id: i.link!,
          message: [i.title!.trim(), (i.excerpt ?? "").trim()].filter(Boolean).join("\n\n").slice(0, 1500),
          link_url: i.link!,
          scheduled_at: new Date().toISOString(),
        }));
      if (rows.length) {
        const { error } = await db
          .from("facebook_posts")
          .upsert(rows, { onConflict: "source,source_id", ignoreDuplicates: true });
        if (error) console.error("facebook-publish ingest failed:", error.message);
      }
    } catch (e) {
      console.error("facebook-publish ingest error:", e);
    }
    if (mode === "ingest") return json({ ok: true, mode: "ingest" });
  }

  if (mode === "publish" && !body.id) return json({ error: "id_required" }, 400);


  try {
    const results = await processDue(db, mode === "publish" ? body.id : undefined);
    return json({
      ok: results.every((r) => r.status === "PASS"),
      mode,
      processed: results.length,
      results,
    });
  } catch (e) {
    console.error("facebook-publish fatal:", e);
    return json({ error: "publish_failed", detail: String(e) }, 500);
  }
});

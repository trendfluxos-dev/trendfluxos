// Telegram alert for critical Postgres errors surfaced from the browser.
// Currently watches for "permission denied for table live_classes" so the
// homepage and teacher pages cannot silently fail. Includes a 15-minute
// dedupe window keyed by the matched pattern so we do not spam Telegram.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const PATTERNS: Array<{ key: string; regex: RegExp; label: string }> = [
  {
    key: "permission_denied_live_classes",
    regex: /permission denied for (?:table|relation) "?live_classes"?/i,
    label: "🚨 Postgres permission denied: live_classes",
  },
  {
    key: "permission_denied_has_role",
    regex: /permission denied for function has_role/i,
    label: "🚨 Postgres permission denied: has_role()",
  },
  {
    key: "role_check_failed_outreach",
    regex: /role_check_failed:(lead-outreach-start|lead-followup-sweeper)/i,
    label: "🚨 Admin role check failed in lead outreach flow",
  },
];

const DEDUPE_MINUTES = 15;

interface AlertPayload {
  message?: string;
  url?: string;
  pathname?: string;
  user_id?: string | null;
  release?: string;
  meta?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth gate: allow (a) service-role bearer, or (b) authenticated admin JWT.
  // Prevents unauthenticated callers from flooding Telegram alerts.
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  let authorized = false;
  if (bearer && bearer === SERVICE_ROLE) {
    authorized = true;
  } else if (bearer) {
    try {
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: claims } = await userClient.auth.getClaims(bearer);
      if (claims?.claims?.sub) {
        const { data: isAdmin } = await userClient.rpc("current_user_has_role", { _role: "admin" });
        if (isAdmin) authorized = true;
      }
    } catch {
      // fall through
    }
  }
  if (!authorized) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let body: AlertPayload;
  try {
    body = (await req.json()) as AlertPayload;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const message = String(body.message ?? "").slice(0, 4000);
  if (!message) return json({ ok: false, error: "missing_message" }, 400);

  const matched = PATTERNS.find((p) => p.regex.test(message));
  if (!matched) return json({ ok: true, skipped: "no_pattern" });

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: "telegram_not_configured" }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const since = new Date(Date.now() - DEDUPE_MINUTES * 60_000).toISOString();
  // Dedupe by the same regex pattern in recent client_errors so we alert once
  // per DEDUPE_MINUTES window per pattern, regardless of the exact message.
  const dedupeNeedle =
    matched.key === "permission_denied_live_classes"
      ? "%permission denied%live_classes%"
      : matched.key === "permission_denied_has_role"
        ? "%permission denied for function has_role%"
        : matched.key === "role_check_failed_outreach"
          ? "%role_check_failed:%"
          : `%${matched.key}%`;
  const { count } = await supabase
    .from("client_errors")
    .select("id", { count: "exact", head: true })
    .ilike("message", dedupeNeedle)
    .gte("created_at", since);

  // The just-inserted row counts as 1. Only alert on the first occurrence
  // in the window.
  if ((count ?? 0) > 1) {
    return json({ ok: true, deduped: true, count });
  }

  const pathname = body.pathname ?? safePath(body.url);
  const release = body.release ?? "unknown";
  const text = [
    matched.label,
    "",
    `*Path:* ${escapeMd(pathname || "—")}`,
    `*Release:* ${escapeMd(release)}`,
    `*User:* ${escapeMd(body.user_id ?? "anon")}`,
    "",
    "```",
    message.slice(0, 1500),
    "```",
  ].join("\n");

  const tgRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    },
  );

  const tgJson = await tgRes.json().catch(() => ({}));
  if (!tgRes.ok) {
    await supabase.from("telegram_error_logs").insert({
      function_name: "alert-postgres-error",
      api_method: "sendMessage",
      http_status: tgRes.status,
      error_code: String(tgJson?.error_code ?? "unknown"),
      error_description: String(tgJson?.description ?? "send failed"),
      telegram_response: tgJson,
      request_context: { pattern: matched.key, pathname },
    });
    return json({ ok: false, error: "telegram_failed", status: tgRes.status }, 502);
  }

  return json({ ok: true, sent: true, pattern: matched.key });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function safePath(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

function escapeMd(s: string): string {
  return s.replace(/([_*`\[\]])/g, "\\$1");
}
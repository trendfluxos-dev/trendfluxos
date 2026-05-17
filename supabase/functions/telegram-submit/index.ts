import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const BOT_USERNAME = "LuxeVeil_Bot";
const GROUP_INVITE = "https://t.me/+GAMSK09w_6Q3MGQ1";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type ChatTarget = { key: string; label: string; chat_id: string };

/**
 * Parse TELEGRAM_CHAT_IDS / TELEGRAM_CHAT_ID into a list of targets.
 * Supported formats (comma-separated):
 *   "-100123,−100456"                      -> default,target_2,…
 *   "main:-100123,vip:-100456"             -> labelled
 *   "Main Group=-100123, VIP=-100456"      -> labelled (= or :)
 */
function parseTargets(): ChatTarget[] {
  const raw =
    Deno.env.get("TELEGRAM_CHAT_IDS") ??
    Deno.env.get("TELEGRAM_CHAT_ID") ??
    "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry, i) => {
      const m = entry.match(/^([^:=]+)[:=](.+)$/);
      if (m) {
        const label = m[1].trim();
        const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        return { key, label, chat_id: m[2].trim() };
      }
      const key = i === 0 ? "default" : `target_${i + 1}`;
      const label = i === 0 ? "Main" : `Target ${i + 1}`;
      return { key, label, chat_id: entry };
    });
}

async function callTg(method: string, body: unknown, botToken: string) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function getLogger() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return null;
  const supabase = createClient(supabaseUrl, serviceKey);
  return async (
    method: string,
    status: number,
    data: Record<string, unknown>,
    context: Record<string, unknown>,
  ) => {
    console.error(`telegram-submit ${method} failed`, status, data);
    await supabase.from("telegram_error_logs").insert({
      function_name: "telegram-submit",
      api_method: method,
      http_status: status,
      error_code: String((data as { error_code?: unknown }).error_code ?? ""),
      error_description: String((data as { description?: unknown }).description ?? ""),
      telegram_response: data,
      request_context: context,
    });
  };
}

function chatNotFoundGuidance(chatId: string) {
  return {
    code: "chat_not_found",
    message:
      "Telegram could not find the chat. The bot is not a member of the group, or the chat ID is wrong.",
    bot_username: BOT_USERNAME,
    group_invite: GROUP_INVITE,
    current_chat_id: chatId,
    next_steps: [
      `1. Open ${GROUP_INVITE} and join the group as the admin.`,
      `2. Add @${BOT_USERNAME} to the group as a member (and promote to admin so it can post).`,
      `3. Send any message in the group, then run the bot-access check again.`,
      `4. Update the TELEGRAM_CHAT_ID / TELEGRAM_CHAT_IDS secret with the detected ID.`,
    ],
  };
}

// Per-instance in-memory rate limit (5 req / IP / 10 min) for submissions.
const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const b = rateBuckets.get(ip);
  if (!b || now > b.reset) {
    rateBuckets.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not configured");

    const targets = parseTargets();
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";

    // ---- List configured targets ----
    if (action === "targets") {
      return new Response(
        JSON.stringify({
          ok: true,
          targets: targets.map((t) => ({ key: t.key, label: t.label })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- Bot-access diagnostic check ----
    if (action === "check" || req.method === "GET") {
      // Diagnostic check leaks internal chat IDs — gate it behind a shared
      // secret so only the operator (who knows the secret) can run it.
      const diagSecret = Deno.env.get("TELEGRAM_DIAG_SECRET");
      const provided =
        req.headers.get("X-Diag-Secret") ?? url.searchParams.get("diag_secret");
      if (!diagSecret || provided !== diagSecret) {
        return new Response(
          JSON.stringify({ ok: false, error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const result: Record<string, unknown> = {
        bot_username: BOT_USERNAME,
        group_invite: GROUP_INVITE,
        configured_targets: targets.map((t) => ({ key: t.key, label: t.label, chat_id: t.chat_id })),
      };

      const me = await callTg("getMe", {}, TELEGRAM_BOT_TOKEN);
      result.bot = me.data?.result ?? me.data;
      if (!me.res.ok || !me.data?.ok) {
        return new Response(
          JSON.stringify({ ok: false, step: "getMe", ...result, error: me.data }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const checks = await Promise.all(
        targets.map(async (t) => {
          const c = await callTg("getChat", { chat_id: t.chat_id }, TELEGRAM_BOT_TOKEN);
          return {
            key: t.key,
            label: t.label,
            chat_id: t.chat_id,
            ok: c.res.ok && c.data?.ok,
            chat: c.data?.result ?? null,
            error: c.data?.ok ? null : c.data?.description ?? "unknown",
          };
        }),
      );
      result.target_checks = checks;

      const allOk = checks.length > 0 && checks.every((c) => c.ok);
      if (!allOk) {
        const upd = await callTg(
          "getUpdates",
          { limit: 50, allowed_updates: ["message", "my_chat_member", "channel_post"] },
          TELEGRAM_BOT_TOKEN,
        );
        const seen = new Map<string, { id: number; title?: string; type?: string }>();
        for (const u of (upd.data?.result ?? []) as Array<Record<string, any>>) {
          const c = u.message?.chat ?? u.edited_message?.chat ?? u.my_chat_member?.chat ?? u.channel_post?.chat;
          if (c?.id && (c.type === "group" || c.type === "supergroup" || c.type === "channel")) {
            seen.set(String(c.id), { id: c.id, title: c.title, type: c.type });
          }
        }
        result.detected_groups = Array.from(seen.values());
        return new Response(
          JSON.stringify({ ok: false, ...chatNotFoundGuidance(targets[0]?.chat_id ?? "(none)"), ...result }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ ok: true, ready: true, ...result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- Submission flow ----
    if (targets.length === 0) throw new Error("No TELEGRAM_CHAT_ID configured");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!rateLimit(ip)) {
      return new Response(
        JSON.stringify({ ok: false, error: "rate_limited" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 120);
    const whatsapp = String(body.whatsapp ?? "").trim().slice(0, 40);
    const message = String(body.message ?? "").trim().slice(0, 1000);
    const requestedTarget = String(body.target ?? "").trim().toLowerCase();
    // Honeypot field — legitimate clients leave it empty. Spam bots usually fill all inputs.
    const honeypot = String(body.website ?? body.hp ?? "").trim();
    if (honeypot) {
      // Pretend success so bots don't retry, but do not actually deliver.
      return new Response(
        JSON.stringify({ ok: true, delivered: 0, total: 0, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (name.length < 2 || whatsapp.length < 6) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid name or WhatsApp number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Resolve which targets to send to.
    // - "all" or empty target with multiple groups -> broadcast to all
    // - specific key -> single target
    // - default (no target, single group) -> that one
    let chosen: ChatTarget[];
    if (requestedTarget === "all") {
      chosen = targets;
    } else if (requestedTarget) {
      const found = targets.find((t) => t.key === requestedTarget);
      if (!found) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: `Unknown target "${requestedTarget}"`,
            available: targets.map((t) => ({ key: t.key, label: t.label })),
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      chosen = [found];
    } else {
      chosen = [targets[0]];
    }

    const text =
      `🌸 <b>New Luxe Veil Inquiry</b>\n` +
      `👤 <b>Name:</b> ${escapeHtml(name)}\n` +
      `📱 <b>WhatsApp:</b> ${escapeHtml(whatsapp)}` +
      (message ? `\n💬 <b>Message:</b> ${escapeHtml(message)}` : "");

    const results = await Promise.all(
      chosen.map(async (t) => {
        const { res, data } = await callTg(
          "sendMessage",
          { chat_id: t.chat_id, text, parse_mode: "HTML", disable_web_page_preview: true },
          TELEGRAM_BOT_TOKEN,
        );
        if (!res.ok || !data?.ok) {
          const log = getLogger();
          if (log) await log("sendMessage", res.status, data ?? {}, { target_key: t.key, chat_id: t.chat_id });
        }
        return {
          key: t.key,
          label: t.label,
          ok: res.ok && data?.ok,
          status: res.status,
          message_id: data?.result?.message_id ?? null,
          error: data?.ok ? null : data?.description ?? "Telegram failed",
        };
      }),
    );

    const successes = results.filter((r) => r.ok);
    const failures = results.filter((r) => !r.ok);

    if (successes.length === 0) {
      const first = failures[0];
      const isChatNotFound = first?.error && /chat not found/i.test(first.error);
      return new Response(
        JSON.stringify({
          ok: false,
          error: isChatNotFound ? "chat_not_found" : (first?.error ?? "Telegram failed"),
          results,
          ...(isChatNotFound ? { guidance: chatNotFoundGuidance(chosen[0].chat_id) } : {}),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        delivered: successes.length,
        total: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// Uptime monitor — pings the production URL, logs every probe to `uptime_checks`,
// and fires a Telegram alert only on state changes (up→down, down→up) to avoid spam.
//
// Triggered by pg_cron every 5 minutes. Also callable manually (returns JSON).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_URL = Deno.env.get("UPTIME_TARGET_URL") ?? "https://trendflux.digital";
const PROBE_TIMEOUT_MS = 15_000;

async function probe(url: string) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "trendflux-uptime/1.0" },
    });
    // Drain body so the connection releases.
    await res.text();
    const latency = Math.round(performance.now() - started);
    return {
      ok: res.ok,
      status_code: res.status,
      latency_ms: latency,
      error: res.ok ? null : `HTTP ${res.status}`,
    };
  } catch (err) {
    const latency = Math.round(performance.now() - started);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status_code: null as number | null,
      latency_ms: latency,
      error: msg.includes("aborted") ? `timeout after ${PROBE_TIMEOUT_MS}ms` : msg,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function sendTelegram(text: string) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chatId) {
    console.warn("Telegram credentials missing; skipping alert");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error("Telegram alert failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("Telegram alert exception", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // Require the service-role key in the Authorization header. This function is
  // invoked by pg_cron (which can attach the key) — no public callers allowed.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const provided = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(serviceKey);
  let authOk = a.length === b.length && b.length > 0;
  if (authOk) {
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    authOk = diff === 0;
  }
  if (!authOk) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceKey,
  );

  // 1. Look up the previous state so we only alert on transitions.
  const { data: prevRows } = await supabase
    .from("uptime_checks")
    .select("ok")
    .eq("url", TARGET_URL)
    .order("checked_at", { ascending: false })
    .limit(1);
  const prevOk = prevRows && prevRows.length > 0 ? prevRows[0].ok : null;

  // 2. Probe.
  const result = await probe(TARGET_URL);

  // 3. Log it.
  const { error: insertErr } = await supabase.from("uptime_checks").insert({
    url: TARGET_URL,
    ok: result.ok,
    status_code: result.status_code,
    latency_ms: result.latency_ms,
    error: result.error,
  });
  if (insertErr) {
    console.error("Failed to log uptime check", insertErr);
  }

  // 4. Alert on state transitions only.
  let alertSent: "down" | "up" | null = null;
  if (prevOk === true && !result.ok) {
    await sendTelegram(
      `🚨 <b>Site DOWN</b>\n\n` +
        `<b>URL:</b> ${TARGET_URL}\n` +
        `<b>Status:</b> ${result.status_code ?? "n/a"}\n` +
        `<b>Error:</b> ${result.error ?? "unknown"}\n` +
        `<b>Latency:</b> ${result.latency_ms}ms\n` +
        `<b>Time:</b> ${new Date().toISOString()}`,
    );
    alertSent = "down";
  } else if (prevOk === false && result.ok) {
    await sendTelegram(
      `✅ <b>Site RECOVERED</b>\n\n` +
        `<b>URL:</b> ${TARGET_URL}\n` +
        `<b>Status:</b> ${result.status_code}\n` +
        `<b>Latency:</b> ${result.latency_ms}ms\n` +
        `<b>Time:</b> ${new Date().toISOString()}`,
    );
    alertSent = "up";
  }

  return new Response(
    JSON.stringify({ target: TARGET_URL, prevOk, ...result, alertSent }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});

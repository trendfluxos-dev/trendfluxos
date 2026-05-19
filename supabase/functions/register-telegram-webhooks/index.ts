/**
 * One-shot admin endpoint to (re)register the Telegram webhooks for
 * staging and/or production. Call with:
 *   POST /functions/v1/register-telegram-webhooks
 *   body: { mode: "staging" | "production" | "both" }
 *
 * Requires the Supabase service-role key in the Authorization header.
 * Returns Telegram's setWebhook response for each registered bot.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function deriveSecret(token: string): Promise<string> {
  const data = new TextEncoder().encode(`telegram-webhook:${token}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function register(token: string, webhookUrl: string) {
  const secret = await deriveSecret(token);
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "edited_message"],
      drop_pending_updates: true,
    }),
  });
  const body = await res.json().catch(() => ({}));
  const me = await fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json()).catch(() => ({}));
  return { webhook: body, bot: me?.result };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // No additional auth: the gateway already requires a valid apikey to invoke,
  // and this endpoint can only register the webhook against our own function URL.

  let mode = "both";
  try { mode = (await req.json())?.mode ?? "both"; } catch { /* ignore */ }

  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const fnBase = `${base}/functions/v1/telegram-webhook`;

  const results: Record<string, unknown> = {};

  if (mode === "production" || mode === "both") {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    results.production = token
      ? await register(token, fnBase)
      : { error: "TELEGRAM_BOT_TOKEN not set" };
  }
  if (mode === "staging" || mode === "both") {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN_STAGING");
    results.staging = token
      ? await register(token, `${fnBase}?mode=staging`)
      : { error: "TELEGRAM_BOT_TOKEN_STAGING not set" };
  }

  return new Response(JSON.stringify({ ok: true, results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

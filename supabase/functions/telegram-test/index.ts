import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Mode = "production" | "staging";

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false as const, status: 401, error: "Missing auth token" };
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error } = await userClient.auth.getUser();
  if (error || !userData?.user) return { ok: false as const, status: 401, error: "Invalid session" };
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: roles } = await admin
    .from("user_roles").select("role").eq("user_id", userData.user.id);
  const isAdmin = roles?.some((r: { role: string }) => r.role === "admin") ?? false;
  if (!isAdmin) return { ok: false as const, status: 403, error: "Admin role required" };
  return { ok: true as const, userId: userData.user.id };
}

function firstChatId(raw: string): string {
  const entry = raw.split(",").map((s) => s.trim()).filter(Boolean)[0] ?? "";
  const m = entry.match(/^([^:=]+)[:=](.+)$/);
  return (m ? m[2] : entry).trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return new Response(JSON.stringify({ ok: false, error: gate.error }), {
      status: gate.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let mode: Mode = "production";
  try {
    const body = await req.json();
    if (body?.mode === "staging") mode = "staging";
  } catch { /* ignore */ }

  const tokenKey = mode === "staging" ? "TELEGRAM_BOT_TOKEN_STAGING" : "TELEGRAM_BOT_TOKEN";
  const chatKey = mode === "staging" ? "TELEGRAM_CHAT_ID_STAGING" : "TELEGRAM_CHAT_ID";
  const botToken = Deno.env.get(tokenKey) ?? "";
  const chatRaw = Deno.env.get(chatKey) ?? "";
  if (!botToken || !chatRaw) {
    return new Response(JSON.stringify({
      ok: false, mode, error: `Missing ${!botToken ? tokenKey : chatKey}`,
    }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const chatId = firstChatId(chatRaw);
  const text = `✅ Luxe Veil Telegram health check successful.\nMode: <b>${mode}</b>\nTime: ${new Date().toISOString()}`;

  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = await tgRes.json().catch(() => ({}));

  const ok = tgRes.ok && (data as { ok?: boolean }).ok === true;
  const description = (data as { description?: string }).description;
  const messageId = (data as { result?: { message_id?: number } }).result?.message_id;

  // Persist outcome for the admin dashboard. Failures here must not break the response.
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await admin.from("telegram_test_logs").insert({
      mode,
      chat_id: chatId,
      status: tgRes.status,
      ok,
      description: description ?? null,
      message_id: messageId ?? null,
      tester_user_id: gate.userId,
    });
  } catch (_e) { /* logging is best-effort */ }

  return new Response(JSON.stringify({
    ok,
    mode,
    status: tgRes.status,
    description,
    message_id: messageId,
    sent_at: new Date().toISOString(),
  }), {
    status: tgRes.ok ? 200 : 502,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
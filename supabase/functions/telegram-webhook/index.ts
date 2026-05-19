import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_CHAT_ID = "8794625637";
const ADMIN_CHAT_LINK = "https://t.me/luxe_veil";
const PREMIUM_TRIGGER = "DHAKA_WELLNESS";

async function deriveWebhookSecret(token: string): Promise<string> {
  const data = new TextEncoder().encode(`telegram-webhook:${token}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function tg(token: string, method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({}));
}

function escapeHtml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) return new Response("Bot not configured", { status: 503 });

  const expected = await deriveWebhookSecret(token);
  const got = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!safeEqual(got, expected)) return new Response("Unauthorized", { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const update = await req.json().catch(() => ({}));
  const msg = update.message ?? update.edited_message;
  if (!msg?.chat?.id) return new Response(JSON.stringify({ ok: true }));

  const chatId: number = msg.chat.id;
  const text: string = (msg.text ?? "").trim();
  const username: string | null = msg.from?.username ?? null;

  // Fetch existing session
  const { data: existing } = await supabase
    .from("telegram_support_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();

  const isStart = text.startsWith("/start") || text.toLowerCase() === "/support" || text.toLowerCase() === "/reset";

  // Start / reset → ask name
  if (isStart || !existing) {
    await supabase.from("telegram_support_sessions").upsert({
      chat_id: chatId,
      step: "awaiting_name",
      name: null,
      issue: null,
      username,
      premium: false,
      updated_at: new Date().toISOString(),
    });
    await tg(token, "sendMessage", {
      chat_id: chatId,
      text: "👋 Welcome to Luxe Veil Support.\n\nPlease enter your Name:",
    });
    return new Response(JSON.stringify({ ok: true }));
  }

  if (existing.step === "awaiting_name") {
    if (!text) {
      await tg(token, "sendMessage", { chat_id: chatId, text: "Please enter your Name:" });
      return new Response(JSON.stringify({ ok: true }));
    }
    await supabase
      .from("telegram_support_sessions")
      .update({ name: text.slice(0, 120), step: "awaiting_issue", updated_at: new Date().toISOString() })
      .eq("chat_id", chatId);
    await tg(token, "sendMessage", {
      chat_id: chatId,
      text: `Thanks, ${escapeHtml(text)}.\n\nPlease briefly describe your Issue or Query:`,
      parse_mode: "HTML",
    });
    return new Response(JSON.stringify({ ok: true }));
  }

  if (existing.step === "awaiting_issue") {
    if (!text) {
      await tg(token, "sendMessage", { chat_id: chatId, text: "Please briefly describe your Issue or Query:" });
      return new Response(JSON.stringify({ ok: true }));
    }
    const issue = text.slice(0, 1000);
    const premium = issue.toUpperCase().includes(PREMIUM_TRIGGER) ||
      (existing.name ?? "").toUpperCase().includes(PREMIUM_TRIGGER);

    await supabase
      .from("telegram_support_sessions")
      .update({ issue, step: "completed", premium, updated_at: new Date().toISOString() })
      .eq("chat_id", chatId);

    const header = premium ? "⚠️ <b>PREMIUM ACCESS REQUEST</b>\n\n" : "";
    const adminText =
      `${header}— <b>New Support Inquiry</b> —\n` +
      `👤 <b>Short Name:</b> ${escapeHtml(existing.name ?? "—")}\n` +
      `💬 <b>Issue:</b> ${escapeHtml(issue)}\n` +
      (username ? `\n🔗 From: @${escapeHtml(username)} (chat ${chatId})` : `\n🔗 Chat: ${chatId}`);

    await tg(token, "sendMessage", {
      chat_id: ADMIN_CHAT_ID,
      text: adminText,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "💬 Chat with Admin", url: ADMIN_CHAT_LINK }]],
      },
    });

    await tg(token, "sendMessage", {
      chat_id: chatId,
      text: "✅ Thank you! Your request has been forwarded to our admin. We'll reach out to you shortly.\n\nSend /start anytime to submit another query.",
    });
    return new Response(JSON.stringify({ ok: true }));
  }

  // Completed — instruct to /start again
  await tg(token, "sendMessage", {
    chat_id: chatId,
    text: "Your previous inquiry was submitted. Send /start to begin a new support request.",
  });
  return new Response(JSON.stringify({ ok: true }));
});

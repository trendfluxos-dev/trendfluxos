const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const BOT_USERNAME = "LuxeVeil_Bot";
const GROUP_INVITE = "https://t.me/+GAMSK09w_6Q3MGQ1";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tgHeaders(lovableKey: string, tgKey: string) {
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": tgKey,
    "Content-Type": "application/json",
  };
}

async function callTg(
  method: string,
  body: unknown,
  lovableKey: string,
  tgKey: string,
) {
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: tgHeaders(lovableKey, tgKey),
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
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
      `3. Send any message in the group, then run the bot-access check again — it will auto-detect the correct chat ID.`,
      `4. Update the TELEGRAM_CHAT_ID secret with the detected ID (a negative number like -1001234567890).`,
    ],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY not configured");

    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";

    // ---- Bot-access diagnostic check ----
    if (action === "check" || req.method === "GET") {
      const result: Record<string, unknown> = {
        bot_username: BOT_USERNAME,
        group_invite: GROUP_INVITE,
        configured_chat_id: TELEGRAM_CHAT_ID || null,
      };

      // 1. Confirm the bot identity
      const me = await callTg("getMe", {}, LOVABLE_API_KEY, TELEGRAM_API_KEY);
      result.bot = me.data?.result ?? me.data;
      if (!me.res.ok || !me.data?.ok) {
        return new Response(
          JSON.stringify({ ok: false, step: "getMe", ...result, error: me.data }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // 2. Try getChat with the configured ID
      let chatOk = false;
      if (TELEGRAM_CHAT_ID) {
        const chat = await callTg(
          "getChat",
          { chat_id: TELEGRAM_CHAT_ID },
          LOVABLE_API_KEY,
          TELEGRAM_API_KEY,
        );
        result.chat = chat.data?.result ?? chat.data;
        chatOk = chat.res.ok && chat.data?.ok;
      }

      // 3. If chat lookup failed, scan recent updates for groups the bot can see
      if (!chatOk) {
        const upd = await callTg(
          "getUpdates",
          { limit: 50, allowed_updates: ["message", "my_chat_member", "channel_post"] },
          LOVABLE_API_KEY,
          TELEGRAM_API_KEY,
        );
        const seen = new Map<string, { id: number; title?: string; type?: string }>();
        for (const u of (upd.data?.result ?? []) as Array<Record<string, any>>) {
          const c =
            u.message?.chat ??
            u.edited_message?.chat ??
            u.my_chat_member?.chat ??
            u.channel_post?.chat;
          if (c?.id && (c.type === "group" || c.type === "supergroup" || c.type === "channel")) {
            seen.set(String(c.id), { id: c.id, title: c.title, type: c.type });
          }
        }
        result.detected_groups = Array.from(seen.values());
        return new Response(
          JSON.stringify({
            ok: false,
            ...chatNotFoundGuidance(TELEGRAM_CHAT_ID || "(not set)"),
            ...result,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ ok: true, ready: true, ...result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- Normal submission flow ----
    if (!TELEGRAM_CHAT_ID) throw new Error("TELEGRAM_CHAT_ID not configured");

    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 120);
    const whatsapp = String(body.whatsapp ?? "").trim().slice(0, 40);
    const message = String(body.message ?? "").trim().slice(0, 1000);

    if (name.length < 2 || whatsapp.length < 6) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid name or WhatsApp number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const text =
      `🌸 <b>New Luxe Veil Inquiry</b>\n` +
      `👤 <b>Name:</b> ${escapeHtml(name)}\n` +
      `📱 <b>WhatsApp:</b> ${escapeHtml(whatsapp)}` +
      (message ? `\n💬 <b>Message:</b> ${escapeHtml(message)}` : "");

    const { res: tgRes, data } = await callTg(
      "sendMessage",
      {
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
      LOVABLE_API_KEY,
      TELEGRAM_API_KEY,
    );

    if (!tgRes.ok || !data.ok) {
      const desc: string = data?.description ?? "";
      const isChatNotFound =
        tgRes.status === 400 && /chat not found/i.test(desc);
      console.error("Telegram error", tgRes.status, data);

      if (isChatNotFound) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "chat_not_found",
            telegram_description: desc,
            guidance: chatNotFoundGuidance(TELEGRAM_CHAT_ID),
            hint:
              "Call this function with ?action=check to auto-detect the correct chat ID after adding the bot to the group.",
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          ok: false,
          error: desc || "Telegram failed",
          status: tgRes.status,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message_id: data.result?.message_id }),
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

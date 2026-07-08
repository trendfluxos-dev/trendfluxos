// Fallback reminder tick — runs every 5 min via pg_cron.
//
// For every confirmed strategy booking, sends TWO pings to the project lead
// (Telegram + WhatsApp when configured) as a fallback in case Google Calendar
// reminders don't reach the phone:
//   • morning-of  — first tick on the booking's local date after the morning hour
//   • 15-min-before — first tick where slot is within (now, now + 20min]
//
// Dedup guard: sends are gated on an atomic
//   UPDATE ... SET reminder_X_sent_at = now()
//   WHERE id = $1 AND reminder_X_sent_at IS NULL
//   RETURNING id
// so a duplicate tick can never re-send. If the outbound send fails, we
// roll the timestamp back to NULL and the next tick retries.

import { createClient } from "npm:@supabase/supabase-js@2";

const TZ = Deno.env.get("BOOKING_REMINDER_TZ") ?? "Asia/Dhaka";
const MORNING_HOUR = Number(Deno.env.get("BOOKING_REMINDER_MORNING_HOUR") ?? "9"); // 24h, local

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? ""; // e.g. whatsapp:+14155238886
const WHATSAPP_TO = Deno.env.get("PROJECT_LEAD_WHATSAPP_TO") ?? "";

type Kind = "morning" | "fifteen";
type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  session_type: string;
  goal: string | null;
  confirmed_slot_iso: string;
  meet_url: string | null;
  reminder_morning_sent_at: string | null;
  reminder_15min_sent_at: string | null;
};

function localParts(iso: string, tz: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => fmt.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    display: new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d),
  };
}

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false, skipped: "telegram_not_configured" };
  }
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function sendWhatsApp(text: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !WHATSAPP_TO) {
    return { ok: false, skipped: "whatsapp_not_configured" };
  }
  try {
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const body = new URLSearchParams({
      From: TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
        ? TWILIO_WHATSAPP_FROM
        : `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      To: WHATSAPP_TO.startsWith("whatsapp:") ? WHATSAPP_TO : `whatsapp:${WHATSAPP_TO}`,
      Body: text,
    });
    const r = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function formatMessage(kind: Kind, b: Booking) {
  const parts = localParts(b.confirmed_slot_iso, TZ);
  const header =
    kind === "morning"
      ? "☀️ <b>Today's strategy call</b>"
      : "⏰ <b>Starting in ~15 min</b>";
  const lines = [
    header,
    "",
    `<b>${b.name}</b>${b.phone ? ` · ${b.phone}` : ""}`,
    `${b.email}`,
    "",
    `🗓️ ${parts.display} (${TZ})`,
    `📌 ${b.session_type}`,
  ];
  if (b.goal) lines.push(`🎯 ${b.goal.slice(0, 240)}`);
  if (b.meet_url) lines.push(`🎥 ${b.meet_url}`);
  return lines.join("\n");
}

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, "");
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date();
  const in20 = new Date(now.getTime() + 20 * 60_000).toISOString();
  const backfillCutoff = new Date(now.getTime() - 24 * 60 * 60_000).toISOString();
  const forwardCutoff = new Date(now.getTime() + 36 * 60 * 60_000).toISOString();

  // Pull the small window of candidate bookings.
  const { data: rows, error } = await supabase
    .from("strategy_bookings")
    .select(
      "id,name,email,phone,session_type,goal,confirmed_slot_iso,meet_url,reminder_morning_sent_at,reminder_15min_sent_at",
    )
    .eq("status", "confirmed")
    .gte("confirmed_slot_iso", backfillCutoff)
    .lte("confirmed_slot_iso", forwardCutoff);

  if (error) {
    console.error("booking-reminder-tick query failed", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }

  const bookings = (rows ?? []) as Booking[];
  const todayLocal = localParts(now.toISOString(), TZ).date;
  const nowLocalHour = localParts(now.toISOString(), TZ).hour;

  const dispatched: Array<{ id: string; kind: Kind; telegram: unknown; whatsapp: unknown }> = [];

  for (const b of bookings) {
    const slot = new Date(b.confirmed_slot_iso);
    const slotLocal = localParts(b.confirmed_slot_iso, TZ);
    const msToSlot = slot.getTime() - now.getTime();

    // --- 15-min-before window: slot is within (now, now + 20min] ---
    if (
      !b.reminder_15min_sent_at &&
      slot.toISOString() > now.toISOString() &&
      slot.toISOString() <= in20
    ) {
      // Atomic claim
      const { data: claimed } = await supabase
        .from("strategy_bookings")
        .update({ reminder_15min_sent_at: now.toISOString() })
        .eq("id", b.id)
        .is("reminder_15min_sent_at", null)
        .select("id")
        .maybeSingle();
      if (claimed) {
        const html = formatMessage("fifteen", b);
        const [tg, wa] = await Promise.all([sendTelegram(html), sendWhatsApp(plainText(html))]);
        // Roll back only if BOTH channels failed AND at least one was configured.
        const bothFailed =
          !("skipped" in tg && !("ok" in wa)) &&
          !(tg as { ok?: boolean }).ok &&
          !(wa as { ok?: boolean }).ok;
        const allSkipped = "skipped" in tg && "skipped" in wa;
        if (bothFailed || allSkipped) {
          await supabase
            .from("strategy_bookings")
            .update({ reminder_15min_sent_at: null })
            .eq("id", b.id);
        }
        dispatched.push({ id: b.id, kind: "fifteen", telegram: tg, whatsapp: wa });
      }
    }

    // --- Morning-of: local date == today AND local hour >= MORNING_HOUR AND slot is later today ---
    if (
      !b.reminder_morning_sent_at &&
      slotLocal.date === todayLocal &&
      nowLocalHour >= MORNING_HOUR &&
      msToSlot > 15 * 60_000 // don't send morning ping when we're already about to send 15-min
    ) {
      const { data: claimed } = await supabase
        .from("strategy_bookings")
        .update({ reminder_morning_sent_at: now.toISOString() })
        .eq("id", b.id)
        .is("reminder_morning_sent_at", null)
        .select("id")
        .maybeSingle();
      if (claimed) {
        const html = formatMessage("morning", b);
        const [tg, wa] = await Promise.all([sendTelegram(html), sendWhatsApp(plainText(html))]);
        const bothFailed =
          !(tg as { ok?: boolean }).ok && !(wa as { ok?: boolean }).ok;
        const allSkipped = "skipped" in tg && "skipped" in wa;
        if (bothFailed || allSkipped) {
          await supabase
            .from("strategy_bookings")
            .update({ reminder_morning_sent_at: null })
            .eq("id", b.id);
        }
        dispatched.push({ id: b.id, kind: "morning", telegram: tg, whatsapp: wa });
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, scanned: bookings.length, dispatched }),
    { headers: { "Content-Type": "application/json" } },
  );
});
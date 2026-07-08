import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

const BodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  goal: z.string().trim().max(1000).optional().or(z.literal("")),
  session_type: z.enum(["video", "audio"]),
  requested_slot_iso: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(120).default(30),
});

function siteOrigin(req: Request) {
  return (
    Deno.env.get("PUBLIC_SITE_URL") ||
    req.headers.get("origin") ||
    "https://trendflux.digital"
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_body", details: parsed.error.flatten() }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const body = parsed.data;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GCAL_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!LOVABLE_API_KEY || !GCAL_KEY) {
    return new Response(JSON.stringify({ error: "calendar_not_configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const start = new Date(body.requested_slot_iso);
  const end = new Date(start.getTime() + body.duration_minutes * 60_000);

  // Insert pending row first — we always want the lead captured.
  const { data: booking, error: insertErr } = await supabase
    .from("strategy_bookings")
    .insert({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone || null,
      company: body.company || null,
      goal: body.goal || null,
      session_type: body.session_type,
      requested_slot_iso: start.toISOString(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    })
    .select()
    .single();
  if (insertErr || !booking) {
    console.error("strategy-booking-submit insert failed", insertErr);
    return new Response(JSON.stringify({ error: "storage_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const gheaders = {
    "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GCAL_KEY,
    "Content-Type": "application/json",
  };

  // Look up brand-architect (connector owner) email from the primary calendar id.
  let adminEmail = "";
  try {
    const primaryRes = await fetch(`${GATEWAY}/calendars/primary`, { headers: gheaders });
    if (primaryRes.ok) {
      const primary = await primaryRes.json();
      adminEmail = typeof primary?.id === "string" ? primary.id : "";
    } else {
      console.error("primary calendar lookup failed", primaryRes.status, await primaryRes.text());
    }
  } catch (e) {
    console.error("primary lookup exception", e);
  }

  const origin = siteOrigin(req);
  const confirmUrl = `${SUPABASE_URL}/functions/v1/strategy-booking-action?token=${booking.confirm_token}&decision=confirm`;
  const cancelUrl = `${SUPABASE_URL}/functions/v1/strategy-booking-action?token=${booking.confirm_token}&decision=cancel`;
  const waText = encodeURIComponent(
    `Hi ${body.name}, this is Zahid from TrendFlux. Confirming our ${body.session_type === "video" ? "video" : "audio"} strategy call on ${start.toUTCString()}. Talk soon!`,
  );
  const waHref = body.phone
    ? `https://wa.me/${body.phone.replace(/[^0-9]/g, "")}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  const description = [
    `New Book Direct request via ${origin}`,
    ``,
    `Client: ${body.name} <${body.email}>`,
    body.phone ? `Phone: ${body.phone}` : null,
    body.company ? `Company: ${body.company}` : null,
    body.goal ? `Goal: ${body.goal}` : null,
    `Session type: ${body.session_type}`,
    ``,
    `>>> CONFIRM this slot (sends Meet invite to client):`,
    confirmUrl,
    ``,
    `>>> CANCEL this request:`,
    cancelUrl,
    ``,
    `Reach client on WhatsApp: ${waHref}`,
    ``,
    `Booking id: ${booking.id}`,
  ].filter(Boolean).join("\n");

  // Create GCal event with only the admin attendee for now. Meet link is
  // generated up-front; on confirm we add the client attendee and re-notify.
  const eventPayload: Record<string, unknown> = {
    summary: `[HOLD] Strategy call — ${body.name}${body.company ? ` (${body.company})` : ""}`,
    description,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    attendees: adminEmail ? [{ email: adminEmail, responseStatus: "accepted" }] : [],
    conferenceData: {
      createRequest: {
        requestId: booking.id,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "email", minutes: 15 },
        { method: "popup", minutes: 15 },
      ],
    },
  };

  let gcalEventId: string | null = null;
  let meetUrl: string | null = null;
  try {
    const url = new URL(`${GATEWAY}/calendars/primary/events`);
    url.searchParams.set("conferenceDataVersion", "1");
    url.searchParams.set("sendUpdates", adminEmail ? "all" : "none");
    const evRes = await fetch(url.toString(), {
      method: "POST", headers: gheaders, body: JSON.stringify(eventPayload),
    });
    const evBody = await evRes.text();
    if (!evRes.ok) {
      console.error("gcal event create failed", evRes.status, evBody);
      return new Response(JSON.stringify({ ok: true, booking_id: booking.id, calendar_error: "calendar_create_failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ev = JSON.parse(evBody);
    gcalEventId = ev.id ?? null;
    meetUrl = ev.hangoutLink ?? ev.conferenceData?.entryPoints?.find((e: { entryPointType?: string; uri?: string }) => e.entryPointType === "video")?.uri ?? null;
  } catch (e) {
    console.error("gcal event exception", e);
  }

  await supabase
    .from("strategy_bookings")
    .update({ gcal_event_id: gcalEventId, meet_url: meetUrl })
    .eq("id", booking.id);

  return new Response(
    JSON.stringify({ ok: true, booking_id: booking.id }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
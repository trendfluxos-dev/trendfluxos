import { createClient } from "npm:@supabase/supabase-js@2";

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

function html(status: number, title: string, body: string) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title>
<style>body{font:16px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#111}h1{font-size:22px;margin-bottom:12px}code{background:#f4f4f4;padding:2px 6px;border-radius:4px}</style>
<h1>${title}</h1><p>${body}</p>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const decision = url.searchParams.get("decision") ?? "";
  if (!token || !["confirm", "cancel"].includes(decision)) {
    return html(400, "Invalid link", "This confirmation link is malformed.");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: booking, error } = await supabase
    .from("strategy_bookings")
    .select("*")
    .eq("confirm_token", token)
    .maybeSingle();
  if (error || !booking) return html(404, "Not found", "This booking no longer exists.");
  if (booking.status !== "pending") {
    return html(200, "Already handled", `This booking is already <b>${booking.status}</b>.`);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GCAL_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  const gheaders = {
    "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GCAL_KEY!,
    "Content-Type": "application/json",
  };

  if (decision === "cancel") {
    if (booking.gcal_event_id && LOVABLE_API_KEY && GCAL_KEY) {
      const delUrl = new URL(`${GATEWAY}/calendars/primary/events/${booking.gcal_event_id}`);
      delUrl.searchParams.set("sendUpdates", "all");
      await fetch(delUrl.toString(), { method: "DELETE", headers: gheaders });
    }
    await supabase.from("strategy_bookings").update({ status: "cancelled" }).eq("id", booking.id);
    return html(200, "Cancelled", "The request was cancelled. The client will not receive an invite.");
  }

  // confirm — add client as attendee and notify all.
  if (!booking.gcal_event_id || !LOVABLE_API_KEY || !GCAL_KEY) {
    await supabase.from("strategy_bookings")
      .update({ status: "confirmed", confirmed_slot_iso: booking.requested_slot_iso })
      .eq("id", booking.id);
    return html(200, "Confirmed", "Booking marked confirmed, but the calendar event could not be updated automatically. Please send the Meet link manually.");
  }

  const patchUrl = new URL(`${GATEWAY}/calendars/primary/events/${booking.gcal_event_id}`);
  patchUrl.searchParams.set("sendUpdates", "all");
  patchUrl.searchParams.set("conferenceDataVersion", "1");

  // Merge existing attendees with the client to preserve the admin.
  let existingAttendees: Array<{ email: string; responseStatus?: string }> = [];
  try {
    const getRes = await fetch(`${GATEWAY}/calendars/primary/events/${booking.gcal_event_id}`, { headers: gheaders });
    if (getRes.ok) {
      const ev = await getRes.json();
      if (Array.isArray(ev.attendees)) existingAttendees = ev.attendees;
    }
  } catch (_e) { /* ignore */ }

  const attendees = [
    ...existingAttendees.filter((a) => a.email?.toLowerCase() !== booking.email.toLowerCase()),
    { email: booking.email },
  ];

  const patchBody = {
    summary: `Strategy call — ${booking.name}${booking.company ? ` (${booking.company})` : ""}`,
    attendees,
  };
  const patchRes = await fetch(patchUrl.toString(), {
    method: "PATCH", headers: gheaders, body: JSON.stringify(patchBody),
  });
  if (!patchRes.ok) {
    const txt = await patchRes.text();
    console.error("event patch failed", patchRes.status, txt);
    return html(500, "Calendar update failed", `Google Calendar returned an error: <code>${txt.slice(0, 300).replace(/</g, "&lt;")}</code>`);
  }

  await supabase.from("strategy_bookings")
    .update({ status: "confirmed", confirmed_slot_iso: booking.requested_slot_iso })
    .eq("id", booking.id);

  return html(200, "Confirmed", `Meet invite sent to <b>${booking.email}</b>. Reminders will fire 1 day and 15 minutes before the call.`);
});
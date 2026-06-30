// n8n -> Supabase callback. n8n calls this to update a lead's lifecycle state
// after sending an outreach step, getting a reply, or moving the deal forward.
// Authenticated with a shared secret in the `x-n8n-secret` header.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_STATUS = new Set([
  "new","prospected","contacted","replied","qualified","proposal_sent","won","lost","nurture",
]);
const ALLOWED_CHANNELS = new Set(["email","linkedin","whatsapp","sms","call","other"]);

type Body = {
  lead_id?: string;
  email?: string;
  lifecycle_status?: string;
  sequence_name?: string;
  sequence_step?: number;
  outreach_channel?: string;
  prospect_score?: number;
  next_followup_at?: string | null;
  stage?: string;          // CRM pipeline stage on growth_leads.stage
  owner_notes?: string;
  n8n_run_id?: string;
  note?: string;           // free-text event note appended to history
  event?: string;          // e.g. "sent","opened","replied","bounced"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const expected = Deno.env.get("N8N_CALLBACK_SECRET");
  const got = req.headers.get("x-n8n-secret");
  if (!expected || !got || got !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.lead_id && !body.email) {
    return new Response(JSON.stringify({ error: "lead_id_or_email_required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (body.lifecycle_status && !ALLOWED_STATUS.has(body.lifecycle_status)) {
    return new Response(JSON.stringify({ error: "invalid_lifecycle_status" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (body.outreach_channel && !ALLOWED_CHANNELS.has(body.outreach_channel)) {
    return new Response(JSON.stringify({ error: "invalid_channel" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve lead
  let leadQuery = supabase.from("growth_leads").select("*").limit(1);
  leadQuery = body.lead_id
    ? leadQuery.eq("id", body.lead_id)
    : leadQuery.eq("email", body.email!.toLowerCase());
  const { data: leadRow, error: findErr } = await leadQuery.maybeSingle();
  if (findErr || !leadRow) {
    return new Response(JSON.stringify({ error: "lead_not_found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date().toISOString();
  const historyEntry = {
    at: now,
    event: body.event ?? "update",
    lifecycle_status: body.lifecycle_status ?? leadRow.lifecycle_status,
    sequence_name: body.sequence_name ?? leadRow.sequence_name,
    sequence_step: body.sequence_step ?? leadRow.sequence_step,
    channel: body.outreach_channel ?? leadRow.outreach_channel,
    note: body.note ?? null,
    n8n_run_id: body.n8n_run_id ?? null,
  };
  const history = Array.isArray(leadRow.lifecycle_history) ? leadRow.lifecycle_history : [];
  history.push(historyEntry);
  if (history.length > 200) history.splice(0, history.length - 200);

  const update: Record<string, unknown> = { lifecycle_history: history };
  if (body.lifecycle_status) update.lifecycle_status = body.lifecycle_status;
  if (typeof body.sequence_step === "number") update.sequence_step = body.sequence_step;
  if (body.sequence_name !== undefined) update.sequence_name = body.sequence_name;
  if (body.outreach_channel !== undefined) update.outreach_channel = body.outreach_channel;
  if (typeof body.prospect_score === "number") update.prospect_score = body.prospect_score;
  if (body.next_followup_at !== undefined) update.next_followup_at = body.next_followup_at;
  if (body.stage) update.stage = body.stage;
  if (body.owner_notes !== undefined) update.owner_notes = body.owner_notes;
  if (body.n8n_run_id) update.n8n_run_id = body.n8n_run_id;
  if (body.event === "sent" || body.event === "contacted") update.last_contacted_at = now;

  const { data: updated, error: updErr } = await supabase
    .from("growth_leads")
    .update(update)
    .eq("id", leadRow.id)
    .select()
    .single();

  if (updErr) {
    return new Response(JSON.stringify({ error: "update_failed", detail: updErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, lead: updated }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
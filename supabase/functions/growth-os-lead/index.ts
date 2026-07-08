import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type LeadBody = {
  name?: string;
  email?: string;
  company?: string;
  website?: string;
  monthly_revenue?: string;
  current_ad_spend?: string;
  services?: string[];
  message?: string;
  source?: string;
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const name = (body.name ?? "").toString().trim().slice(0, 200);
  const email = (body.email ?? "").toString().trim().toLowerCase().slice(0, 200);
  if (!name || !email || !isEmail(email)) {
    return new Response(JSON.stringify({ error: "name_and_valid_email_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const services = Array.isArray(body.services)
    ? body.services.filter((s) => typeof s === "string").slice(0, 20)
    : [];

  const insertPayload = {
    name,
    email,
    company: body.company?.toString().slice(0, 200) ?? null,
    website: body.website?.toString().slice(0, 300) ?? null,
    monthly_revenue: body.monthly_revenue?.toString().slice(0, 60) ?? null,
    current_ad_spend: body.current_ad_spend?.toString().slice(0, 60) ?? null,
    services,
    message: body.message?.toString().slice(0, 4000) ?? null,
    source: body.source?.toString().slice(0, 60) ?? "growth-os-landing",
    ip,
    user_agent: ua,
  };

  const { data: lead, error } = await supabase
    .from("growth_leads")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("growth-os-lead insert failed", error);
    return new Response(JSON.stringify({ error: "storage_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Optionally forward to n8n. Non-fatal if it fails — we already have the lead.
  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
  const n8nAuth = Deno.env.get("N8N_WEBHOOK_AUTH"); // e.g. "Bearer xxx" or "Basic xxx"
  let n8n_forwarded = false;
  let n8n_response: unknown = null;

  if (n8nUrl) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nAuth ? { Authorization: n8nAuth } : {}),
        },
        body: JSON.stringify({ event: "growth_os.lead.created", lead }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      n8n_forwarded = res.ok;
      const text = await res.text();
      try { n8n_response = JSON.parse(text); } catch { n8n_response = { status: res.status, body: text.slice(0, 500) }; }
    } catch (err) {
      n8n_response = { error: (err as Error).message };
    }
    await supabase
      .from("growth_leads")
      .update({ n8n_forwarded, n8n_response })
      .eq("id", lead.id);
  }

  return new Response(
    JSON.stringify({ ok: true, id: lead.id, n8n_forwarded }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
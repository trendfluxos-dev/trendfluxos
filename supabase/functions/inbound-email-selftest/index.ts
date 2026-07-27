// TEMPORARY verification harness for the inbound-email webhook.
// Deployed only to run the production readiness checks, then deleted.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const URL_ = `${Deno.env.get("SUPABASE_URL")}/functions/v1/inbound-email`;

async function call(headers: Record<string, string>, body: unknown) {
  const res = await fetch(URL_, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const secret = Deno.env.get("INBOUND_EMAIL_WEBHOOK_SECRET") ?? "";
  const auth = { "x-webhook-secret": secret };
  const mid = `selftest-${crypto.randomUUID()}`;

  const payload = {
    provider: "hostinger",
    message_id: mid,
    from: 'Test Sender <sender@example.com>',
    to: "hello@trendflux.digital",
    cc: ["cc1@example.com", "CC2@example.com"],
    reply_to: "reply@example.com",
    subject: "Selftest inbound email",
    text: "plain text body",
    html: "<p>html body</p>",
    spam_score: 1.2,
    attachments: [{ filename: "a.pdf", contentType: "application/pdf", size: 1234, url: "https://x/a.pdf" }],
    date: new Date().toISOString(),
  };

  const results = {
    secret_configured: secret.length > 0,
    unauthorized_no_header: await call({}, payload),
    unauthorized_wrong_secret: await call({ "x-webhook-secret": "wrong-value" }, payload),
    authorized_bearer: await call({ authorization: `Bearer ${secret}` }, { ...payload, message_id: `${mid}-bearer` }),
    authorized_insert: await call(auth, payload),
    duplicate: await call(auth, payload),
    spam: await call(auth, { ...payload, message_id: `${mid}-spam`, spam_score: 9.5 }),
    missing_from: await call(auth, { subject: "no from" }),
    test_message_ids: [mid, `${mid}-bearer`, `${mid}-spam`],
  };

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});

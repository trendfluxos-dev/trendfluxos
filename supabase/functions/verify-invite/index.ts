const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Fallback codes used only when LUXE_VEIL_INVITE_CODES secret is not set.
// Operators should set the secret and rotate these.
const FALLBACK_CODES = ["LUXE2026", "VEIL-INVITE", "TRENDFLUX-PRIVATE"];

function getValidCodes(): string[] {
  const raw = Deno.env.get("LUXE_VEIL_INVITE_CODES") ?? "";
  const parsed = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : FALLBACK_CODES;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let code = "";
  try {
    const body = await req.json();
    code = String(body?.code ?? "").trim().toUpperCase();
  } catch {
    // ignore
  }

  if (!code || code.length > 64) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid code" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const valid = getValidCodes();
  if (!valid.includes(code)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid invitation code" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Issue a signed, short-lived token. Client stores it instead of a static flag.
  const signingSecret =
    Deno.env.get("LUXE_VEIL_TOKEN_SECRET") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    "fallback-secret-change-me";
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `luxe-veil:${expiresAt}`;
  const signature = await sign(payload, signingSecret);
  const token = `${btoa(payload).replace(/=+$/g, "")}.${signature}`;

  return new Response(
    JSON.stringify({ ok: true, token, expires_at: expiresAt }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

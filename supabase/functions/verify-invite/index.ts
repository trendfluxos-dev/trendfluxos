const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getValidCodes(): string[] {
  const raw = Deno.env.get("LUXE_VEIL_INVITE_CODES") ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
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
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const signingSecret =
    Deno.env.get("LUXE_VEIL_TOKEN_SECRET") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!signingSecret || signingSecret.length < 32) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invitation service is not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Token verification endpoint
  if (req.method === "POST" && action === "verify-token") {
    let token = "";
    try {
      const body = await req.json();
      token = String(body?.token ?? "");
    } catch { /* ignore */ }
    const result = await verifyToken(token, signingSecret);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
  if (valid.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invitation service is not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (!valid.includes(code)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid invitation code" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Issue a signed, short-lived token. Client stores it instead of a static flag.
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `luxe-veil:${expiresAt}`;
  const signature = await sign(payload, signingSecret);
  const token = `${btoa(payload).replace(/=+$/g, "")}.${signature}`;

  return new Response(
    JSON.stringify({ ok: true, token, expires_at: expiresAt }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

async function verifyToken(
  token: string,
  secret: string,
): Promise<{ ok: boolean; expires_at?: number; error?: string }> {
  if (!token || typeof token !== "string" || token.length > 512) {
    return { ok: false, error: "Invalid token" };
  }
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "Malformed token" };
  const [b64, sig] = parts;
  let payload = "";
  try {
    payload = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return { ok: false, error: "Malformed token" };
  }
  const m = payload.match(/^luxe-veil:(\d+)$/);
  if (!m) return { ok: false, error: "Malformed token" };
  const expiresAt = Number(m[1]);
  const expected = await sign(payload, secret);
  // Constant-time-ish compare
  if (expected.length !== sig.length) return { ok: false, error: "Bad signature" };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return { ok: false, error: "Bad signature" };
  if (expiresAt <= Date.now()) return { ok: false, error: "Token expired" };
  return { ok: true, expires_at: expiresAt };
}

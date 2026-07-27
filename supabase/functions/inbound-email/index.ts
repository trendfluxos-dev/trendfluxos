// Inbound email webhook.
// Receives parsed inbound mail from Hostinger Agentic Mail (or any provider that
// can POST JSON) and persists it to public.inbound_emails for downstream processing.
//
// Auth: shared secret. Accepted in any of:
//   - header  x-webhook-secret: <secret>
//   - header  authorization: Bearer <secret>
//   - query   ?secret=<secret>       (for providers that cannot set headers)
//
// Secret env var: INBOUND_EMAIL_WEBHOOK_SECRET
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Constant-time-ish comparison to avoid trivial timing oracles.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type AnyRecord = Record<string, unknown>;

const str = (v: unknown): string | null => {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t.slice(0, 20000) : null;
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
};

const pick = (obj: AnyRecord, keys: string[]): unknown => {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

// Providers send addresses as "a@b.com", "Name <a@b.com>", { address, name },
// or [{ address, name }]. Normalise all of them.
function parseAddress(value: unknown): { email: string | null; name: string | null } {
  if (!value) return { email: null, name: null };
  if (Array.isArray(value)) return parseAddress(value[0]);
  if (typeof value === "object") {
    const o = value as AnyRecord;
    if (Array.isArray(o.value)) return parseAddress(o.value[0]);
    return {
      email: str(pick(o, ["address", "email", "value"])),
      name: str(pick(o, ["name", "displayName"])),
    };
  }
  const raw = str(value);
  if (!raw) return { email: null, name: null };
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].replace(/^"|"$/g, "") || null, email: m[2].toLowerCase() };
  return { email: raw.toLowerCase(), name: null };
}

function parseAddressList(value: unknown): string[] | null {
  if (!value) return null;
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [value];
  const out = items
    .map((i) => parseAddress(i).email)
    .filter((e): e is string => Boolean(e));
  return out.length ? out : null;
}

function normalizeAttachments(value: unknown): AnyRecord[] {
  if (!Array.isArray(value)) return [];
  // Store metadata only — never inline attachment bytes into the row.
  return value.slice(0, 50).map((a) => {
    const o = (a ?? {}) as AnyRecord;
    return {
      filename: str(pick(o, ["filename", "name", "fileName"])),
      content_type: str(pick(o, ["contentType", "content_type", "mimeType", "mime"])),
      size: typeof o.size === "number" ? o.size : null,
      url: str(pick(o, ["url", "downloadUrl", "link"])),
    };
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const expected = Deno.env.get("INBOUND_EMAIL_WEBHOOK_SECRET");
  if (!expected) {
    console.error("INBOUND_EMAIL_WEBHOOK_SECRET is not configured");
    return json({ error: "server_not_configured" }, 500);
  }

  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization") ?? "";
  const provided =
    req.headers.get("x-webhook-secret") ??
    (authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null) ??
    url.searchParams.get("secret");

  if (!provided || !safeEqual(provided, expected)) {
    return json({ error: "unauthorized" }, 401);
  }

  // Accept JSON as well as form-encoded posts (some mail relays use the latter).
  let payload: AnyRecord;
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      payload = (await req.json()) as AnyRecord;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      payload = Object.fromEntries(await req.formData()) as AnyRecord;
    } else {
      payload = JSON.parse(await req.text()) as AnyRecord;
    }
  } catch {
    return json({ error: "invalid_payload" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return json({ error: "invalid_payload" }, 400);
  }

  // Some providers nest the message under `message`, `email`, or `data`.
  const nested = pick(payload, ["message", "email", "data", "mail"]);
  const msg: AnyRecord =
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? { ...(nested as AnyRecord), ...payload }
      : payload;

  const from = parseAddress(pick(msg, ["from", "sender", "from_email", "fromAddress"]));
  if (!from.email) return json({ error: "missing_from_address" }, 400);

  const to = parseAddress(pick(msg, ["to", "recipient", "to_email", "toAddress"]));
  const spamRaw = pick(msg, ["spam_score", "spamScore", "spamscore"]);
  const spamScore = typeof spamRaw === "number" ? spamRaw : Number(str(spamRaw) ?? NaN);

  const row = {
    provider: str(pick(msg, ["provider"])) ?? "hostinger",
    provider_message_id:
      str(pick(msg, ["message_id", "messageId", "id", "uid", "messageID"])) ?? null,
    from_name: from.name ?? str(pick(msg, ["from_name", "fromName"])),
    from_email: from.email,
    to_email: to.email,
    cc_emails: parseAddressList(pick(msg, ["cc", "cc_emails"])),
    reply_to: parseAddress(pick(msg, ["reply_to", "replyTo"])).email,
    subject: str(pick(msg, ["subject", "title"])),
    text_body: str(pick(msg, ["text", "text_body", "plain", "textBody", "body"])),
    html_body: str(pick(msg, ["html", "html_body", "htmlBody"])),
    attachments: normalizeAttachments(pick(msg, ["attachments", "files"])),
    headers:
      pick(msg, ["headers"]) && typeof msg.headers === "object" ? msg.headers : {},
    raw_payload: payload,
    spam_score: Number.isFinite(spamScore) ? spamScore : null,
    status: Number.isFinite(spamScore) && spamScore >= 5 ? "spam" : "received",
    received_at:
      str(pick(msg, ["date", "received_at", "timestamp"])) ?? new Date().toISOString(),
  };

  // Guard against unparseable dates from providers.
  if (Number.isNaN(Date.parse(row.received_at))) {
    row.received_at = new Date().toISOString();
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("inbound_emails")
    .insert(row)
    .select("id")
    .maybeSingle();

  if (error) {
    // 23505 = duplicate provider_message_id. Treat as success so the provider
    // stops retrying an email we already have.
    if (error.code === "23505") {
      console.log("Duplicate inbound email ignored", {
        provider_message_id: row.provider_message_id,
      });
      return json({ ok: true, duplicate: true }, 200);
    }
    console.error("Failed to store inbound email", error);
    return json({ error: "storage_failed", details: error.message }, 500);
  }

  console.log("Inbound email stored", {
    id: data?.id,
    from: row.from_email,
    subject: row.subject,
    status: row.status,
  });

  return json({ ok: true, id: data?.id ?? null, status: row.status }, 200);
});

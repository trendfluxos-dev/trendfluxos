import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { userHasRole } from "../_shared/adminCheck.ts";

/**
 * xtts-proxy
 * Founder-only proxy to a self-hosted XTTS-v2 FastAPI server.
 * Single-Voice Studio Mode: latest upload becomes the active voice.
 *
 * VPS endpoints (set via XTTS_ENDPOINT_URL):
 *   POST /upload-voice  multipart/form-data { file }   → { voice_path } (overwrites latest)
 *   POST /generate      multipart/form-data { text, voice_path? }
 *
 * Client actions (?action=...):
 *   upload    multipart { file }   → forwards to VPS, returns { voice_path }
 *   generate  JSON { text }        → audio/wav (VPS uses latest uploaded sample)
 */

const j = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function vpsHeaders(): Record<string, string> {
  const token = Deno.env.get("XTTS_API_TOKEN");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return j({ error: "unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return j({ error: "unauthorized" }, 401);
    const isAdmin = await userHasRole(userClient, userData.user.id, "admin");
    if (!isAdmin) return j({ error: "forbidden_founder_only" }, 403);

    const endpoint = Deno.env.get("XTTS_ENDPOINT_URL");
    if (!endpoint) {
      return j(
        {
          error: "xtts_endpoint_not_configured",
          hint: "Add XTTS_ENDPOINT_URL secret (e.g. https://your-vps.example.com) and optional XTTS_API_TOKEN.",
        },
        503,
      );
    }
    const base = endpoint.replace(/\/+$/, "");

    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";

    if (action === "upload") {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return j({ error: "file_required" }, 400);

      const upstream = new FormData();
      upstream.append("file", file, file.name || "voice.wav");

      const res = await fetch(`${base}/upload-voice`, {
        method: "POST",
        headers: vpsHeaders(),
        body: upstream,
      });
      const text = await res.text();
      if (!res.ok) return j({ error: "xtts_upload_failed", status: res.status, body: text.slice(0, 500) }, 502);
      let parsed: unknown = text;
      try { parsed = JSON.parse(text); } catch { /* leave string */ }
      return j({ ok: true, vps: parsed });
    }

    if (action === "generate") {
      const body = await req.json().catch(() => ({} as Record<string, unknown>));
      const text = String((body as { text?: unknown }).text ?? "").trim();
      if (!text) return j({ error: "text_required" }, 400);
      if (text.length > 5000) return j({ error: "text_too_long_max_5000" }, 400);

      // Single-Voice Studio Mode: VPS always uses the latest uploaded sample.
      const upstream = new FormData();
      upstream.append("text", text);
      const res = await fetch(`${base}/generate`, {
        method: "POST",
        headers: vpsHeaders(),
        body: upstream,
      });
      if (!res.ok) {
        const err = await res.text();
        return j({ error: "xtts_generate_failed", status: res.status, body: err.slice(0, 500) }, 502);
      }
      // VPS may return either raw audio bytes OR JSON { audio: "filename.wav" }.
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const payload = await res.json();
        // Caller can construct a download URL on the VPS if it returns a filename.
        return j({ ok: true, ...payload });
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      return new Response(bytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType || "audio/wav",
          "Content-Disposition": 'attachment; filename="voice.wav"',
        },
      });
    }

    return j({ error: "unknown_action", hint: "use ?action=upload or ?action=generate" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return j({ error: "internal_error", message: msg }, 500);
  }
});
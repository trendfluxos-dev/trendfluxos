import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * xtts-proxy
 * Founder-only proxy to a self-hosted XTTS-v2 FastAPI server,
 * backed by the public.voice_assets library (Phase 2A).
 *
 * VPS endpoints (set via XTTS_ENDPOINT_URL):
 *   POST /upload-voice  multipart/form-data { file }  → { voice_path }
 *   POST /generate      multipart/form-data { text, voice_path? }
 *
 * Client actions (?action=...):
 *   upload       multipart { file, name? }           → creates voice_assets row
 *   list         GET                                 → { voices: [...] }
 *   delete       JSON { id }
 *   set_default  JSON { id }
 *   generate     JSON { text, voice_id? }            → audio/wav (or JSON)
 *
 * If voice_id is omitted on generate, the user's default voice is used.
 * If no default exists, the most recent voice is used. If the library is
 * empty, the VPS falls back to the latest file in voices/.
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

    const { data: isAdmin } = await userClient.rpc("current_user_has_role", {
      _role: "admin",
    });
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
      const nameField = String(form.get("name") ?? "").trim();
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
      const voicePath =
        (parsed && typeof parsed === "object" && "voice_path" in parsed)
          ? String((parsed as { voice_path: unknown }).voice_path ?? "")
          : "";
      if (!voicePath) return j({ error: "vps_missing_voice_path", vps: parsed }, 502);

      // Register the voice in the library. First voice becomes default.
      const { count } = await userClient
        .from("voice_assets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userData.user.id);
      const isFirst = (count ?? 0) === 0;

      const fallbackName =
        nameField ||
        (file.name || "Voice").replace(/\.[^.]+$/, "") ||
        `Voice ${new Date().toISOString().slice(0, 10)}`;

      const { data: inserted, error: insErr } = await userClient
        .from("voice_assets")
        .insert({
          user_id: userData.user.id,
          name: fallbackName,
          vps_path: voicePath,
          is_default: isFirst,
          sample_size_bytes: file.size,
        })
        .select("id, name, vps_path, is_default, created_at")
        .single();
      if (insErr) return j({ error: "library_insert_failed", message: insErr.message }, 500);

      return j({ ok: true, voice: inserted });
    }

    if (action === "list" || req.method === "GET") {
      const { data, error } = await userClient
        .from("voice_assets")
        .select("id, name, vps_path, is_default, sample_size_bytes, created_at")
        .order("created_at", { ascending: false });
      if (error) return j({ error: "library_list_failed", message: error.message }, 500);
      return j({ voices: data ?? [] });
    }

    if (action === "delete") {
      const body = await req.json().catch(() => ({} as Record<string, unknown>));
      const id = String((body as { id?: unknown }).id ?? "");
      if (!id) return j({ error: "id_required" }, 400);
      const { error } = await userClient.from("voice_assets").delete().eq("id", id);
      if (error) return j({ error: "library_delete_failed", message: error.message }, 500);
      return j({ ok: true });
    }

    if (action === "set_default") {
      const body = await req.json().catch(() => ({} as Record<string, unknown>));
      const id = String((body as { id?: unknown }).id ?? "");
      if (!id) return j({ error: "id_required" }, 400);
      // Clear current default first to respect the unique partial index.
      const { error: clearErr } = await userClient
        .from("voice_assets")
        .update({ is_default: false })
        .eq("user_id", userData.user.id)
        .eq("is_default", true);
      if (clearErr) return j({ error: "library_clear_default_failed", message: clearErr.message }, 500);
      const { error: setErr } = await userClient
        .from("voice_assets")
        .update({ is_default: true })
        .eq("id", id);
      if (setErr) return j({ error: "library_set_default_failed", message: setErr.message }, 500);
      return j({ ok: true });
    }

    if (action === "generate") {
      const body = await req.json().catch(() => ({} as Record<string, unknown>));
      const text = String((body as { text?: unknown }).text ?? "").trim();
      const voiceId = String((body as { voice_id?: unknown }).voice_id ?? "").trim();
      if (!text) return j({ error: "text_required" }, 400);
      if (text.length > 5000) return j({ error: "text_too_long_max_5000" }, 400);

      // Resolve vps_path: explicit voice_id → default → most recent → none (VPS fallback).
      let voicePath = "";
      if (voiceId) {
        const { data: row, error } = await userClient
          .from("voice_assets")
          .select("vps_path")
          .eq("id", voiceId)
          .maybeSingle();
        if (error) return j({ error: "voice_lookup_failed", message: error.message }, 500);
        if (!row) return j({ error: "voice_not_found" }, 404);
        voicePath = row.vps_path;
      } else {
        const { data: rows } = await userClient
          .from("voice_assets")
          .select("vps_path, is_default, created_at")
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1);
        if (rows && rows.length > 0) voicePath = rows[0].vps_path;
      }

      const upstream = new FormData();
      upstream.append("text", text);
      if (voicePath) upstream.append("voice_path", voicePath);
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
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { userHasRole } from "../_shared/adminCheck.ts";

/**
 * voice-generate
 * Smart-router TTS endpoint for TrendFlux EdTech.
 *
 * Flow:
 *   1. Auth + admin (founder) gate.
 *   2. Hash(text + voice + engine) → check `voice_cache` table.
 *      Cache hit: bump hit_count + return signed URL (0 cost).
 *   3. Cache miss → route engine (PIPER/COQUI stubs throw `engine_not_configured`,
 *      ELEVENLABS calls real API).
 *   4. Upload audio to `voice-lectures/<uid>/cache/<hash>.mp3`.
 *   5. Insert cache row, return signed URL.
 *
 * Body: { text: string, voice?: string, engine?: "AUTO"|"ELEVENLABS"|"PIPER_TTS"|"COQUI_TTS" }
 */

type Engine = "CACHE" | "ELEVENLABS" | "PIPER_TTS" | "COQUI_TTS" | "AZURE_TTS";

const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb"; // George — multilingual baseline
const BUCKET = "voice-lectures";

const j = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function selectEngine(requested: string, plan: string): Engine {
  // Founder/admin path defaults to ElevenLabs unless they ask otherwise.
  if (requested === "ELEVENLABS") return "ELEVENLABS";
  if (requested === "PIPER_TTS") return "PIPER_TTS";
  if (requested === "COQUI_TTS") return "COQUI_TTS";
  if (requested === "AZURE_TTS") return "AZURE_TTS";
  // AUTO: cost-optimised router (matches the proposal's tiering)
  if (plan === "FREE") return "PIPER_TTS";
  if (plan === "PRO") return "COQUI_TTS";
  return "ELEVENLABS"; // VIP / admin / founder
}

async function callElevenLabs(text: string, voice: string): Promise<Uint8Array> {
  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) throw new Error("elevenlabs_not_configured");
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
          speed: 1.0,
        },
      }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`elevenlabs_failed: ${res.status} ${err.slice(0, 200)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// Stub adapters — wire when self-hosted TTS endpoint is decided.
async function callPiper(_text: string): Promise<Uint8Array> {
  throw new Error("engine_not_configured: PIPER_TTS host not set");
}
async function callCoqui(_text: string): Promise<Uint8Array> {
  throw new Error("engine_not_configured: COQUI_TTS host not set");
}
async function callAzure(_text: string): Promise<Uint8Array> {
  throw new Error("engine_not_configured: AZURE_TTS key not set");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return j({ error: "unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) return j({ error: "unauthorized" }, 401);

    // Founder/admin gate — voice cloning is locked to the brand architect.
    const isAdmin = await userHasRole(userClient, user.id, "admin");
    if (!isAdmin) return j({ error: "forbidden_founder_only" }, 403);

    const body = await req.json().catch(() => ({}));
    const text = String(body.text ?? "").trim();
    const voice = String(body.voice ?? DEFAULT_VOICE);
    const requested = String(body.engine ?? "AUTO").toUpperCase();
    const plan = String(body.plan ?? "VIP").toUpperCase();

    if (!text) return j({ error: "text_required" }, 400);
    if (text.length > 4500) return j({ error: "text_too_long_max_4500" }, 400);

    const engine = selectEngine(requested, plan);
    const cacheKey = await sha256Hex(`${engine}|${voice}|${text}`);

    // Service-role client for cache + storage writes
    const admin = createClient(SUPABASE_URL, SERVICE);

    // 1. Cache lookup
    const { data: cached } = await admin
      .from("voice_cache")
      .select("id, audio_path, hit_count")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (cached) {
      await admin
        .from("voice_cache")
        .update({ hit_count: cached.hit_count + 1, last_used_at: new Date().toISOString() })
        .eq("id", cached.id);
      const { data: signed } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(cached.audio_path, 60 * 60);
      return j({ url: signed?.signedUrl ?? null, engine: "CACHE", cached: true });
    }

    // 2. Generate
    let audio: Uint8Array;
    switch (engine) {
      case "ELEVENLABS":
        audio = await callElevenLabs(text, voice);
        break;
      case "PIPER_TTS":
        audio = await callPiper(text);
        break;
      case "COQUI_TTS":
        audio = await callCoqui(text);
        break;
      case "AZURE_TTS":
        audio = await callAzure(text);
        break;
      default:
        return j({ error: `unsupported_engine:${engine}` }, 400);
    }

    // 3. Upload to private bucket under owner folder
    const path = `${user.id}/cache/${cacheKey}.mp3`;
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, audio, { contentType: "audio/mpeg", upsert: true });
    if (upErr) return j({ error: `storage_upload_failed: ${upErr.message}` }, 500);

    // 4. Record cache row
    await admin.from("voice_cache").insert({
      cache_key: cacheKey,
      user_id: user.id,
      engine,
      voice_id: voice,
      audio_path: path,
      char_count: text.length,
      byte_size: audio.byteLength,
    });

    const { data: signed } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60);

    return j({ url: signed?.signedUrl ?? null, engine, cached: false, chars: text.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith("engine_not_configured") ? 501 : 500;
    return j({ error: msg }, status);
  }
});
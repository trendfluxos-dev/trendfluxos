import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Transcribe a recorded lecture audio file via the Lovable AI Gateway
 * (Gemini multimodal). Authenticated owner-only.
 *
 * Body: { lectureId: string }
 * The function loads the audio from the `voice-lectures` bucket using the
 * caller's session, sends it inline (base64) to Gemini, writes the
 * transcript back to `voice_lectures`, and returns it.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return j({ error: "unauthorized" }, 401);
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return j({ error: "missing_lovable_key" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return j({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const lectureId = String(body.lectureId ?? "");
    if (!lectureId) return j({ error: "lectureId required" }, 400);

    const { data: lec, error: lecErr } = await supabase
      .from("voice_lectures")
      .select("id, user_id, audio_path, transcript")
      .eq("id", lectureId)
      .single();
    if (lecErr || !lec) return j({ error: "not_found" }, 404);
    if (lec.user_id !== user.id) return j({ error: "forbidden" }, 403);
    if (!lec.audio_path) return j({ error: "no_audio" }, 400);

    await supabase.from("voice_lectures").update({ status: "transcribing" }).eq("id", lectureId);

    const { data: file, error: dlErr } = await supabase.storage
      .from("voice-lectures").download(lec.audio_path);
    if (dlErr || !file) {
      await supabase.from("voice_lectures").update({ status: "failed", error_message: dlErr?.message ?? "download_failed" }).eq("id", lectureId);
      return j({ error: "download_failed", detail: dlErr?.message }, 500);
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    // Cap at ~20MB inline payload
    if (buf.byteLength > 20 * 1024 * 1024) {
      await supabase.from("voice_lectures").update({ status: "failed", error_message: "audio too large (>20MB)" }).eq("id", lectureId);
      return j({ error: "audio_too_large" }, 413);
    }
    const b64 = base64(buf);
    const mime = (file.type && file.type.length > 0) ? file.type : "audio/webm";

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "edge-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a careful audio transcriber. Output ONLY the transcript of the audio (no summary, no commentary). Preserve Bangla and English exactly as spoken.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe this lecture audio verbatim." },
              { type: "input_audio", input_audio: { data: b64, format: mime.includes("mp3") ? "mp3" : "webm" } },
            ],
          },
        ],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      await supabase.from("voice_lectures").update({ status: "failed", error_message: `gateway_${r.status}: ${txt.slice(0, 300)}` }).eq("id", lectureId);
      return j({ error: `gateway_${r.status}`, detail: txt.slice(0, 400) }, r.status);
    }
    const data = await r.json();
    const transcript = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!transcript) {
      await supabase.from("voice_lectures").update({ status: "failed", error_message: "empty_transcript" }).eq("id", lectureId);
      return j({ error: "empty_transcript" }, 502);
    }
    await supabase.from("voice_lectures").update({
      status: "ready",
      transcript,
      error_message: null,
    }).eq("id", lectureId);

    return j({ ok: true, transcript });
  } catch (err) {
    return j({ error: "internal", detail: (err as Error).message }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return btoa(s);
}
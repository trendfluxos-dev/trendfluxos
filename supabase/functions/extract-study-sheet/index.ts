import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Extract a structured study sheet from a transcribed lecture.
 * Owner-only. Writes/replaces a row in `voice_lecture_materials`.
 *
 * Body: { lectureId: string }
 * Output JSON: { summary, key_concepts[], flashcards[{q,a}], quiz[{q,options[],answerIndex}] }
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return j({ error: "unauthorized" }, 401);
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
      .select("id, user_id, title, subject, transcript")
      .eq("id", lectureId)
      .single();
    if (lecErr || !lec) return j({ error: "not_found" }, 404);
    if (lec.user_id !== user.id) return j({ error: "forbidden" }, 403);
    if (!lec.transcript || lec.transcript.trim().length < 20) {
      return j({ error: "transcript_too_short" }, 400);
    }

    const system = [
      "You are a study-sheet generator for online learners.",
      "Given a lecture transcript, produce a JSON object with this exact shape:",
      '{"summary": string (120-220 words),',
      ' "key_concepts": Array<{ "term": string, "definition": string }> (5-8 items),',
      ' "flashcards": Array<{ "q": string, "a": string }> (6-10 items),',
      ' "quiz": Array<{ "q": string, "options": [string,string,string,string], "answerIndex": 0|1|2|3 }> (5 items)}',
      "Respond with ONLY the JSON object — no prose, no markdown fence.",
      "Use the same language(s) as the transcript (Bangla and/or English).",
    ].join("\n");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "edge-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Lecture title: ${lec.title}\nSubject: ${lec.subject ?? "general"}\n\nTranscript:\n"""\n${lec.transcript}\n"""`,
          },
        ],
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return j({ error: `gateway_${r.status}`, detail: txt.slice(0, 400) }, r.status);
    }
    const data = await r.json();
    const raw = String(data?.choices?.[0]?.message?.content ?? "").trim();
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(stripFence(raw)); } catch {
      return j({ error: "bad_json", raw: raw.slice(0, 400) }, 502);
    }
    const summary = String(parsed.summary ?? "");
    const key_concepts = Array.isArray(parsed.key_concepts) ? parsed.key_concepts : [];
    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
    const quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];

    const { error: upErr } = await supabase.from("voice_lecture_materials").upsert(
      {
        lecture_id: lectureId,
        user_id: user.id,
        summary,
        key_concepts,
        flashcards,
        quiz,
        model: "google/gemini-2.5-flash",
      },
      { onConflict: "lecture_id" },
    );
    if (upErr) return j({ error: "save_failed", detail: upErr.message }, 500);

    return j({ ok: true, summary, key_concepts, flashcards, quiz });
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
function stripFence(s: string) {
  return s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}
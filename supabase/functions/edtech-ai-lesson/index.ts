import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { userHasRole, type AppRole } from "../_shared/adminCheck.ts";

/**
 * AI lesson drafting for the EdTech course studio.
 *
 * Given a course + lesson topic, returns a structured teaching draft:
 * title, learner-facing summary, narration script, key takeaways and a
 * suggested visual direction. Used by the AI Lesson Composer (teacher
 * workspace) and the per-lesson summary panel in the lesson player.
 *
 * Access: authenticated users holding admin / teacher / tutor. The client
 * already gates the UI, but paid AI quota must be protected server-side too.
 */

const TEACHER_ROLES: AppRole[] = ["admin", "teacher", "tutor"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Draft = {
  lessonTitle: string;
  summary: string;
  script: string;
  keyTakeaways: string[];
  estimatedDuration: string;
  visualPrompt: string;
};

const SYSTEM = [
  "You are a senior curriculum designer for TrendFlux EdTech, a Bangladeshi",
  "professional-skills platform teaching in Bangla and English.",
  "Produce practical, specific, non-generic teaching material an instructor can",
  "record immediately. No filler, no marketing language, no invented statistics.",
  "Respond with JSON only, matching exactly this shape:",
  '{"lessonTitle":string,"summary":string,"script":string,"keyTakeaways":string[],',
  '"estimatedDuration":string,"visualPrompt":string}',
  "summary: 2 sentences for learners. script: 200-320 words of spoken narration",
  "with a hook, 3 teaching beats and a closing action. keyTakeaways: 4-6 short",
  "items. estimatedDuration: like '9 min'. visualPrompt: one sentence describing",
  "the slide/visual direction.",
].join(" ");

const parseDraft = (raw: string): Draft | null => {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const p = JSON.parse(cleaned.slice(start, end + 1)) as Partial<Draft>;
    if (!p.script || !p.summary) return null;
    return {
      lessonTitle: String(p.lessonTitle ?? "").slice(0, 200),
      summary: String(p.summary).slice(0, 1200),
      script: String(p.script).slice(0, 8000),
      keyTakeaways: Array.isArray(p.keyTakeaways)
        ? p.keyTakeaways.slice(0, 8).map((t) => String(t).slice(0, 240))
        : [],
      estimatedDuration: String(p.estimatedDuration ?? "").slice(0, 24),
      visualPrompt: String(p.visualPrompt ?? "").slice(0, 600),
    };
  } catch {
    return null;
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    let allowed = false;
    for (const role of TEACHER_ROLES) {
      if (await userHasRole(userClient, user.id, role)) {
        allowed = true;
        break;
      }
    }
    if (!allowed) return json({ error: "forbidden" }, 403);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "ai_unavailable" }, 503);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 600) : "";
    if (!topic) return json({ error: "topic is required" }, 400);

    const courseTitle =
      typeof body.courseTitle === "string" ? body.courseTitle.trim().slice(0, 200) : "";
    const courseCategory =
      typeof body.courseCategory === "string" ? body.courseCategory.trim().slice(0, 120) : "";
    const lessonNumber =
      typeof body.lessonNumber === "string" ? body.lessonNumber.trim().slice(0, 12) : "";
    const language = body.language === "bn" ? "bn" : "en";

    const prompt = [
      `Course: ${courseTitle || "TrendFlux professional course"}`,
      courseCategory ? `Category: ${courseCategory}` : "",
      lessonNumber ? `Lesson number: ${lessonNumber}` : "",
      `Lesson topic: ${topic}`,
      language === "bn"
        ? "Write summary, script and takeaways in natural Bangla (technical terms may stay in English)."
        : "Write in clear professional English.",
    ]
      .filter(Boolean)
      .join("\n");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
    if (upstream.status === 402) return json({ error: "credits_required" }, 402);
    if (!upstream.ok) {
      console.error("edtech-ai-lesson: gateway error", upstream.status, await upstream.text());
      return json({ error: "ai_request_failed" }, 502);
    }

    const payload = await upstream.json();
    const raw: string = payload?.choices?.[0]?.message?.content ?? "";
    const draft = parseDraft(raw);
    if (!draft) {
      console.error("edtech-ai-lesson: unparsable model output");
      return json({ error: "ai_invalid_response" }, 502);
    }

    if (!draft.lessonTitle) draft.lessonTitle = topic.slice(0, 120);
    return json(draft);
  } catch (err) {
    console.error("edtech-ai-lesson: unexpected error", (err as Error).message);
    return json({ error: "internal_error" }, 500);
  }
});

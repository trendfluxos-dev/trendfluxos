import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * AI palette suggestions for Theme Studio.
 *
 * The model proposes brand-matching palettes; this function is the authority on
 * accessibility: every returned primary colour is nudged (lightness only, hue
 * and saturation preserved) until it clears WCAG AA 4.5:1 against the target
 * surface, so a suggestion can never ship an illegible CTA.
 *
 * Public endpoint (Theme Studio is available to every visitor), so requests are
 * rate limited per IP to protect AI credit spend.
 */

interface Hsl {
  h: number;
  s: number;
  l: number;
}

interface Suggestion {
  name: string;
  rationale: string;
  primary: Hsl;
  contrast: number;
  adjusted: boolean;
}

const MODEL = "google/gemini-3.6-flash";
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

/* ── WCAG maths (mirrors src/lib/themeStudio.ts) ─────────────── */

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Hsl, b: Hsl): number {
  const la = luminance(hslToRgb(a));
  const lb = luminance(hslToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Walks lightness toward the accessible direction (brighter on dark surfaces,
 * darker on light ones) until AA passes, keeping the brand hue intact.
 */
function enforceContrast(primary: Hsl, surface: Hsl): { color: Hsl; ratio: number; adjusted: boolean } {
  const direction = surface.l > 50 ? -1 : 1;
  let color: Hsl = { ...primary };
  let ratio = contrast(color, surface);
  let adjusted = false;

  for (let i = 0; i < 90 && ratio < 4.5; i += 1) {
    const nextL = clamp(color.l + direction, 12, 92);
    if (nextL === color.l) break;
    color = { ...color, l: nextL };
    ratio = contrast(color, surface);
    adjusted = true;
  }
  return { color, ratio, adjusted };
}

function parseHsl(raw: unknown): Hsl | null {
  if (typeof raw !== "object" || raw === null) return null;
  const v = raw as Record<string, unknown>;
  if (typeof v.h !== "number" || typeof v.s !== "number" || typeof v.l !== "number") return null;
  return {
    h: clamp(Math.round(v.h), 0, 360),
    s: clamp(Math.round(v.s), 0, 100),
    l: clamp(Math.round(v.l), 5, 95),
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";
    if (rateLimited(ip)) {
      return json({ error: "rate_limited", message: "Too many palette requests. Try again in a minute." }, 429);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const body = await req.json().catch(() => ({}));
    const brief = typeof body.brief === "string" ? body.brief.trim().slice(0, 400) : "";
    const mode = body.mode === "light" ? "light" : "dark";
    const surface: Hsl = mode === "dark" ? { h: 240, s: 20, l: 4 } : { h: 0, s: 0, l: 100 };

    const system = [
      "You are a senior brand and product designer.",
      "Propose 4 distinct primary brand colours for a premium enterprise software UI.",
      `The interface runs in ${mode} mode on a ${mode === "dark" ? "near-black charcoal" : "white"} background.`,
      "Return ONLY JSON of the shape:",
      '{"palettes":[{"name":"...","rationale":"...","primary":{"h":0,"s":72,"l":45}}]}',
      "Rules: name max 22 characters; rationale max 90 characters; h 0-360, s 35-100, l 25-70.",
      mode === "dark"
        ? "Favour lightness 45-70 so the colour stays legible on dark surfaces."
        : "Favour lightness 28-48 so the colour stays legible on white surfaces.",
      "Make the four options meaningfully different in hue. No markdown, no commentary.",
    ].join(" ");

    const user = brief
      ? `Brand brief: ${brief}`
      : "Brand brief: TrendFlux DIGITAL — an AI-first enterprise technology company building automation, analytics and media systems. Confident, technical, premium.";

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "edge-fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error(`AI gateway failed [${r.status}]: ${detail.slice(0, 500)}`);
      if (r.status === 429) return json({ error: "rate_limited", message: "AI is busy — try again shortly." }, 429);
      if (r.status === 402) {
        return json({ error: "credits_exhausted", message: "AI credits are exhausted for this workspace." }, 402);
      }
      return json({ error: "gateway_error", status: r.status }, 502);
    }

    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    const rawList = (parsed as { palettes?: unknown })?.palettes;
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return json({ error: "bad_model_output", message: "Could not read a palette from the model." }, 502);
    }

    const palettes: Suggestion[] = [];
    for (const item of rawList.slice(0, 4)) {
      if (typeof item !== "object" || item === null) continue;
      const entry = item as Record<string, unknown>;
      const hsl = parseHsl(entry.primary);
      if (!hsl) continue;
      const { color, ratio, adjusted } = enforceContrast(hsl, surface);
      palettes.push({
        name: typeof entry.name === "string" ? entry.name.slice(0, 28) : "AI palette",
        rationale: typeof entry.rationale === "string" ? entry.rationale.slice(0, 120) : "",
        primary: color,
        contrast: Math.round(ratio * 100) / 100,
        adjusted,
      });
    }

    if (palettes.length === 0) {
      return json({ error: "bad_model_output", message: "No usable colours were returned." }, 502);
    }

    return json({ mode, palettes });
  } catch (err) {
    console.error("theme-palette-ai failed:", (err as Error).message);
    return json({ error: "internal" }, 500);
  }
});

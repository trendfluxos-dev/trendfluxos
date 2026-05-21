import { supabase } from "@/integrations/supabase/client";

type Severity = "error" | "warning" | "info";

interface ErrorPayload {
  message: string;
  stack?: string;
  source?: string;
  url?: string;
  user_agent?: string;
  release?: string;
  severity?: Severity;
  meta?: Record<string, unknown>;
}

// Dedupe identical messages within a short window to avoid spam loops.
const recent = new Map<string, number>();
const DEDUPE_MS = 10_000;
const MAX_QUEUE = 20;
let sentCount = 0;
const SESSION_CAP = 50;

const RELEASE = (import.meta.env.VITE_BUILD_SHA as string | undefined) ?? "dev";

const shouldDrop = (key: string) => {
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < DEDUPE_MS) return true;
  recent.set(key, now);
  // Trim map
  if (recent.size > MAX_QUEUE) {
    for (const [k, t] of recent) {
      if (now - t > DEDUPE_MS) recent.delete(k);
    }
  }
  return false;
};

const truncate = (s: string | undefined, n = 4000) =>
  s && s.length > n ? s.slice(0, n) + "…[truncated]" : s;

export async function logClientError(payload: ErrorPayload) {
  try {
    if (sentCount >= SESSION_CAP) return;
    const message = truncate(payload.message, 1000) ?? "(no message)";
    const key = `${payload.severity ?? "error"}::${message}`;
    if (shouldDrop(key)) return;
    sentCount += 1;

    const { data: auth } = await supabase.auth.getUser();
    await supabase.from("client_errors").insert({
      message,
      stack: truncate(payload.stack),
      source: payload.source,
      url: payload.url ?? (typeof window !== "undefined" ? window.location.href : null),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      release: payload.release ?? RELEASE,
      severity: payload.severity ?? "error",
      user_id: auth?.user?.id ?? null,
      meta: (payload.meta ?? null) as never,
    });
  } catch {
    // Never throw from the logger.
  }
}

let installed = false;

export function installErrorLogger() {
  if (installed) return;
  installed = true;

  // Skip non-production environments to keep dev console quiet.
  if (import.meta.env.DEV) return;

  // Skip Lovable iframe preview (only log live custom-domain / published traffic).
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("lovable.app") || host.endsWith("lovableproject.com")) return;
  }

  window.addEventListener("error", (e) => {
    // Skip chunk-load errors — main.tsx handles those via reload.
    const msg = e.message || "";
    if (/Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError/i.test(msg)) {
      return;
    }
    void logClientError({
      message: msg || "Unknown error",
      stack: e.error?.stack,
      source: e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : "window.onerror",
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason as { message?: string; stack?: string } | string | undefined;
    const message =
      typeof reason === "string"
        ? reason
        : reason?.message ?? JSON.stringify(reason ?? "Unhandled rejection");
    void logClientError({
      message,
      stack: typeof reason === "object" ? reason?.stack : undefined,
      source: "unhandledrejection",
    });
  });

  // Mirror console.error so React render warnings/errors are captured too.
  const origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      const message = args
        .map((a) => (a instanceof Error ? a.message : typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
      const stack = args.find((a) => a instanceof Error) as Error | undefined;
      void logClientError({
        message,
        stack: stack?.stack,
        source: "console.error",
        severity: "error",
      });
    } catch {
      /* noop */
    }
    origError(...args);
  };
}

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

/**
 * Generate a short, sortable correlation id. Used to stitch together related
 * log entries (an initial error, its retry attempts, a chunk-reload that
 * follows it, and any post-reload follow-up errors).
 */
export const newCorrelationId = (): string => {
  const rand =
    (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
    `${Math.random().toString(36).slice(2, 10)}`;
  return `cid_${Date.now().toString(36)}_${rand.slice(0, 8)}`;
};

// The most-recent correlation id observed by any logger entry-point. Lets
// global handlers (window.onerror, unhandledrejection, console.error) tag
// follow-up noise with the same id as the originating boundary error.
let lastCorrelationId: string | null = null;
export const getLastCorrelationId = () => lastCorrelationId;
export const setLastCorrelationId = (id: string | null) => {
  lastCorrelationId = id;
};

// Persisted across a hard reload (chunkReload) so post-reload errors can be
// linked back to the chunk-load failure that triggered the reload.
const PENDING_CID_KEY = "__client_error_pending_cid";
export const getPendingCorrelationId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(PENDING_CID_KEY);
  } catch {
    return null;
  }
};
export const setPendingCorrelationId = (id: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (id) sessionStorage.setItem(PENDING_CID_KEY, id);
    else sessionStorage.removeItem(PENDING_CID_KEY);
  } catch {
    /* noop */
  }
};

// Stable per-tab session id so a sequence of errors from one user can be
// correlated in the client_errors table without exposing PII.
const SESSION_KEY = "__client_error_session_id";
const getSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

const buildContextMeta = (): Record<string, unknown> => {
  if (typeof window === "undefined") return {};
  const loc = window.location;
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  return {
    session_id: getSessionId(),
    pathname: loc.pathname,
    search: loc.search || undefined,
    hash: loc.hash || undefined,
    referrer: document.referrer || undefined,
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
    language: typeof navigator !== "undefined" ? navigator.language : undefined,
    connection: nav.connection?.effectiveType,
    ts_iso: new Date().toISOString(),
  };
};

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

    // Correlation id resolution priority:
    //   1. explicit meta.correlation_id from the caller (boundary/retry)
    //   2. pending id persisted across a chunk reload
    //   3. last id observed in this tab (global handler follow-ups)
    //   4. freshly minted id
    const explicitCid =
      (payload.meta?.correlation_id as string | undefined) ?? undefined;
    const correlation_id =
      explicitCid ?? getPendingCorrelationId() ?? lastCorrelationId ?? newCorrelationId();
    lastCorrelationId = correlation_id;

    const { data: auth } = await supabase.auth.getUser();
    const { data: sessionData } = await supabase.auth.getSession();
    const user = auth?.user;
    const session = sessionData?.session;
    const authMeta = {
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      auth_provider: user?.app_metadata?.provider ?? null,
      authenticated: Boolean(session),
      session_expires_at: session?.expires_at ?? null,
    };

    const mergedMeta = {
      ...buildContextMeta(),
      ...authMeta,
      ...(payload.meta ?? {}),
      correlation_id,
    };

    await supabase.from("client_errors").insert({
      message,
      stack: truncate(payload.stack),
      source: payload.source,
      url: payload.url ?? (typeof window !== "undefined" ? window.location.href : null),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      release: payload.release ?? RELEASE,
      severity: payload.severity ?? "error",
      user_id: user?.id ?? null,
      meta: mergedMeta as never,
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

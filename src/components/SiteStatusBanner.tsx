import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

const STATUS_ENDPOINT =
  "https://dnodqhwwzdqfqlndwhsf.supabase.co/functions/v1/site-status";

type Check = { label: string; ok: boolean; detail?: string };

type ServerStatus = {
  reachable: boolean;
  published: boolean;
  ssl: boolean;
  status: number;
  latency_ms: number;
  checked_at: string;
};

/**
 * Lightweight, dependency-free status banner.
 * Shows whether the current origin is live, published, and SSL-secured.
 * Dismissible per-session.
 */
export default function SiteStatusBanner() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("site_status_dismissed") === "1") {
      setDismissed(true);
      return;
    }

    const { protocol, hostname, origin } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const isPreview = /lovable\.(app|dev)|lovableproject\.com/.test(hostname);
    const isCustom = !isLocal && !isPreview;
    const isSslClient = protocol === "https:";

    const buildClient = (s: ServerStatus | null): Check[] => [
      {
        label: isCustom
          ? `Custom domain (${hostname})`
          : isPreview
            ? "Lovable preview domain"
            : "Local dev",
        ok: !isLocal,
        detail: hostname,
      },
      {
        label: s ? "Published & reachable" : "Published (local check)",
        ok: s ? s.published && s.reachable : !isLocal && isSslClient,
        detail: s ? `${s.status} · ${s.latency_ms}ms` : undefined,
      },
      {
        label: "SSL active (HTTPS)",
        ok: s ? s.ssl : isSslClient,
      },
    ];

    setChecks(buildClient(null));

    let cancelled = false;
    const run = async () => {
      if (isLocal) return; // skip server probe for local dev
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6000);
        const r = await fetch(
          `${STATUS_ENDPOINT}?url=${encodeURIComponent(origin)}`,
          { signal: ctrl.signal },
        ).finally(() => clearTimeout(t));
        const result = r.ok ? ((await r.json()) as ServerStatus) : null;
        if (!cancelled && result) {
          setChecks(buildClient(result));
          setCheckedAt(new Date().toLocaleTimeString());
        }
      } catch {
        /* network hiccup — keep last known state */
      }
    };

    // Defer first probe to idle so it never blocks first paint.
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (ric) ric(run); else setTimeout(run, 1500);

    const id = window.setInterval(run, 60_000);
    const onVis = () => { if (document.visibilityState === "visible") run(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (dismissed || !checks) return null;
  const allOk = checks.every((c) => c.ok);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full border-b text-xs sm:text-sm ${
        allOk
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
          : "border-amber-500/30 bg-amber-500/10 text-amber-100"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-1.5">
        {allOk ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}
        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
          {checks.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  c.ok ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span className="opacity-90">
                {c.label}
                {c.detail ? <span className="ml-1 opacity-60">· {c.detail}</span> : null}
              </span>
            </span>
          ))}
          {checkedAt && (
            <span className="ml-auto text-[10px] opacity-50">checked {checkedAt}</span>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss status banner"
          onClick={() => {
            sessionStorage.setItem("site_status_dismissed", "1");
            setDismissed(true);
          }}
          className="rounded p-1 hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
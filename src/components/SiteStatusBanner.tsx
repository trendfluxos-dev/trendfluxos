import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [server, setServer] = useState<ServerStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<string>("");
  const [isLocal, setIsLocal] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSslClient, setIsSslClient] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("site_status_dismissed") === "1") {
      setDismissed(true);
      return;
    }

    const { protocol, hostname, origin } = window.location;
    const _isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const _isPreview = /lovable\.(app|dev)|lovableproject\.com/.test(hostname);
    const isCustom = !_isLocal && !_isPreview;
    const _isSsl = protocol === "https:";
    setHost(hostname);
    setIsLocal(_isLocal);
    setIsPreview(_isPreview);
    setIsSslClient(_isSsl);

    const buildClient = (s: ServerStatus | null): Check[] => [
      {
        label: isCustom
          ? `Custom domain (${hostname})`
          : _isPreview
            ? "Lovable preview domain"
            : "Local dev",
        ok: !_isLocal,
        detail: hostname,
      },
      {
        label: s ? "Published & reachable" : "Published (local check)",
        ok: s ? s.published && s.reachable : !_isLocal && _isSsl,
        detail: s ? `${s.status} · ${s.latency_ms}ms` : undefined,
      },
      {
        label: "SSL active (HTTPS)",
        ok: s ? s.ssl : _isSsl,
      },
    ];

    setChecks(buildClient(null));

    let cancelled = false;
    const run = async () => {
      if (_isLocal) return; // skip server probe for local dev
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
          setServer(result);
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
    <>
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
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-left hover:opacity-90 focus:outline-none"
          aria-label="View site status details"
        >
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
          <span className="ml-2 rounded border border-current/30 px-1.5 py-0.5 text-[10px] opacity-70">
            Details
          </span>
        </button>
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Site status details</DialogTitle>
          <DialogDescription>
            Live verification of DNS, publish state and SSL for the current origin.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-3 gap-y-2 text-sm">
          <dt className="col-span-1 text-muted-foreground">Host</dt>
          <dd className="col-span-2 font-mono break-all">{host}</dd>

          <dt className="col-span-1 text-muted-foreground">Environment</dt>
          <dd className="col-span-2">
            {isLocal ? "Local dev" : isPreview ? "Lovable preview" : "Custom domain"}
          </dd>

          <dt className="col-span-1 text-muted-foreground">DNS / reachable</dt>
          <dd className="col-span-2">
            {server ? (server.reachable ? "✅ Resolves & responds" : "⚠️ Not reachable") : "—"}
          </dd>

          <dt className="col-span-1 text-muted-foreground">Published</dt>
          <dd className="col-span-2">
            {server ? (server.published ? `✅ HTTP ${server.status}` : `⚠️ HTTP ${server.status || "n/a"}`) : "—"}
          </dd>

          <dt className="col-span-1 text-muted-foreground">SSL (HTTPS)</dt>
          <dd className="col-span-2">
            {server ? (server.ssl ? "✅ Valid certificate" : "⚠️ No HTTPS") : isSslClient ? "✅ HTTPS (client)" : "⚠️ HTTP only"}
          </dd>

          <dt className="col-span-1 text-muted-foreground">Latency</dt>
          <dd className="col-span-2">{server ? `${server.latency_ms} ms` : "—"}</dd>

          <dt className="col-span-1 text-muted-foreground">Last checked</dt>
          <dd className="col-span-2">
            {server ? new Date(server.checked_at).toLocaleString() : checkedAt ?? "pending"}
          </dd>
        </dl>
        <p className="text-xs text-muted-foreground">
          If visitors still report errors, the domain's DNS may point elsewhere or a proxy/CDN
          may be blocking the request. Re-verify A record → <code>185.158.133.1</code> and
          disable any third-party proxy in front of the domain.
        </p>
      </DialogContent>
    </Dialog>
    </>
  );
}
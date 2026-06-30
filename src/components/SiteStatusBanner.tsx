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

type CacheInfo = {
  hit: boolean;
  age_s: number | null;
  ttl_s: number | null;
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
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
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
          const xCache = r.headers.get("x-cache");
          const ageHdr = r.headers.get("age");
          const cc = r.headers.get("cache-control") || "";
          const ttlMatch = cc.match(/max-age=(\d+)/);
          setCacheInfo({
            hit: (xCache || "").toUpperCase() === "HIT",
            age_s: ageHdr ? Number(ageHdr) : null,
            ttl_s: ttlMatch ? Number(ttlMatch[1]) : null,
          });
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

          <dt className="col-span-1 text-muted-foreground">Cache</dt>
          <dd className="col-span-2">
            {cacheInfo ? (
              <span>
                {cacheInfo.hit ? "✅ HIT (served from cache)" : "🟡 MISS (fresh probe)"}
              </span>
            ) : "—"}
          </dd>

          <dt className="col-span-1 text-muted-foreground">Age</dt>
          <dd className="col-span-2">
            {cacheInfo?.age_s != null ? `${cacheInfo.age_s}s` : "0s"}
            {cacheInfo?.ttl_s != null && (
              <span className="ml-1 opacity-60">/ TTL {cacheInfo.ttl_s}s</span>
            )}
          </dd>
        </dl>
        <p className="text-xs text-muted-foreground">
          If visitors still report errors, the domain's DNS may point elsewhere or a proxy/CDN
          may be blocking the request. Re-verify A record → <code>185.158.133.1</code> and
          disable any third-party proxy in front of the domain.
        </p>

        <div className="mt-2 max-h-[42vh] overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <p className="mb-2 font-semibold text-foreground">
            Hostinger DNS/SSL troubleshooting checklist
          </p>
          <ol className="list-decimal space-y-2 pl-4 [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono">
            <li>
              <b>Login → hPanel → Domains → DNS / Nameservers.</b> Make sure nameservers
              are Hostinger's defaults (or your registrar's), not an old host.
            </li>
            <li>
              <b>DNS Zone Editor → A records.</b> Delete any old A records for{" "}
              <code>@</code> and <code>www</code>. Add:
              <ul className="mt-1 list-disc pl-4">
                <li>Type <code>A</code> · Name <code>@</code> · Points to <code>185.158.133.1</code> · TTL <code>14400</code></li>
                <li>Type <code>A</code> · Name <code>www</code> · Points to <code>185.158.133.1</code> · TTL <code>14400</code></li>
              </ul>
            </li>
            <li>
              <b>Add the TXT verification record.</b> Type <code>TXT</code> · Name{" "}
              <code>_lovable</code> · Value from Lovable → Project Settings → Domains.
            </li>
            <li>
              <b>Remove conflicts:</b> delete legacy <code>CNAME</code>, <code>AAAA</code>,
              or parking records pointing to Vercel / Hostinger park / GitHub Pages.
            </li>
            <li>
              <b>Turn OFF Cloudflare proxy (orange cloud → grey).</b> Proxy mode breaks
              Lovable SSL issuance. If you must keep Cloudflare, enable "Domain uses
              Cloudflare or a similar proxy" inside Lovable's Connect Domain dialog.
            </li>
            <li>
              <b>SSL in hPanel → Advanced → SSL:</b> remove any old "Hostinger SSL" or
              AutoSSL bound to this domain. Lovable provisions Let's Encrypt automatically.
            </li>
            <li>
              <b>CAA records:</b> if present, ensure they include{" "}
              <code>0 issue "letsencrypt.org"</code> — otherwise SSL will fail.
            </li>
            <li>
              <b>Wait & verify propagation:</b> 5 min – 72 h. Check at{" "}
              <a className="underline" href="https://dnschecker.org" target="_blank" rel="noreferrer">
                dnschecker.org
              </a>{" "}
              for both <code>{host || "yourdomain"}</code> and <code>www.{host || "yourdomain"}</code>.
            </li>
            <li>
              <b>In Lovable → Project Settings → Domains:</b> add BOTH the root and{" "}
              <code>www</code> as separate entries, then click <i>Retry</i> if status is
              "Failed".
            </li>
            <li>
              <b>Force-publish:</b> hit "Publish" once more so the latest bundle is
              attached to the active domain.
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://dnschecker.org/#A/${host || ""}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-border px-2 py-1 hover:bg-background"
            >
              Check DNS propagation →
            </a>
            <a
              href={`https://www.ssllabs.com/ssltest/analyze.html?d=${host || ""}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-border px-2 py-1 hover:bg-background"
            >
              Test SSL →
            </a>
            <a
              href="https://hpanel.hostinger.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-border px-2 py-1 hover:bg-background"
            >
              Open Hostinger hPanel →
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
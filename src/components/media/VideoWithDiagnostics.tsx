import { useEffect, useRef, useState, VideoHTMLAttributes } from "react";
import { AlertTriangle, Copy, RefreshCw, X } from "lucide-react";
import { track } from "@/lib/analytics";

function mediaErrorText(code?: number) {
  switch (code) {
    case 1: return "Playback aborted (MEDIA_ERR_ABORTED).";
    case 2: return "Network error while loading video (MEDIA_ERR_NETWORK).";
    case 3: return "Video decode failed (MEDIA_ERR_DECODE).";
    case 4: return "Video source not supported (MEDIA_ERR_SRC_NOT_SUPPORTED).";
    default: return "Unknown media error.";
  }
}

type Props = VideoHTMLAttributes<HTMLVideoElement> & {
  /** Optional analytics label so events can be attributed to a specific film. */
  analyticsId?: string;
  /** Optional wrapper class for the outer flex column. */
  wrapperClassName?: string;
};

/**
 * VideoWithDiagnostics — wraps a native <video> element and surfaces a
 * diagnostics panel (mute/volume status, autoplay policy hint, current
 * source URL, error code) whenever the browser reports a playback failure.
 */
export function VideoWithDiagnostics({
  analyticsId,
  wrapperClassName,
  className,
  ...videoProps
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [diag, setDiag] = useState<null | { code?: number; message: string; name?: string }>(null);
  const [dismissed, setDismissed] = useState(false);
  const [muted, setMuted] = useState<boolean>(!!videoProps.muted);
  const [volume, setVolume] = useState(1);
  const [copied, setCopied] = useState(false);

  const autoplayPolicy =
    typeof navigator !== "undefined" && "getAutoplayPolicy" in navigator
      // @ts-ignore - experimental API
      ? (navigator.getAutoplayPolicy?.("mediaelement") as string) ?? "unknown"
      : "unknown";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onVol = () => { setMuted(el.muted); setVolume(el.volume); };
    const onError = () => {
      const err = el.error;
      const message = err?.message || mediaErrorText(err?.code);
      // eslint-disable-next-line no-console
      console.error("[VideoWithDiagnostics] video failed to load", {
        analyticsId,
        code: err?.code,
        message,
        src: el.currentSrc || (videoProps.src as string | undefined),
      });
      setDiag({
        code: err?.code,
        message,
        name: "MediaError",
      });
      setDismissed(false);
      track("video_error", {
        analytics_id: analyticsId,
        code: err?.code,
        message,
        src: el.currentSrc || (videoProps.src as string | undefined),
      });
    };
    el.addEventListener("volumechange", onVol);
    el.addEventListener("error", onError);
    onVol();
    return () => {
      el.removeEventListener("volumechange", onVol);
      el.removeEventListener("error", onError);
    };
  }, [analyticsId, videoProps.src]);

  const currentSrc = ref.current?.currentSrc || (videoProps.src as string | undefined) || "";

  return (
    <div className={wrapperClassName}>
      <video ref={ref} className={className} {...videoProps} />
      {diag && !dismissed && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-[12px] text-foreground"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive">
                  Video diagnostics
                </div>
                <p className="mt-1 text-foreground/90">{diag.message}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Dismiss video diagnostics"
              onClick={() => setDismissed(true)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 font-mono text-[11px] sm:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Mute</dt>
              <dd>{muted ? "muted" : "unmuted"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Volume</dt>
              <dd>{Math.round(volume * 100)}%</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Autoplay policy</dt>
              <dd>{autoplayPolicy}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Error code</dt>
              <dd>{diag.code ?? diag.name ?? "—"}</dd>
            </div>
            <div className="col-span-full mt-1 flex items-start gap-2">
              <dt className="shrink-0 text-muted-foreground">Source</dt>
              <dd className="min-w-0 flex-1 truncate" title={currentSrc}>{currentSrc || "—"}</dd>
              <button
                type="button"
                aria-label="Copy video source URL"
                onClick={() => {
                  if (!currentSrc) return;
                  void navigator.clipboard?.writeText(currentSrc);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                const wasMuted = el.muted;
                const prevVolume = el.volume;
                el.load();
                el.muted = wasMuted;
                el.volume = prevVolume;
                setDiag(null);
                void el.play().catch(() => {});
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <RefreshCw className="h-3 w-3" />
              Auto-retry
            </button>
            <button
              type="button"
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                el.muted = false;
                el.load();
                setDiag(null);
                void el.play().catch(() => {});
              }}
              className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Retry unmuted
            </button>
            {currentSrc && (
              <a
                href={currentSrc}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Open source in new tab
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
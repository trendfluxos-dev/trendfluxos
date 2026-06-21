import { AlertTriangle, RefreshCw } from "lucide-react";

export function mediaErrorMessage(code?: number, kind: "audio" | "video" = "audio") {
  switch (code) {
    case 1: return `Playback was aborted.`;
    case 2: return `Couldn't reach the ${kind} file — please check your connection.`;
    case 3: return `The ${kind} file appears to be corrupted and couldn't be decoded.`;
    case 4: return `This ${kind} format isn't supported by your browser.`;
    default: return `We couldn't play this ${kind} right now.`;
  }
}

type Props = {
  kind?: "audio" | "video";
  code?: number;
  message?: string;
  onRetry: () => void;
  className?: string;
};

/**
 * MediaErrorNotice — calm, friendly inline error state for media elements.
 * Pairs with a `<audio>`/`<video>` `error` listener and exposes a single
 * Retry action that should re-call `.load()` + `.play()` on the element.
 */
export function MediaErrorNotice({ kind = "audio", code, message, onRetry, className }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={
        "mt-3 flex flex-wrap items-start gap-3 rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-[12px] text-foreground " +
        (className ?? "")
      }
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="text-foreground/90">
          {message ?? mediaErrorMessage(code, kind)}
        </p>
        {code != null && (
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            error code {code}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <RefreshCw className="h-3 w-3" />
        Retry
      </button>
    </div>
  );
}
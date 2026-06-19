import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useCdnHeaderCheck } from "@/lib/cdnHeaderCheck";

type Props = {
  /** URL to probe with a HEAD (or ranged GET fallback). */
  url: string | null | undefined;
  /** Expected content-type prefix, e.g. `"audio/"` or `"video/"`. */
  expectedTypePrefix?: string;
  /** Optional label rendered before the status pill. */
  label?: string;
  className?: string;
};

/**
 * CdnStatusChip — compact, always-visible health indicator for a media URL.
 * Shows HTTP status, Content-Type, and a refresh button. Color reflects
 * pass/fail at a glance; details are exposed via `title` for inspection.
 */
export function CdnStatusChip({ url, expectedTypePrefix, label = "CDN", className }: Props) {
  const probe = useCdnHeaderCheck(url);
  const typeOk = expectedTypePrefix
    ? !!probe.contentType && probe.contentType.toLowerCase().startsWith(expectedTypePrefix)
    : true;
  const healthy = probe.ok && typeOk;

  const Icon = probe.checking ? Loader2 : healthy ? CheckCircle2 : AlertCircle;
  const tone = probe.checking
    ? "border-border text-muted-foreground"
    : healthy
      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      : "border-destructive/40 text-destructive";

  const statusText = probe.checking
    ? "checking…"
    : probe.error
      ? "no response"
      : `${probe.status}${probe.status === 200 ? " OK" : probe.status === 206 ? " Partial" : ""}`;

  const title = [
    `URL: ${url ?? "—"}`,
    `Status: ${probe.status || "—"}`,
    `Content-Type: ${probe.contentType ?? "—"}`,
    probe.acceptRanges ? `Accept-Ranges: ${probe.acceptRanges}` : null,
    probe.contentLength ? `Content-Length: ${probe.contentLength}` : null,
    probe.cacheControl ? `Cache-Control: ${probe.cacheControl}` : null,
    probe.error ? `Error: ${probe.error}` : null,
    probe.checkedAt ? `Checked: ${new Date(probe.checkedAt).toLocaleTimeString()}` : null,
  ].filter(Boolean).join("\n");

  return (
    <span
      role="status"
      title={title}
      className={
        "inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-2 py-0.5 font-mono text-[10px] " +
        tone +
        (className ? " " + className : "")
      }
    >
      <Icon className={"h-3 w-3 " + (probe.checking ? "animate-spin" : "")} />
      <span className="uppercase tracking-[0.16em]">{label}</span>
      <span aria-hidden className="opacity-40">·</span>
      <span>{statusText}</span>
      {probe.contentType && (
        <>
          <span aria-hidden className="opacity-40">·</span>
          <span className={typeOk ? "" : "text-destructive"}>{probe.contentType.split(";")[0]}</span>
        </>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          probe.recheck();
        }}
        aria-label="Re-check CDN headers"
        className="ml-0.5 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <RefreshCw className={"h-2.5 w-2.5 " + (probe.checking ? "animate-spin" : "")} />
      </button>
    </span>
  );
}
import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Moon, ShieldCheck, Sun } from "lucide-react";
import type { A11yReport } from "@/lib/a11yAudit";
import { cn } from "@/lib/utils";

/**
 * Renders the contrast / accessibility audit results for the previewed route,
 * grouped by viewport and colour mode.
 */
export default function A11yPanel({
  reports,
  running,
}: {
  reports: A11yReport[];
  running: boolean;
}) {
  const totals = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let checked = 0;
    for (const report of reports) {
      checked += report.checked;
      for (const issue of report.issues) {
        if (issue.severity === "critical") critical += 1;
        else warning += 1;
      }
    }
    return { critical, warning, checked };
  }, [reports]);

  if (running) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-[12px] text-foreground/70">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Checking contrast in light and dark mode…
      </div>
    );
  }

  if (!reports.length) return null;

  const clean = totals.critical === 0 && totals.warning === 0;

  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-background/60 p-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
        {clean ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            No contrast or accessibility issues found
          </span>
        ) : (
          <>
            {totals.critical > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                {totals.critical} critical
              </span>
            )}
            {totals.warning > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-700 dark:text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {totals.warning} warning{totals.warning === 1 ? "" : "s"}
              </span>
            )}
          </>
        )}
        <span className="text-[11px] font-normal text-foreground/50">
          {totals.checked} element{totals.checked === 1 ? "" : "s"} measured
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {reports.map((report) => {
          const ModeIcon = report.mode === "dark" ? Moon : Sun;
          return (
            <div key={`${report.device}-${report.mode}`}>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                <ModeIcon className="h-3 w-3" aria-hidden />
                {report.device} · {report.mode} mode
                <span className="font-normal tracking-normal normal-case text-foreground/40">
                  {report.issues.length === 0 ? "clean" : `${report.issues.length} issue(s)`}
                </span>
              </p>

              {report.issues.length > 0 && (
                <ul className="mt-1.5 space-y-1.5">
                  {report.issues.slice(0, 8).map((issue) => (
                    <li
                      key={issue.id}
                      className={cn(
                        "rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed",
                        issue.severity === "critical"
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-amber-500/40 bg-amber-500/5",
                      )}
                    >
                      <span className="font-semibold text-foreground">{issue.rule}</span>
                      <span className="text-foreground/70"> — {issue.message}</span>
                      {issue.context && (
                        <span className="mt-0.5 block truncate text-foreground/50">“{issue.context}”</span>
                      )}
                    </li>
                  ))}
                  {report.issues.length > 8 && (
                    <li className="px-1 text-[11px] text-foreground/50">
                      +{report.issues.length - 8} more…
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

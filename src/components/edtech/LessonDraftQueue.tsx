import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles, X } from "lucide-react";
import { getJobs, removeJob, subscribeJobs, type LessonDraftJob } from "@/lib/lessonDraftStore";

/**
 * Floating progress tray for queued AI lesson drafts. Only renders while there
 * is in-flight or freshly finished work, so it never adds chrome to the page.
 */
const LessonDraftQueue = () => {
  const [jobs, setJobs] = useState<LessonDraftJob[]>(() => getJobs());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => subscribeJobs(setJobs), []);

  const recent = jobs.filter((j) => {
    if (j.status === "queued" || j.status === "generating") return true;
    // Keep finished jobs visible briefly so the teacher sees the result land.
    return Boolean(j.completedAt && Date.now() - j.completedAt < 60_000);
  });

  if (recent.length === 0) return null;

  const active = recent.filter((j) => j.status === "queued" || j.status === "generating").length;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
        <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          {active > 0 ? `Drafting ${active} lesson${active > 1 ? "s" : ""}` : "Lesson drafts ready"}
        </p>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand draft queue" : "Collapse draft queue"}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <ul className="max-h-64 divide-y divide-border overflow-y-auto">
          {recent.map((job) => (
            <li key={job.id} className="flex items-start gap-2.5 px-3.5 py-2.5">
              <span className="mt-0.5 shrink-0">
                {job.status === "ready" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                ) : job.status === "failed" ? (
                  <X className="h-4 w-4 text-destructive" aria-hidden />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {job.draft?.lessonTitle || job.topic}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {job.courseTitle} · Lesson {job.lessonN}
                  {job.status === "failed" && job.error ? ` · ${job.error}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeJob(job.id)}
                aria-label="Dismiss"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default LessonDraftQueue;

import { useEffect, useState } from "react";
import { Bot, FileText, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { CourseLesson } from "@/data/edtechCourses";
import {
  findLatestDraft,
  startLessonDraftJob,
  subscribeJobs,
  type LessonDraftJob,
} from "@/lib/lessonDraftStore";

interface Props {
  courseSlug: string;
  courseTitle: string;
  courseCategory?: string;
  lesson: CourseLesson;
  /** Only teachers/admins may spend AI quota on regeneration. */
  canGenerate?: boolean;
}

/**
 * Lesson-level AI study summary. Shows the authored lesson body by default and
 * an AI-generated summary + narration script once one has been drafted for
 * this lesson in this browser.
 */
const LessonAiSummary = ({
  courseSlug,
  courseTitle,
  courseCategory,
  lesson,
  canGenerate = false,
}: Props) => {
  const [job, setJob] = useState<LessonDraftJob | undefined>(() =>
    findLatestDraft(courseSlug, lesson.n),
  );
  const [busy, setBusy] = useState(false);

  useEffect(
    () =>
      subscribeJobs((all) =>
        setJob(
          all.find(
            (j) => j.courseSlug === courseSlug && j.lessonN === lesson.n && j.status === "ready",
          ),
        ),
      ),
    [courseSlug, lesson.n],
  );

  const authored = lesson.content?.body?.join(" ") ?? "";
  const summary = job?.draft?.summary ?? authored;

  const regenerate = async () => {
    setBusy(true);
    const result = await startLessonDraftJob({
      courseSlug,
      courseTitle,
      courseCategory,
      lessonN: lesson.n,
      topic: lesson.title,
    });
    setBusy(false);
    if (result.status === "ready") toast.success("Lesson summary refreshed");
    else toast.error(result.error ?? "Could not refresh the summary");
  };

  if (!summary && !canGenerate) return null;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Lesson summary
              {job && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  AI draft
                </span>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Lesson {lesson.n} · {lesson.duration}
            </p>
          </div>
        </div>

        {canGenerate && (
          <button
            type="button"
            onClick={regenerate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Generating…
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />{" "}
                {job ? "Regenerate" : "Generate summary"}
              </>
            )}
          </button>
        )}
      </header>

      {summary ? (
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">{summary}</p>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          No summary yet for this lesson — generate one to give learners a quick recap.
        </p>
      )}

      {job?.draft?.keyTakeaways?.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {job.draft.keyTakeaways.map((t) => (
            <li key={t} className="flex gap-2 text-xs text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      ) : null}

      {job?.draft?.script && (
        <details className="mt-4 rounded-xl border border-border bg-background/60 p-4">
          <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="mr-1.5 inline h-3.5 w-3.5 text-primary" aria-hidden />
            Narration script
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
            {job.draft.script}
          </p>
        </details>
      )}
    </section>
  );
};

export default LessonAiSummary;

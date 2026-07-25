import { useEffect, useMemo, useState } from "react";
import { Bot, Copy, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import {
  clearFinishedJobs,
  removeJob,
  startLessonDraftJob,
  subscribeJobs,
  type LessonDraftJob,
} from "@/lib/lessonDraftStore";

/**
 * Teacher-facing AI lesson composer. Turns a course + topic into a recordable
 * draft (summary, narration script, takeaways, visual direction) using the
 * `edtech-ai-lesson` edge function. Drafts stay local until published.
 */
const AiLessonComposer = () => {
  const [courseSlug, setCourseSlug] = useState(EDTECH_COURSES[0]?.slug ?? "");
  const [lessonN, setLessonN] = useState("1");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<LessonDraftJob[]>([]);

  useEffect(() => subscribeJobs(setJobs), []);

  const course = useMemo(
    () => EDTECH_COURSES.find((c) => c.slug === courseSlug),
    [courseSlug],
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = topic.trim();
    if (trimmed.length < 6) {
      toast.error("Describe the lesson topic in a few more words.");
      return;
    }
    setBusy(true);
    const result = await startLessonDraftJob({
      courseSlug,
      courseTitle: course?.title ?? courseSlug,
      courseCategory: course?.category,
      lessonN: lessonN.trim() || "1",
      topic: trimmed,
      language,
    });
    setBusy(false);
    if (result.status === "ready") {
      toast.success("Lesson draft ready", { description: result.draft?.lessonTitle });
      setTopic("");
    } else {
      toast.error(result.error ?? "Draft generation failed");
    }
  };

  const copyScript = async (job: LessonDraftJob) => {
    if (!job.draft) return;
    try {
      await navigator.clipboard.writeText(job.draft.script);
      toast.success("Script copied");
    } catch {
      toast.error("Clipboard unavailable in this browser");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              AI lesson composer
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Generate a recordable lesson draft — summary, narration script, takeaways.
            </p>
          </div>
        </div>
        {jobs.some((j) => j.status !== "generating" && j.status !== "queued") && (
          <button
            type="button"
            onClick={clearFinishedJobs}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear history
          </button>
        )}
      </header>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[2fr_auto_auto]">
          <label className="block text-xs font-medium text-muted-foreground">
            Course
            <select
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              {EDTECH_COURSES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Lesson no.
            <input
              value={lessonN}
              onChange={(e) => setLessonN(e.target.value)}
              inputMode="numeric"
              className="mt-1.5 w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Language
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value === "bn" ? "bn" : "en")}
              className="mt-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </label>
        </div>

        <label className="block text-xs font-medium text-muted-foreground">
          Lesson topic
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder="e.g. Building a client outreach sequence that survives a low reply rate"
            className="mt-1.5 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Generating draft…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden /> Generate lesson draft
            </>
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {jobs.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            No drafts yet. Your generated lessons appear here and in the lesson player.
          </p>
        )}

        {jobs.map((job) => (
          <article key={job.id} className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {job.draft?.lessonTitle || job.topic}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {job.courseTitle} · Lesson {job.lessonN}
                  {job.draft?.estimatedDuration ? ` · ${job.draft.estimatedDuration}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {job.status === "ready" && (
                  <button
                    type="button"
                    onClick={() => copyScript(job)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy script
                  </button>
                )}
                {job.status === "failed" && (
                  <button
                    type="button"
                    onClick={() =>
                      startLessonDraftJob({
                        courseSlug: job.courseSlug,
                        courseTitle: job.courseTitle,
                        lessonN: job.lessonN,
                        topic: job.topic,
                        language: job.language,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeJob(job.id)}
                  aria-label="Remove draft"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>

            {(job.status === "queued" || job.status === "generating") && (
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Drafting with AI…
              </p>
            )}
            {job.status === "failed" && (
              <p className="mt-3 text-xs text-destructive">{job.error}</p>
            )}
            {job.status === "ready" && job.draft && (
              <div className="mt-3 space-y-3">
                <p className="text-xs leading-relaxed text-foreground/90">{job.draft.summary}</p>
                {job.draft.keyTakeaways.length > 0 && (
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {job.draft.keyTakeaways.map((t) => (
                      <li key={t} className="flex gap-2 text-[11px] text-muted-foreground">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <details className="rounded-lg border border-border bg-card p-3">
                  <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Narration script
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                    {job.draft.script}
                  </p>
                </details>
                {job.draft.visualPrompt && (
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Visual direction:</span>{" "}
                    {job.draft.visualPrompt}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default AiLessonComposer;

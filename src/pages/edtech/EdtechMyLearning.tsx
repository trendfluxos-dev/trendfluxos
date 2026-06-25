import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, RotateCcw, Search, X } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import { EDTECH_COURSES, getCourseBySlug } from "@/data/edtechCourses";
import {
  getEnrolledSlugs,
  getProgress,
  progressPercent,
  resetProgress,
  subscribeProgress,
  unenroll,
} from "@/lib/edtechProgress";

const EdtechMyLearning = () => {
  useSeo({
    title: "My Learning — কর্মশিক্ষা TED Plus",
    description: "Resume your enrolled কর্মশিক্ষা TED Plus courses and track lesson progress.",
    noindex: true,
  });

  const [, force] = useState(0);
  useEffect(() => subscribeProgress(() => force((n) => n + 1)), []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "in-progress" | "completed" | "not-started">("all");
  const [sort, setSort] = useState<"recent" | "title" | "progress">("recent");

  const enrolled = useMemo(() => {
    return getEnrolledSlugs()
      .map((slug) => getCourseBySlug(slug))
      .filter((c): c is NonNullable<ReturnType<typeof getCourseBySlug>> => Boolean(c));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = enrolled.filter((c) => {
      if (q) {
        const hay = `${c.title} ${c.tagline} ${c.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const p = getProgress(c.slug);
      const total = c.lessons.length;
      const done = p.completed.length;
      const pct = progressPercent(done, total);
      if (status === "completed" && pct !== 100) return false;
      if (status === "in-progress" && (pct === 0 || pct === 100)) return false;
      if (status === "not-started" && pct !== 0) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "progress") {
        const pa = progressPercent(getProgress(a.slug).completed.length, a.lessons.length);
        const pb = progressPercent(getProgress(b.slug).completed.length, b.lessons.length);
        return pb - pa;
      }
      // recent
      return (getProgress(b.slug).updatedAt ?? 0) - (getProgress(a.slug).updatedAt ?? 0);
    });
  }, [enrolled, query, status, sort]);

  const totalEnrolled = enrolled.length;
  const totalCompleted = enrolled.reduce((acc, c) => {
    const p = getProgress(c.slug);
    return acc + (p.completed.length === c.lessons.length && c.lessons.length > 0 ? 1 : 0);
  }, 0);

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background pt-14 pb-8">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            My Learning
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Continue where you left off
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
            Your enrolled courses, lesson progress and certificates — all in one
            place. Progress is saved locally to this device.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
            <Stat label="Enrolled" value={totalEnrolled} icon={<BookOpen className="h-4 w-4" aria-hidden />} />
            <Stat label="Completed" value={totalCompleted} icon={<CheckCircle2 className="h-4 w-4" aria-hidden />} />
          </div>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          {enrolled.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur-sm">
                <label className="relative flex min-w-[220px] flex-1 items-center">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/45" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search your courses…"
                    className="w-full rounded-xl border border-border/60 bg-background/60 py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 rounded-full p-1 text-foreground/45 hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                </label>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(["all", "in-progress", "completed", "not-started"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                        status === s
                          ? "border-primary/50 bg-primary/15 text-foreground"
                          : "border-border/60 bg-background/40 text-foreground/65 hover:bg-background/60 hover:text-foreground",
                      ].join(" ")}
                    >
                      {s === "all" ? "All" : s === "in-progress" ? "In progress" : s === "completed" ? "Completed" : "Not started"}
                    </button>
                  ))}
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  aria-label="Sort by"
                  className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-[12px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="recent">Recently active</option>
                  <option value="progress">Most progress</option>
                  <option value="title">Title (A–Z)</option>
                </select>
              </div>

              {visible.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-foreground/65">
                  No courses match your filters. Try clearing the search or switching status.
                </div>
              ) : (
                <ul className="grid gap-4">
                  {visible.map((course) => {
                const p = getProgress(course.slug);
                const total = course.lessons.length;
                const done = p.completed.length;
                const pct = progressPercent(done, total);
                const completed = pct === 100;
                const resumeN =
                  p.current ??
                  course.lessons.find((l) => !p.completed.includes(l.n))?.n ??
                  course.lessons[0]?.n;

                return (
                  <li
                    key={course.slug}
                    className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-foreground/50">
                          {course.category} · {course.level}
                        </p>
                        <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
                          <Link to={EDTECH.routes.course(course.slug)} className="hover:text-primary">
                            {course.title}
                          </Link>
                        </h2>
                        <p className="mt-1 text-[13px] text-foreground/65">{course.tagline}</p>
                      </div>
                      {completed ? (
                        <Link
                          to={EDTECH.routes.certificateFor(course.slug)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-[12px] font-semibold text-emerald-300 hover:bg-emerald-500/25"
                        >
                          <GraduationCap className="h-4 w-4" aria-hidden /> Get certificate
                        </Link>
                      ) : (
                        resumeN && (
                          <Link
                            to={EDTECH.routes.learnLesson(course.slug, resumeN)}
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
                          >
                            {done > 0 ? "Resume" : "Start"} · Lesson {resumeN}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        )
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[11px] text-foreground/55">
                        <span>
                          {done} of {total} lessons
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/60">
                        <div
                          className={`h-full rounded-full ${completed ? "bg-emerald-400" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Reset progress for this course?")) {
                            resetProgress(course.slug);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-foreground/65 hover:bg-background/70 hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden /> Reset progress
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Remove this course from My Learning?")) {
                            unenroll(course.slug);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-foreground/65 hover:bg-background/70 hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </EdtechShell>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-3">
    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
      {icon} {label}
    </p>
    <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
  </div>
);

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-border/70 bg-card/30 p-10 text-center">
    <BookOpen className="mx-auto h-10 w-10 text-foreground/40" aria-hidden />
    <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
      You haven't enrolled yet
    </h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-foreground/65">
      Browse the catalogue and enrol in a cohort to start learning.
      Your progress will appear here.
    </p>
    <Link
      to={EDTECH.routes.courses}
      className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
    >
      Browse {EDTECH_COURSES.length} courses <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  </div>
);

export default EdtechMyLearning;
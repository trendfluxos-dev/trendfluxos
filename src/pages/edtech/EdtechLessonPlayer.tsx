import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH } from "@/config/edtech";
import { getCourseBySlug } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import {
  enroll,
  getProgress,
  isEnrolled,
  markLessonComplete,
  markLessonIncomplete,
  progressPercent,
  setCurrentLesson,
  subscribeProgress,
} from "@/lib/edtechProgress";

const EdtechLessonPlayer = () => {
  const { slug, lessonN } = useParams<{ slug: string; lessonN?: string }>();
  const navigate = useNavigate();
  const course = slug ? getCourseBySlug(slug) : undefined;

  useSeo({
    title: course ? `Learn · ${course.title} — KormoShikkha` : "Learn — KormoShikkha",
    description: course?.summary ?? "Lesson player.",
    noindex: true,
  });

  // Auto-enrol when a learner deep-links into the player.
  useEffect(() => {
    if (slug && !isEnrolled(slug)) enroll(slug);
  }, [slug]);

  const [, force] = useState(0);
  useEffect(() => subscribeProgress(() => force((n) => n + 1)), []);

  const activeN = useMemo(() => {
    if (!course) return undefined;
    if (lessonN && course.lessons.some((l) => l.n === lessonN)) return lessonN;
    const p = getProgress(course.slug);
    return (
      p.current ??
      course.lessons.find((l) => !p.completed.includes(l.n))?.n ??
      course.lessons[0]?.n
    );
  }, [course, lessonN]);

  useEffect(() => {
    if (course && activeN) setCurrentLesson(course.slug, activeN);
  }, [course, activeN]);

  if (!course) return <Navigate to={EDTECH.routes.courses} replace />;
  if (!activeN) return <Navigate to={EDTECH.routes.course(course.slug)} replace />;

  const progress = getProgress(course.slug);
  const idx = course.lessons.findIndex((l) => l.n === activeN);
  const lesson = course.lessons[idx];
  const total = course.lessons.length;
  const done = progress.completed.length;
  const pct = progressPercent(done, total);
  const isDone = progress.completed.includes(activeN);
  const prev = idx > 0 ? course.lessons[idx - 1] : undefined;
  const next = idx < total - 1 ? course.lessons[idx + 1] : undefined;
  const allComplete = done === total;

  const toggleComplete = () => {
    if (isDone) markLessonIncomplete(course.slug, activeN);
    else markLessonComplete(course.slug, activeN);
  };

  const completeAndContinue = () => {
    if (!isDone) markLessonComplete(course.slug, activeN);
    if (next) navigate(EDTECH.routes.learnLesson(course.slug, next.n));
  };

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <nav className="text-[12px] text-foreground/55">
            <Link to={EDTECH.routes.myLearning} className="hover:text-foreground">My Learning</Link>{" / "}
            <Link to={EDTECH.routes.course(course.slug)} className="hover:text-foreground">{course.title}</Link>{" / "}
            <span className="text-foreground/75">Lesson {activeN}</span>
          </nav>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[280px_1fr] lg:px-10">
          {/* Sidebar curriculum */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">
                Curriculum
              </p>
              <p className="mt-1 text-[12px] text-foreground/70">
                {done} / {total} · {pct}%
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-border/60">
                <div
                  className={`h-full rounded-full ${allComplete ? "bg-emerald-400" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <ol className="mt-4 space-y-1">
                {course.lessons.map((l) => {
                  const completed = progress.completed.includes(l.n);
                  const active = l.n === activeN;
                  return (
                    <li key={l.n}>
                      <Link
                        to={EDTECH.routes.learnLesson(course.slug, l.n)}
                        className={[
                          "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                          active
                            ? "bg-primary/10 text-foreground"
                            : "text-foreground/70 hover:bg-accent",
                        ].join(" ")}
                      >
                        {completed ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-foreground/35" aria-hidden />
                        )}
                        <span className="min-w-0">
                          <span className="block font-mono text-[10px] text-foreground/45">{l.n}</span>
                          <span className="block truncate font-medium">{l.title}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>

              {allComplete && (
                <Link
                  to={EDTECH.routes.certificateFor(course.slug)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500/15 px-3 py-2 text-[12px] font-semibold text-emerald-300 hover:bg-emerald-500/25"
                >
                  <GraduationCap className="h-4 w-4" aria-hidden /> Get certificate
                </Link>
              )}
            </div>
          </aside>

          {/* Main lesson */}
          <article className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              Lesson {lesson.n} of {total}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[12px] text-foreground/65">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {lesson.duration}
            </p>

            {/* Lesson canvas — placeholder content area until video/notes wiring lands */}
            <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/60 via-card/30 to-card/10">
              <div className="aspect-video w-full grid place-items-center bg-background/40">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Cohort video & notes unlock 24h before each session
                  </p>
                  <p className="mt-1 text-[12px] text-foreground/55">
                    Recordings, slides and worksheets appear here once the
                    instructor publishes them.
                  </p>
                </div>
              </div>
              <div className="space-y-3 p-6 text-[15px] leading-[1.75] text-foreground/85">
                <p>
                  <strong className="font-semibold text-foreground">What you'll learn:</strong>{" "}
                  {course.outcomes[idx % course.outcomes.length]}
                </p>
                <p className="text-foreground/70">
                  Work through the prep, attend the live session, then mark this
                  lesson complete to keep your streak and unlock the next module.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-3">
              <button
                type="button"
                onClick={toggleComplete}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
                  isDone
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                    : "border border-border/60 bg-background/60 text-foreground/75 hover:bg-background/80",
                ].join(" ")}
              >
                {isDone ? (
                  <><CheckCircle2 className="h-4 w-4" aria-hidden /> Completed</>
                ) : (
                  <><Circle className="h-4 w-4" aria-hidden /> Mark complete</>
                )}
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to={prev ? EDTECH.routes.learnLesson(course.slug, prev.n) : EDTECH.routes.course(course.slug)}
                  aria-disabled={!prev}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-[13px] font-medium transition-colors",
                    prev
                      ? "bg-background/60 text-foreground/80 hover:bg-background/80"
                      : "pointer-events-none opacity-40",
                  ].join(" ")}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
                </Link>
                {next ? (
                  <button
                    type="button"
                    onClick={completeAndContinue}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {isDone ? "Next lesson" : "Complete & continue"}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDone) markLessonComplete(course.slug, activeN);
                      navigate(EDTECH.routes.certificateFor(course.slug));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-500/90"
                  >
                    Finish & claim certificate <GraduationCap className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechLessonPlayer;
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Circle, FileText, PlayCircle, Sparkles } from "lucide-react";
import type { CourseLesson } from "@/data/edtechCourses";
import {
  getLessonState,
  setLessonState,
  subscribeProgress,
} from "@/lib/edtechProgress";
import { useSignedUrl } from "@/lib/signedUrl";

/**
 * Renders any lesson content type. Calls `onAutoComplete` exactly once when
 * the type's success criteria are met so the player can mark the lesson done.
 */
interface Props {
  slug: string;
  lesson: CourseLesson;
  isDone: boolean;
  onAutoComplete: () => void;
}

const LessonContent = ({ slug, lesson, isDone, onAutoComplete }: Props) => {
  const content = lesson.content;
  if (!content) return <FallbackReading lesson={lesson} />;

  switch (content.type) {
    case "video":
      return (
        <MediaPlayer
          slug={slug}
          n={lesson.n}
          kind="video"
          src={content.src ?? ""}
          poster={content.poster}
          isDone={isDone}
          onAutoComplete={onAutoComplete}
        />
      );
    case "audio":
      return (
        <MediaPlayer
          slug={slug}
          n={lesson.n}
          kind="audio"
          src={content.src ?? ""}
          isDone={isDone}
          onAutoComplete={onAutoComplete}
        />
      );
    case "checklist":
      return (
        <Checklist
          slug={slug}
          n={lesson.n}
          items={content.items ?? []}
          isDone={isDone}
          onAutoComplete={onAutoComplete}
        />
      );
    case "quiz":
      return (
        <Quiz
          slug={slug}
          n={lesson.n}
          questions={content.questions ?? []}
          passScore={content.passScore ?? content.questions?.length ?? 0}
          isDone={isDone}
          onAutoComplete={onAutoComplete}
        />
      );
    case "reading":
      return <Reading body={content.body ?? []} />;
    case "pdf":
      return (
        <SignedPdf
          bucket={content.bucket ?? "lesson-pdfs"}
          path={content.path ?? ""}
          title={lesson.title}
          isDone={isDone}
          onAutoComplete={onAutoComplete}
        />
      );
    default:
      return <FallbackReading lesson={lesson} />;
  }
};

const FallbackReading = ({ lesson }: { lesson: CourseLesson }) => (
  <div className="aspect-video w-full grid place-items-center bg-background/40">
    <div className="px-6 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden />
      <p className="mt-3 text-sm font-medium text-foreground">
        {lesson.title}
      </p>
      <p className="mt-1 text-[12px] text-foreground/55">
        Recordings, slides and worksheets appear here once published.
      </p>
    </div>
  </div>
);

const Reading = ({ body }: { body: string[] }) => (
  <div className="space-y-3 px-6 py-8 text-[15px] leading-[1.75] text-foreground/85">
    {body.map((p, i) => (
      <p key={i} className={i === 0 ? "text-foreground" : "text-foreground/75"}>
        {p}
      </p>
    ))}
  </div>
);

const MediaPlayer = ({
  slug,
  n,
  kind,
  src,
  poster,
  isDone,
  onAutoComplete,
}: {
  slug: string;
  n: string;
  kind: "video" | "audio";
  src: string;
  poster?: string;
  isDone: boolean;
  onAutoComplete: () => void;
}) => {
  const ref = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [pct, setPct] = useState<number>(() => getLessonState(slug, n).mediaProgress ?? 0);
  const firedRef = useRef(isDone);

  useEffect(() => {
    firedRef.current = isDone;
  }, [isDone]);

  const onTime = () => {
    const el = ref.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;
    const next = Math.round((el.currentTime / el.duration) * 100);
    if (Math.abs(next - pct) >= 2) setPct(next);
    if (next >= 90 && !firedRef.current) {
      firedRef.current = true;
      onAutoComplete();
    }
  };

  const onPause = () => {
    const el = ref.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;
    setLessonState(slug, n, {
      ...getLessonState(slug, n),
      mediaProgress: Math.round((el.currentTime / el.duration) * 100),
    });
  };

  return (
    <div className="w-full bg-black/40">
      {kind === "video" ? (
        <video
          ref={ref as React.RefObject<HTMLVideoElement>}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={onTime}
          onPause={onPause}
          onEnded={() => {
            if (!firedRef.current) {
              firedRef.current = true;
              onAutoComplete();
            }
          }}
          className="block aspect-video w-full"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 px-6 py-10">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
            <PlayCircle className="h-7 w-7" aria-hidden />
          </div>
          <audio
            ref={ref as React.RefObject<HTMLAudioElement>}
            src={src}
            controls
            preload="metadata"
            onTimeUpdate={onTime}
            onPause={onPause}
            onEnded={() => {
              if (!firedRef.current) {
                firedRef.current = true;
                onAutoComplete();
              }
            }}
            className="w-full max-w-md"
          />
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-foreground/55">
        <span>Listened / watched</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 bg-border/40">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Checklist = ({
  slug,
  n,
  items,
  isDone,
  onAutoComplete,
}: {
  slug: string;
  n: string;
  items: string[];
  isDone: boolean;
  onAutoComplete: () => void;
}) => {
  const [ticked, setTicked] = useState<string[]>(() => getLessonState(slug, n).checklist ?? []);
  useEffect(() => subscribeProgress(() => setTicked(getLessonState(slug, n).checklist ?? [])), [slug, n]);

  const toggle = (item: string) => {
    const next = ticked.includes(item) ? ticked.filter((i) => i !== item) : [...ticked, item];
    setTicked(next);
    setLessonState(slug, n, { ...getLessonState(slug, n), checklist: next });
    if (next.length === items.length && !isDone) onAutoComplete();
  };

  return (
    <div className="px-6 py-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/55">
        Checklist — complete all to finish this lesson
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const on = ticked.includes(item);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(item)}
                className={[
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-[14px] transition-colors",
                  on
                    ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                    : "border-border/60 bg-background/40 text-foreground/80 hover:bg-background/60",
                ].join(" ")}
              >
                {on ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" aria-hidden />
                )}
                <span>{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] text-foreground/50">
        {ticked.length} / {items.length} done
      </p>
    </div>
  );
};

const Quiz = ({
  slug,
  n,
  questions,
  passScore,
  isDone,
  onAutoComplete,
}: {
  slug: string;
  n: string;
  questions: { q: string; options: string[]; answer: number; explain?: string }[];
  passScore: number;
  isDone: boolean;
  onAutoComplete: () => void;
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>(
    () => getLessonState(slug, n).quizAnswers ?? {},
  );
  const [submitted, setSubmitted] = useState(false);

  const pick = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    const next = { ...answers, [qIdx]: optIdx };
    setAnswers(next);
    setLessonState(slug, n, { ...getLessonState(slug, n), quizAnswers: next });
  };

  const score = questions.reduce(
    (acc, q, i) => (answers[i] === q.answer ? acc + 1 : acc),
    0,
  );
  const passed = score >= passScore;

  const submit = () => {
    setSubmitted(true);
    if (score >= passScore && !isDone) onAutoComplete();
  };

  const reset = () => {
    setSubmitted(false);
    setAnswers({});
    setLessonState(slug, n, { ...getLessonState(slug, n), quizAnswers: {} });
  };

  return (
    <div className="px-6 py-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/55">
        Quick check — pass {passScore} of {questions.length} to complete
      </p>
      <ol className="mt-5 space-y-6">
        {questions.map((q, qi) => (
          <li key={qi}>
            <p className="text-[14px] font-medium text-foreground">
              {qi + 1}. {q.q}
            </p>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, oi) => {
                const picked = answers[qi] === oi;
                const correct = submitted && oi === q.answer;
                const wrong = submitted && picked && oi !== q.answer;
                return (
                  <button
                    type="button"
                    key={oi}
                    onClick={() => pick(qi, oi)}
                    className={[
                      "rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                      correct
                        ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                        : wrong
                          ? "border-rose-500/50 bg-rose-500/10 text-foreground"
                          : picked
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border/60 bg-background/40 text-foreground/75 hover:bg-background/60",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explain && (
              <p className="mt-2 text-[12px] text-foreground/60">{q.explain}</p>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={Object.keys(answers).length < questions.length}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Submit answers
          </button>
        ) : (
          <>
            <span
              className={[
                "rounded-full px-3 py-1 text-[12px] font-semibold",
                passed
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-rose-500/15 text-rose-300",
              ].join(" ")}
            >
              {passed ? "Passed" : "Try again"} · {score} / {questions.length}
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[12px] text-foreground/70 hover:bg-background/60"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonContent;
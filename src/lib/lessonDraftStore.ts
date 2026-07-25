import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side queue for AI lesson drafting.
 *
 * A "draft job" wraps one call to the `edtech-ai-lesson` edge function so the
 * teacher can queue several lessons and keep navigating while they generate.
 * Results persist in localStorage (per browser) — they are drafts, not
 * published course content, so they intentionally never touch the database
 * until a teacher publishes the lesson.
 */

export type LessonDraftStatus = "queued" | "generating" | "ready" | "failed";

export interface LessonDraft {
  lessonTitle: string;
  summary: string;
  script: string;
  keyTakeaways: string[];
  estimatedDuration: string;
  visualPrompt: string;
}

export interface LessonDraftJob {
  id: string;
  courseSlug: string;
  courseTitle: string;
  lessonN: string;
  topic: string;
  language: "en" | "bn";
  status: LessonDraftStatus;
  createdAt: number;
  completedAt?: number;
  error?: string;
  draft?: LessonDraft;
}

const STORAGE_KEY = "trendflux.lessonDrafts.v1";
const MAX_JOBS = 40;

type Listener = (jobs: LessonDraftJob[]) => void;

let jobs: LessonDraftJob[] = [];
let hydrated = false;
const listeners = new Set<Listener>();

const hydrate = (): void => {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      jobs = (parsed as LessonDraftJob[])
        // A job left mid-flight by a reload can never resume — mark it failed.
        .map((j) =>
          j.status === "generating" || j.status === "queued"
            ? { ...j, status: "failed" as const, error: "Interrupted — run again" }
            : j,
        )
        .slice(0, MAX_JOBS);
    }
  } catch {
    jobs = [];
  }
};

const persist = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.slice(0, MAX_JOBS)));
  } catch {
    /* quota or private mode — drafts stay in memory for this session */
  }
};

const emit = (): void => {
  persist();
  const snapshot = getJobs();
  listeners.forEach((fn) => fn(snapshot));
};

const patch = (id: string, next: Partial<LessonDraftJob>): void => {
  jobs = jobs.map((j) => (j.id === id ? { ...j, ...next } : j));
  emit();
};

export const getJobs = (): LessonDraftJob[] => {
  hydrate();
  return [...jobs].sort((a, b) => b.createdAt - a.createdAt);
};

export const subscribeJobs = (listener: Listener): (() => void) => {
  hydrate();
  listeners.add(listener);
  listener(getJobs());
  return () => listeners.delete(listener);
};

export const removeJob = (id: string): void => {
  hydrate();
  jobs = jobs.filter((j) => j.id !== id);
  emit();
};

export const clearFinishedJobs = (): void => {
  hydrate();
  jobs = jobs.filter((j) => j.status === "queued" || j.status === "generating");
  emit();
};

const friendlyError = (raw: string): string => {
  if (raw.includes("rate_limited")) return "AI rate limit reached — try again in a minute.";
  if (raw.includes("credits_required")) return "AI credits exhausted for this workspace.";
  if (raw.includes("forbidden")) return "Your account is not allowed to generate lessons.";
  if (raw.includes("unauthorized")) return "Sign in again to generate lessons.";
  if (raw.includes("ai_invalid_response")) return "The model returned an unusable draft — retry.";
  return "Draft generation failed — please retry.";
};

export interface StartDraftInput {
  courseSlug: string;
  courseTitle: string;
  lessonN: string;
  topic: string;
  courseCategory?: string;
  language?: "en" | "bn";
}

/**
 * Queue a draft and run it. Resolves with the finished job (ready or failed)
 * so callers can react inline; subscribers get every intermediate update.
 */
export const startLessonDraftJob = async (input: StartDraftInput): Promise<LessonDraftJob> => {
  hydrate();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const job: LessonDraftJob = {
    id,
    courseSlug: input.courseSlug,
    courseTitle: input.courseTitle,
    lessonN: input.lessonN,
    topic: input.topic,
    language: input.language ?? "en",
    status: "queued",
    createdAt: Date.now(),
  };
  jobs = [job, ...jobs].slice(0, MAX_JOBS);
  emit();

  patch(id, { status: "generating" });

  const { data, error } = await supabase.functions.invoke<LessonDraft>("edtech-ai-lesson", {
    body: {
      topic: input.topic,
      courseTitle: input.courseTitle,
      courseCategory: input.courseCategory,
      lessonNumber: input.lessonN,
      language: input.language ?? "en",
    },
  });

  if (error || !data?.script) {
    const message = friendlyError(error?.message ?? "");
    patch(id, { status: "failed", error: message, completedAt: Date.now() });
    return getJobs().find((j) => j.id === id)!;
  }

  patch(id, { status: "ready", draft: data, completedAt: Date.now() });
  return getJobs().find((j) => j.id === id)!;
};

/** Most recent ready draft for a given course lesson, if any. */
export const findLatestDraft = (
  courseSlug: string,
  lessonN: string,
): LessonDraftJob | undefined =>
  getJobs().find((j) => j.courseSlug === courseSlug && j.lessonN === lessonN && j.status === "ready");

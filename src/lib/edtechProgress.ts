/**
 * KormoShikkha — client-side enrolment + lesson progress.
 *
 * Phase 1 stores per-course progress in localStorage so students get an
 * instant, login-free "My Learning" surface. Phase 2 will mirror this to
 * Lovable Cloud (`module_enrollments`) once the authenticated student
 * surface lands; the same shape is used so the migration is a swap.
 */

const ENROLL_KEY = "kormoshikkha:enrolled:v1";
const PROGRESS_KEY = "kormoshikkha:progress:v1";

export interface CourseProgress {
  /** Lesson `n` strings that have been marked complete (e.g. "01"). */
  completed: string[];
  /** Lesson `n` last opened — used to resume. */
  current?: string;
  updatedAt: number;
}

type ProgressMap = Record<string, CourseProgress>;

const isBrowser = () => typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("kormoshikkha:change"));
  } catch {
    /* quota or private-mode — silently ignore */
  }
};

export const getEnrolledSlugs = (): string[] =>
  readJson<string[]>(ENROLL_KEY, []);

export const isEnrolled = (slug: string) => getEnrolledSlugs().includes(slug);

export const enroll = (slug: string) => {
  const current = getEnrolledSlugs();
  if (current.includes(slug)) return;
  writeJson(ENROLL_KEY, [...current, slug]);
};

export const unenroll = (slug: string) => {
  writeJson(ENROLL_KEY, getEnrolledSlugs().filter((s) => s !== slug));
};

export const getAllProgress = (): ProgressMap =>
  readJson<ProgressMap>(PROGRESS_KEY, {});

export const getProgress = (slug: string): CourseProgress =>
  getAllProgress()[slug] ?? { completed: [], updatedAt: 0 };

const writeProgress = (slug: string, next: CourseProgress) => {
  const all = getAllProgress();
  all[slug] = next;
  writeJson(PROGRESS_KEY, all);
};

export const markLessonComplete = (slug: string, n: string) => {
  const p = getProgress(slug);
  if (p.completed.includes(n)) return;
  writeProgress(slug, {
    completed: [...p.completed, n],
    current: n,
    updatedAt: Date.now(),
  });
};

export const markLessonIncomplete = (slug: string, n: string) => {
  const p = getProgress(slug);
  writeProgress(slug, {
    completed: p.completed.filter((x) => x !== n),
    current: p.current,
    updatedAt: Date.now(),
  });
};

export const setCurrentLesson = (slug: string, n: string) => {
  const p = getProgress(slug);
  if (p.current === n) return;
  writeProgress(slug, { ...p, current: n, updatedAt: Date.now() });
};

export const resetProgress = (slug: string) => {
  const all = getAllProgress();
  delete all[slug];
  writeJson(PROGRESS_KEY, all);
};

export const progressPercent = (completed: number, total: number) =>
  total === 0 ? 0 : Math.round((completed / total) * 100);

/** Subscribe to enrolment / progress changes (same-tab + cross-tab). */
export const subscribeProgress = (cb: () => void) => {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener("kormoshikkha:change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("kormoshikkha:change", handler);
    window.removeEventListener("storage", handler);
  };
};
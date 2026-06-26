/**
 * Tiny localStorage helper for tracking teacher-onboarding milestones.
 * Used by the Studio top-bar (Copy link, Schedule, Send to live, etc.) so
 * the OnboardingChecklist can tick steps automatically.
 */
const FLAG_KEY = "edtech_studio_onboarding_v1";

export type OnboardingFlag =
  | "linkCopied"
  | "scheduled"
  | "start"
  | "calendarConnected"
  | "driveConnected";

export type OnboardingFlags = Partial<Record<OnboardingFlag, boolean>>;

export function getOnboardingFlags(): OnboardingFlags {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(FLAG_KEY) ?? "{}") as OnboardingFlags;
  } catch {
    return {};
  }
}

export function markOnboarding(key: OnboardingFlag) {
  if (typeof window === "undefined") return;
  const flags = getOnboardingFlags();
  flags[key] = true;
  window.localStorage.setItem(FLAG_KEY, JSON.stringify(flags));
  window.dispatchEvent(new Event("edtech-onboarding-update"));
}
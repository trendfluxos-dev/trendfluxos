import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Circle, X, Sparkles, ChevronRight } from "lucide-react";

import { EDTECH } from "@/config/edtech";
import {
  getOnboardingFlags,
  markOnboarding,
  type OnboardingFlags,
} from "@/lib/studioOnboarding";

const DISMISS_KEY = "edtech_studio_onboarding_dismissed_v1";

type Step = {
  id: string;
  title: string;
  hint: string;
  done: boolean;
  action?: { label: string; to?: string; onClick?: () => void };
};

type Props = {
  classCount: number;
  firstClassId?: string | null;
  hasLiveActivity?: boolean;
};

/**
 * Collapsible onboarding card for teachers. Tracks 5 milestones in
 * localStorage via {@link markOnboarding} — invisible once all done or
 * the user dismisses it.
 */
export function StudioOnboardingChecklist({ classCount, firstClassId, hasLiveActivity }: Props) {
  const [flags, setFlags] = useState<OnboardingFlags>(() => getOnboardingFlags());
  const [dismissed, setDismissed] = useState<boolean>(
    () => typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY) === "1",
  );

  useEffect(() => {
    const onUpdate = () => setFlags(getOnboardingFlags());
    window.addEventListener("edtech-onboarding-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("edtech-onboarding-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const studioHref = firstClassId
    ? EDTECH.routes.adminLiveStudio(firstClassId)
    : EDTECH.routes.teachClasses;

  const steps: Step[] = [
    {
      id: "class",
      title: "প্রথম ক্লাস তৈরি করুন",
      hint: "উপরের 'New class' বাটনে ক্লিক করুন।",
      done: classCount > 0,
    },
    {
      id: "material",
      title: "একটি Material যোগ করুন",
      hint: "Studio-র Library থেকে PDF / slide / video যোগ করুন।",
      done: classCount > 0 && !!firstClassId,
      action: firstClassId ? { label: "Studio এ যান", to: studioHref } : undefined,
    },
    {
      id: "link",
      title: "Student link কপি করুন",
      hint: "Studio header থেকে 'Copy link' বাটন ব্যবহার করুন।",
      done: !!flags.linkCopied,
      action: firstClassId ? { label: "Studio এ যান", to: studioHref } : undefined,
    },
    {
      id: "schedule",
      title: "Calendar-এ Schedule করুন (optional)",
      hint: "সময়মতো reminder পেতে Schedule করুন।",
      done: !!flags.scheduled,
      action: {
        label: "করা হয়েছে — চিহ্নিত করুন",
        onClick: () => markOnboarding("scheduled"),
      },
    },
    {
      id: "start",
      title: "একটি ক্লাস Send to Live করুন",
      hint: "Studio-র 'Send to Live' চাপলে students দেখতে পাবে।",
      done: !!flags.start || !!hasLiveActivity,
      action: firstClassId ? { label: "Studio এ যান", to: studioHref } : undefined,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);
  const allDone = completed === steps.length;

  if (dismissed || allDone) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Teacher onboarding</h2>
            <p className="text-xs text-muted-foreground">
              {completed} / {steps.length} ধাপ সম্পন্ন — সবকিছু সেট করে নিন
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss onboarding"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className="divide-y divide-border/60 p-2">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 rounded-md px-3 py-2.5">
            <div
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                s.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {s.done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-medium ${s.done ? "text-muted-foreground line-through" : ""}`}>
                {i + 1}. {s.title}
              </div>
              <div className="text-xs text-muted-foreground">{s.hint}</div>
            </div>
            {!s.done && s.action && (
              s.action.to ? (
                <Link
                  to={s.action.to}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent"
                >
                  {s.action.label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={s.action.onClick}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent"
                >
                  {s.action.label}
                </button>
              )
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
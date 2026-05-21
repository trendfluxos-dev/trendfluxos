import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ExternalLink, RotateCcw, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIVE_URL = "https://trendflux.digital";
const STORAGE_KEY = "tf_deploy_checklist_v1";

type CheckId = "hero" | "ctas" | "sticky_filter" | "case_cards";

type CheckItem = {
  id: CheckId;
  label: string;
  hint: string;
  path: string; // path to open on live site for verification
};

const ITEMS: CheckItem[] = [
  {
    id: "hero",
    label: "Hero renders",
    hint: "Headline, subhead, gold 'The Stand' anchor card all visible.",
    path: "/",
  },
  {
    id: "ctas",
    label: "CTA buttons work",
    hint: "Explore Growth Systems, Book Consultation, Enterprise Portal — all clickable.",
    path: "/#story",
  },
  {
    id: "sticky_filter",
    label: "Sticky filter bar",
    hint: "Portfolio FilterBar stays pinned while scrolling case studies.",
    path: "/portfolio",
  },
  {
    id: "case_cards",
    label: "Case cards render",
    hint: "All case study cards display with images, titles, and hover state.",
    path: "/portfolio",
  },
];

type State = Record<CheckId, number | null>; // timestamp verified, or null

const emptyState = (): State => ({
  hero: null,
  ctas: null,
  sticky_filter: null,
  case_cards: null,
});

const loadState = (): State => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
};

export function DeploymentChecklist() {
  const [state, setState] = useState<State>(emptyState);
  const [reachable, setReachable] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => setState(loadState()), []);

  useEffect(() => {
    let cancelled = false;
    setReachable("checking");
    fetch(LIVE_URL, { method: "HEAD", mode: "no-cors", cache: "no-store" })
      .then(() => !cancelled && setReachable("ok"))
      .catch(() => !cancelled && setReachable("fail"));
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (next: State) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = (id: CheckId) => {
    persist({ ...state, [id]: state[id] ? null : Date.now() });
  };

  const reset = () => persist(emptyState());

  const verifiedCount = Object.values(state).filter(Boolean).length;
  const total = ITEMS.length;
  const allDone = verifiedCount === total;

  return (
    <section className="mt-8 rounded-2xl glass overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <Rocket className="h-4 w-4 text-gold" />
          <div>
            <h2 className="font-display text-lg font-semibold">Post-deployment checklist</h2>
            <p className="text-xs text-foreground/55">
              Verify production after clicking <span className="text-gold">Update</span> in the Publish dialog.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${
              reachable === "ok"
                ? "border-gold/40 bg-gold/10 text-gold"
                : reachable === "fail"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border/60 text-foreground/60"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                reachable === "ok"
                  ? "bg-gold animate-pulse"
                  : reachable === "fail"
                    ? "bg-destructive"
                    : "bg-foreground/40"
              }`}
            />
            {reachable === "ok"
              ? "Live reachable"
              : reachable === "fail"
                ? "Unreachable"
                : "Checking…"}
          </span>
          <span className="text-xs tabular-nums text-foreground/60">
            {verifiedCount}/{total}
          </span>
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <ul className="divide-y divide-border/30">
        {ITEMS.map((item) => {
          const verifiedAt = state[item.id];
          const done = Boolean(verifiedAt);
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-4 px-5 py-4 sm:flex-nowrap"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={done}
                aria-label={`Mark ${item.label} ${done ? "unverified" : "verified"}`}
                className="mt-0.5 shrink-0 transition-transform hover:scale-110"
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                ) : (
                  <Circle className="h-5 w-5 text-foreground/30" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${done ? "text-foreground/60 line-through" : ""}`}>
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-foreground/55">{item.hint}</p>
                {verifiedAt && (
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-gold/70">
                    Verified {new Date(verifiedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <a
                href={`${LIVE_URL}${item.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-foreground/70 hover:border-gold/40 hover:text-gold"
              >
                Open live <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <div className="border-t border-gold/30 bg-gold/[0.05] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          ✓ Deployment verified
        </div>
      )}
    </section>
  );
}

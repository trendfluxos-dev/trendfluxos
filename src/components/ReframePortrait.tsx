import { useEffect, useState } from "react";
import { Crop, RotateCcw, X } from "lucide-react";
import {
  usePortraitFocus,
  getActiveBreakpoint,
  type Breakpoint,
} from "@/hooks/usePortraitFocus";

const LABELS: Record<Breakpoint, string> = {
  base: "Mobile",
  sm: "Tablet (sm+)",
  lg: "Desktop (lg+)",
};

/**
 * Floating control to reframe the Brand Architect portrait per breakpoint.
 * Only renders when `?reframe=1` is present in the URL.
 * Values persist to localStorage via usePortraitFocus.
 */
const ReframePortrait = () => {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [activeBp, setActiveBp] = useState<Breakpoint>("base");
  const { values, set, reset } = usePortraitFocus();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("reframe") === "1");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const update = () => setActiveBp(getActiveBreakpoint());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [enabled]);

  if (!enabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:opacity-90"
        aria-label="Open reframe portrait control"
      >
        <Crop className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-24 right-5 z-[60] w-72 rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur"
      role="dialog"
      aria-label="Reframe portrait"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop className="h-4 w-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Reframe portrait
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-foreground/60 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-[11px] text-foreground/60">
        Active breakpoint:{" "}
        <span className="font-semibold text-foreground">
          {LABELS[activeBp]}
        </span>
      </p>

      <div className="space-y-3">
        {(["base", "sm", "lg"] as Breakpoint[]).map((bp) => (
          <label key={bp} className="block">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span
                className={
                  bp === activeBp
                    ? "font-semibold text-foreground"
                    : "text-foreground/60"
                }
              >
                {LABELS[bp]}
              </span>
              <span className="tabular-nums text-foreground/70">
                {values[bp]}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={values[bp]}
              onChange={(e) => set(bp, Number(e.target.value))}
              className="w-full accent-[hsl(var(--gold,45_90%_55%))]"
              aria-label={`${LABELS[bp]} focus`}
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-foreground/70 hover:text-foreground"
      >
        <RotateCcw className="h-3 w-3" />
        Reset to defaults
      </button>
    </div>
  );
};

export default ReframePortrait;

import { Headphones, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useSeo } from "@/hooks/useSeo";
import {
  useAutoplayPreview,
  useReducedMotionOverride,
  useSystemReducedMotion,
} from "@/lib/audioPreferences";
import { track } from "@/lib/analytics";

function Row({
  id,
  title,
  description,
  checked,
  onChange,
  hint,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-5 last:border-b-0">
      <div className="min-w-0">
        <label htmlFor={id} className="block font-display text-base font-medium text-foreground">
          {title}
        </label>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {hint ? (
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">{hint}</p>
        ) : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

export default function Settings() {
  useSeo({
    title: "Site Settings — Audio & Accessibility",
    description:
      "Manage Chapter I audio autoplay and reduced-motion accessibility preferences in one place.",
    canonical: "/settings",
    robots: "noindex,follow",
  });

  const [autoplayPreview, setAutoplayPreview] = useAutoplayPreview();
  const [reducedMotionOverride, setReducedMotionOverride] = useReducedMotionOverride();
  const systemReducedMotion = useSystemReducedMotion();

  const onAutoplayChange = (next: boolean) => {
    setAutoplayPreview(next);
    track("audio_setting_change", {
      surface: "settings-page",
      setting: "autoplay_preview",
      value: next,
    });
  };

  const onReducedMotionChange = (next: boolean) => {
    setReducedMotionOverride(next);
    track("audio_setting_change", {
      surface: "settings-page",
      setting: "reduced_motion_override",
      value: next,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
        <header className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Preferences</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Site settings
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Control how audio and motion behave across the site. Choices are saved locally to this
            browser and sync instantly between tabs.
          </p>
        </header>

        <section
          aria-labelledby="audio-heading"
          className="rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <Headphones className="h-3.5 w-3.5" /> Audio
          </div>
          <h2 id="audio-heading" className="font-display text-xl font-medium text-foreground">
            Chapter I narrative
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the recorded narrative preview on the home page.
          </p>

          <div className="mt-5">
            <Row
              id="autoplay-preview"
              title="Autoplay preview"
              description="Play a short low-volume intro automatically when the Chapter I card enters view. Disable to require a manual click."
              checked={autoplayPreview}
              onChange={onAutoplayChange}
            />
          </div>
        </section>

        <section
          aria-labelledby="a11y-heading"
          className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Accessibility
          </div>
          <h2 id="a11y-heading" className="font-display text-xl font-medium text-foreground">
            Motion & previews
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We always respect your operating system&apos;s reduced-motion setting. You can also force it
            on for this site only.
          </p>

          <div className="mt-5">
            <Row
              id="reduced-motion-override"
              title="Force reduced motion"
              description="Suppress audio auto-previews and non-essential motion regardless of the system setting."
              checked={reducedMotionOverride}
              onChange={onReducedMotionChange}
              hint={
                systemReducedMotion
                  ? "System reduced-motion is currently ON"
                  : "System reduced-motion is currently off"
              }
            />
          </div>
        </section>

        <div className="mt-10 flex items-center justify-between text-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" /> Back to home
          </Link>
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Saved automatically
          </span>
        </div>
      </div>
    </main>
  );
}
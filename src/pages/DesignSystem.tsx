import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  TfxButton,
  TfxCard,
  TfxSection,
  TfxHeading,
  TfxProse,
  TfxEyebrow,
} from "@/components/design-system";

type Brand = "default" | "justice" | "marriage" | "brandtoki" | "edtech";

const CORE_TOKENS: Array<{ name: string; useFor: string }> = [
  { name: "background", useFor: "Page background" },
  { name: "foreground", useFor: "Primary text" },
  { name: "card", useFor: "Card / surface" },
  { name: "card-foreground", useFor: "Text on card" },
  { name: "primary", useFor: "Primary CTAs, brand accents" },
  { name: "primary-foreground", useFor: "Text on primary" },
  { name: "secondary", useFor: "Soft surface bands" },
  { name: "secondary-foreground", useFor: "Text on secondary" },
  { name: "muted", useFor: "Section band bg" },
  { name: "muted-foreground", useFor: "Body copy / metadata" },
  { name: "accent", useFor: "Highlight accents" },
  { name: "destructive", useFor: "Errors, dangerous actions" },
  { name: "border", useFor: "Dividers, hairlines" },
  { name: "ring", useFor: "Focus rings" },
];

function Swatch({ name, useFor }: { name: string; useFor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <div
        className="h-10 w-10 shrink-0 rounded-md border border-border"
        style={{ background: `hsl(var(--${name}))` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[12px] font-semibold text-foreground">
          --{name}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{useFor}</p>
      </div>
    </div>
  );
}

export default function DesignSystem() {
  const [brand, setBrand] = useState<Brand>("default");

  useEffect(() => {
    const root = document.documentElement;
    if (brand === "default") root.removeAttribute("data-brand");
    else root.setAttribute("data-brand", brand);
    return () => root.removeAttribute("data-brand");
  }, [brand]);

  return (
    <>
      <Helmet>
        <title>Design System · TrendFlux</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta
          name="description"
          content="Internal design system: tokens, components, typography, and sub-brand previews for the TrendFlux ecosystem."
        />
      </Helmet>

      {/* Hero */}
      <TfxSection tone="gradient" padding="lg">
        <TfxEyebrow>Internal · v1</TfxEyebrow>
        <TfxHeading level={1} className="mt-3">
          TrendFlux Design System
        </TfxHeading>
        <TfxProse size="lg" measure="wide" className="mt-4">
          One place to see every token, wrapper component, and sub-brand
          preview. Compose new pages from <code>TfxSection</code> ›{" "}
          <code>TfxCard</code> › <code>TfxButton</code> instead of writing raw
          Tailwind color utilities.
        </TfxProse>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Sub-brand preview:
          </span>
          {(["default", "justice", "marriage", "brandtoki", "edtech"] as Brand[]).map(
            (b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b)}
                className={`rounded-full border px-3 py-1 text-[12px] transition ${
                  brand === b
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {b}
              </button>
            ),
          )}
        </div>
      </TfxSection>

      {/* Colors */}
      <TfxSection tone="default" padding="md" divide>
        <TfxEyebrow>01 · Colors</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          Semantic tokens
        </TfxHeading>
        <TfxProse className="mt-2">
          All colors are HSL-encoded custom properties. Never hardcode hex or{" "}
          <code>text-white</code>/<code>bg-black</code>. Use{" "}
          <code>bg-primary</code>, <code>text-muted-foreground</code>, etc.
        </TfxProse>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_TOKENS.map((t) => (
            <Swatch key={t.name} name={t.name} useFor={t.useFor} />
          ))}
        </div>
      </TfxSection>

      {/* Typography */}
      <TfxSection tone="muted" padding="md" divide>
        <TfxEyebrow>02 · Typography</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          Heading scale
        </TfxHeading>
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <div key={l} className="border-b border-border/60 pb-4">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                H{l} · TfxHeading level={l}
              </p>
              <TfxHeading level={l as 1}>
                Signature outcomes, at a glance.
              </TfxHeading>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3">
          <TfxHeading level={5}>Body copy</TfxHeading>
          <TfxProse size="lg">
            Large — used for section leads and hero descriptions. Bangla:
            ট্রেন্ডফ্লাক্স ইকোসিস্টেম।
          </TfxProse>
          <TfxProse size="md">
            Medium — default body size (15px). Sits comfortably against
            headings and card metadata.
          </TfxProse>
          <TfxProse size="sm">
            Small — used inside cards, metadata rows, and dense grids.
          </TfxProse>
          <TfxProse size="xs">
            Extra small — captions, timestamps, tag labels.
          </TfxProse>
        </div>
      </TfxSection>

      {/* Buttons */}
      <TfxSection tone="default" padding="md" divide>
        <TfxEyebrow>03 · Buttons</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          TfxButton
        </TfxHeading>
        <TfxProse className="mt-2">
          Prefer <code>TfxButton</code> for every new CTA. Variants:{" "}
          primary · secondary · outline · ghost · destructive · premium.
        </TfxProse>
        <div className="mt-6 space-y-6">
          {(["primary", "secondary", "outline", "ghost", "destructive", "premium"] as const).map(
            (v) => (
              <div key={v} className="flex flex-wrap items-center gap-3">
                <span className="w-24 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {v}
                </span>
                <TfxButton variant={v} size="sm">Small</TfxButton>
                <TfxButton variant={v} size="md">Medium</TfxButton>
                <TfxButton variant={v} size="lg">Large</TfxButton>
                <TfxButton variant={v} size="xl">Extra large</TfxButton>
              </div>
            ),
          )}
        </div>
      </TfxSection>

      {/* Cards */}
      <TfxSection tone="muted" padding="md" divide>
        <TfxEyebrow>04 · Cards</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          TfxCard variants
        </TfxHeading>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["default", "elevated", "glass", "outlined", "gradient-border"] as const).map(
            (v) => (
              <TfxCard key={v} variant={v} padding="lg">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  variant="{v}"
                </p>
                <TfxHeading level={5} className="mt-2">
                  Card headline
                </TfxHeading>
                <TfxProse size="sm" className="mt-2">
                  Composed with tokens only. Padding scale: sm | md | lg | xl.
                </TfxProse>
              </TfxCard>
            ),
          )}
        </div>
      </TfxSection>

      {/* Spacing & Radius */}
      <TfxSection tone="default" padding="md" divide>
        <TfxEyebrow>05 · Spacing & Radius</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          Scale preview
        </TfxHeading>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              --tfx-space-*
            </p>
            <div className="space-y-2">
              {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <span className="w-10 text-right font-mono text-[11px] text-muted-foreground">
                    {n}
                  </span>
                  <div
                    className="h-3 rounded-sm bg-primary/80"
                    style={{ width: `${n}px` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              --tfx-radius-*
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["sm", "0.375rem"],
                ["md", "0.75rem"],
                ["lg", "1rem"],
                ["xl", "1.5rem"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex h-20 items-center justify-center border border-border bg-card text-[12px] font-mono text-muted-foreground"
                  style={{ borderRadius: v }}
                >
                  radius-{k}
                </div>
              ))}
            </div>
          </div>
        </div>
      </TfxSection>

      {/* Elevation */}
      <TfxSection tone="muted" padding="md" divide>
        <TfxEyebrow>06 · Elevation</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          Shadow tokens
        </TfxHeading>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["--shadow-elegant", "shadow-elegant"],
            ["--shadow-cyan", "shadow-cyan"],
            ["--shadow-gold", "shadow-gold"],
          ].map(([k, label]) => (
            <div
              key={k}
              className="rounded-xl bg-card p-6 text-center"
              style={{ boxShadow: `var(${k})` }}
            >
              <p className="font-mono text-[12px] text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </TfxSection>

      {/* Animation */}
      <TfxSection tone="default" padding="md" divide>
        <TfxEyebrow>07 · Animation</TfxEyebrow>
        <TfxHeading level={2} className="mt-2">
          Motion utilities
        </TfxHeading>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <TfxCard>
            <p className="font-mono text-[11px] text-muted-foreground">animate-fade-in</p>
            <div className="mt-3 animate-fade-in rounded-md bg-primary/10 p-4 text-sm text-foreground">
              Fades in on mount
            </div>
          </TfxCard>
          <TfxCard>
            <p className="font-mono text-[11px] text-muted-foreground">hover-scale</p>
            <div className="mt-3 hover-scale rounded-md bg-primary/10 p-4 text-sm text-foreground">
              Hover me
            </div>
          </TfxCard>
          <TfxCard>
            <p className="font-mono text-[11px] text-muted-foreground">story-link</p>
            <a href="#" className="story-link mt-3 inline-block text-sm text-foreground">
              Underline sweep
            </a>
          </TfxCard>
        </div>
      </TfxSection>
    </>
  );
}
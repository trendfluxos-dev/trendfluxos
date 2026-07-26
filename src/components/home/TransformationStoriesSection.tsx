import { ArrowRight } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import { TRANSFORMATION_STORIES } from "@/data/transformationStories";

/**
 * Client Transformation Stories — short before → after outcomes.
 *
 * Renders 3–5 client cards, each with a two-column before/after split and
 * a headline metric chip. Layout uses semantic tokens only (no hardcoded
 * hex) so it inherits the light/dark theme automatically.
 */
export const TransformationStoriesSection = () => (
  <TfSection
    id="transformation-stories"
    eyebrow="Transformation Stories"
    title="Before → After. Operator outcomes, not case-study theatre."
    intro="A snapshot of the delta each engagement produced — same team, same market, measurable lift."
  >
    <ul
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2"
      aria-label="Client transformation stories"
    >
      {TRANSFORMATION_STORIES.map((story) => (
        <li
          key={story.id}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:p-8"
        >
          {/* Header: client + industry + timeframe + metric chip */}
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {story.industry} · {story.timeframe}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">
                {story.client}
              </h3>
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-right">
              <div className="text-base font-bold leading-tight text-primary">
                {story.metric.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {story.metric.label}
              </div>
            </div>
          </header>

          {/* Before → After split */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Before
              </p>
              <p className="text-sm font-semibold text-foreground">
                {story.before.headline}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {story.before.detail}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight
                className="h-5 w-5 rotate-90 text-primary sm:rotate-0"
                aria-hidden="true"
              />
              <span className="sr-only">transformed into</span>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                After
              </p>
              <p className="text-sm font-semibold text-foreground">
                {story.after.headline}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {story.after.detail}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </TfSection>
);

export default TransformationStoriesSection;
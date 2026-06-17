import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Headphones, Sparkles } from "lucide-react";
import { AI_EXPERT_EMON_STORY } from "@/data/aiExpertEmonStory";

export default function AiExpertStoryTeaser() {
  const bn = AI_EXPERT_EMON_STORY.bn;
  return (
    <section aria-labelledby="ai-expert-story-teaser" className="relative isolate bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            <Sparkles className="h-3 w-3" />
            New Audio Story
          </span>
        </div>
        <div className="mx-auto max-w-3xl">
          <Link
            to="/stories/ai-expert-emon"
            className="group block rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <Headphones className="h-3.5 w-3.5 text-primary" />
                Chapter II
                <span aria-hidden className="text-muted-foreground/40">·</span>
                <span lang="bn">এআই বিশেষজ্ঞের গল্প</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {bn.durationLabel}
              </span>
            </div>
            <h2
              id="ai-expert-story-teaser"
              lang="bn"
              className="mt-6 font-display text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[32px] sm:leading-[1.1]"
            >
              {bn.title}
            </h2>
            <p lang="bn" className="mt-4 text-[15px] leading-[1.75] text-muted-foreground sm:text-[16px]">
              {bn.kicker}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Tap to listen + read full narrative
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors group-hover:text-primary-glow">
                Open story
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  bn: string;
  context?: string;
  size?: "md" | "lg";
  className?: string;
};

/**
 * Reusable iconic pull-quote — gold accent, Bengali-typography aware.
 * Used on /the-stand as section dividers and on the homepage hero anchor.
 */
export function IconicQuote({ bn, context, size = "lg", className }: Props) {
  return (
    <figure
      className={cn(
        "relative glass rounded-2xl border border-gold/30 p-8 md:p-10 shadow-gold/20",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <Quote
        className="absolute -top-3 left-6 h-7 w-7 rounded-full bg-background p-1 text-gold ring-1 ring-gold/40"
        aria-hidden
      />
      <blockquote
        lang="bn"
        className={cn(
          "font-display font-bold leading-snug text-foreground",
          size === "lg" ? "text-2xl md:text-4xl" : "text-xl md:text-2xl",
        )}
      >
        &ldquo;{bn}&rdquo;
      </blockquote>
      {context && (
        <figcaption className="mt-4 text-xs uppercase tracking-[0.25em] text-gold/80">
          — {context}
        </figcaption>
      )}
    </figure>
  );
}

import { cn } from "@/lib/utils";
import { useTfReveal } from "./useTfReveal";

/**
 * Premium light section shell — white with subtle gray alternates,
 * red accent glows, and reveal-on-scroll for header content.
 */
export const TfSection = ({
  id,
  eyebrow,
  title,
  intro,
  className,
  children,
  tone = "light",
  align = "center",
  titleAs = "h2",
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  tone?: "light" | "muted";
  align?: "center" | "left";
  /**
   * HTML heading level for the section title. Defaults to `h2` because most
   * sections are sub-sections of a page. Set to `h1` on the page's primary
   * hero section to satisfy "every page has exactly one H1" for SEO/a11y.
   */
  titleAs?: "h1" | "h2";
}) => {
  const headerRef = useTfReveal<HTMLDivElement>();
  const bodyRef = useTfReveal<HTMLDivElement>();

  return (
    <section
      id={id}
      className={cn(
        "relative isolate overflow-hidden text-foreground",
        tone === "light" ? "bg-background" : "bg-muted",
        className,
      )}
    >
      {/* animated grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg" />
      {/* drifting glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-primary/8 blur-[160px] tf-glow-pulse"
      />
      {/* hairline top */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        {(eyebrow || title || intro) && (
          <div
            ref={headerRef}
            className={cn(
              "tf-reveal mx-auto mb-12 max-w-2xl sm:mb-16 lg:mb-20",
              align === "center" ? "text-center" : "text-left mx-0",
            )}
          >
            {eyebrow && (
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {eyebrow}
              </p>
            )}
            {title && (() => {
              const Heading = titleAs;
              return (
                <Heading className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]">
                  {title}
                </Heading>
              );
            })()}
            {intro && (
              <p
                className={cn(
                  "mt-6 text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]",
                  align === "center" ? "mx-auto max-w-xl" : "max-w-xl",
                )}
              >
                {intro}
              </p>
            )}
          </div>
        )}
        <div ref={bodyRef} className="tf-reveal">
          {children}
        </div>
      </div>

      {/* hairline bottom */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export const TfCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "tf-card rounded-2xl border border-border bg-card p-7 shadow-sm hover:border-primary/30 hover:shadow-md",
      className,
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    {children}
  </div>
);

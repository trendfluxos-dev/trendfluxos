import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * TfxHeading — Enforces the project's typographic scale.
 * Levels 1–6 map to visual sizes; `as` overrides the semantic tag.
 */
const headingVariants = cva("font-display tracking-[-0.02em] text-foreground", {
  variants: {
    level: {
      1: "text-4xl font-semibold sm:text-5xl lg:text-6xl",
      2: "text-3xl font-semibold sm:text-4xl",
      3: "text-2xl font-semibold sm:text-3xl",
      4: "text-xl font-semibold sm:text-2xl",
      5: "text-lg font-semibold",
      6: "text-base font-semibold",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      gradient: "bg-[image:var(--gradient-text)] bg-clip-text text-transparent",
    },
  },
  defaultVariants: {
    level: 2,
    tone: "default",
  },
});

export interface TfxHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const TfxHeading = React.forwardRef<HTMLHeadingElement, TfxHeadingProps>(
  ({ level = 2, tone, as, className, ...props }, ref) => {
    const Tag = (as ?? (`h${level}` as const)) as "h2";
    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ level, tone }), className)}
        {...props}
      />
    );
  },
);
TfxHeading.displayName = "TfxHeading";

export { headingVariants };
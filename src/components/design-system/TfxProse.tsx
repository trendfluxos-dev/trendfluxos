import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * TfxProse — Body copy wrapper with tuned line-height and measure.
 */
const proseVariants = cva("leading-relaxed text-muted-foreground", {
  variants: {
    size: {
      xs: "text-[13px]",
      sm: "text-sm",
      md: "text-[15px]",
      lg: "text-base sm:text-lg",
    },
    tone: {
      default: "text-muted-foreground",
      strong: "text-foreground",
      subtle: "text-muted-foreground/80",
    },
    measure: {
      narrow: "max-w-prose",
      wide: "max-w-3xl",
      full: "",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
    measure: "narrow",
  },
});

export interface TfxProseProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof proseVariants> {
  as?: "p" | "div" | "span";
}

export const TfxProse = React.forwardRef<HTMLParagraphElement, TfxProseProps>(
  ({ size, tone, measure, as: Comp = "p", className, ...props }, ref) => (
    <Comp
      ref={ref as never}
      className={cn(proseVariants({ size, tone, measure }), className)}
      {...props}
    />
  ),
);
TfxProse.displayName = "TfxProse";

/** TfxEyebrow — the small uppercase label used above section titles. */
export function TfxEyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[10px] font-medium uppercase tracking-[0.3em] text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { proseVariants };
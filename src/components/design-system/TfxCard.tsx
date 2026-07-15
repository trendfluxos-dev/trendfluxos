import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * TfxCard — Design-system card container.
 *
 * Variants:
 *  - default       : simple bordered surface
 *  - elevated      : shadow, no border
 *  - glass         : translucent surface with hairline border
 *  - outlined      : stronger visible border, no fill
 *  - gradient-border: primary-tinted gradient rim
 *
 * Paddings tuned for 15px body copy. All colors are token-driven.
 */
const cardVariants = cva(
  "relative flex flex-col rounded-xl transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-border bg-card text-card-foreground",
        elevated:
          "bg-card text-card-foreground shadow-[var(--shadow-elegant)] hover:-translate-y-0.5",
        glass:
          "glass border border-glass-border text-foreground",
        outlined:
          "border-2 border-foreground/15 bg-transparent text-foreground hover:border-primary/40",
        "gradient-border":
          "bg-card text-card-foreground p-[1px] bg-gradient-cyan",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-6 sm:p-7",
        xl: "p-8 sm:p-10",
      },
      interactive: {
        true: "hover:border-primary/40 hover:shadow-sm cursor-pointer group",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  },
);

export interface TfxCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export const TfxCard = React.forwardRef<HTMLDivElement, TfxCardProps>(
  ({ variant, padding, interactive, className, children, ...props }, ref) => {
    // gradient-border needs an inner surface so content isn't tinted
    if (variant === "gradient-border") {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant, padding: "none", interactive }), className)}
          {...props}
        >
          <div className={cn("rounded-[calc(theme(borderRadius.xl)-1px)] bg-card h-full w-full", padding && paddingClass(padding))}>
            {children}
          </div>
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TfxCard.displayName = "TfxCard";

function paddingClass(p: NonNullable<VariantProps<typeof cardVariants>["padding"]>) {
  return {
    none: "p-0",
    sm: "p-4",
    md: "p-5",
    lg: "p-6 sm:p-7",
    xl: "p-8 sm:p-10",
  }[p];
}

export { cardVariants };
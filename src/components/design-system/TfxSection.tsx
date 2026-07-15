import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * TfxSection — Page section wrapper with consistent container, padding,
 * and background band. Compose with TfxCard / TfxHeading inside.
 */
const sectionVariants = cva("scroll-mt-24", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-muted text-foreground",
      inverted: "bg-foreground text-background",
      gradient: "bg-[image:var(--gradient-hero)] text-foreground",
    },
    padding: {
      sm: "py-10 sm:py-12",
      md: "py-14 sm:py-16 lg:py-20",
      lg: "py-16 sm:py-20 lg:py-24",
      xl: "py-20 sm:py-28 lg:py-32",
    },
    divide: {
      true: "border-t border-border",
      false: "",
    },
  },
  defaultVariants: {
    tone: "default",
    padding: "lg",
    divide: false,
  },
});

const containerVariants = cva("mx-auto px-5 sm:px-8", {
  variants: {
    width: {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-5xl",
      xl: "max-w-6xl",
      full: "max-w-7xl",
    },
  },
  defaultVariants: {
    width: "lg",
  },
});

export interface TfxSectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  container?: VariantProps<typeof containerVariants>["width"];
  as?: React.ElementType;
}

export const TfxSection = React.forwardRef<HTMLElement, TfxSectionProps>(
  (
    {
      tone,
      padding,
      divide,
      container = "lg",
      as: Comp = "section",
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <Comp
      ref={ref}
      className={cn(sectionVariants({ tone, padding, divide }), className)}
      {...props}
    >
      <div className={containerVariants({ width: container })}>{children}</div>
    </Comp>
  ),
);
TfxSection.displayName = "TfxSection";

export { sectionVariants, containerVariants };
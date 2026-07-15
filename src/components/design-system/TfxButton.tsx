import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TfxButton — Design-system wrapper around shadcn Button.
 *
 * Prefer this in new pages. It maps the design-system vocabulary
 * (primary, secondary, ghost, outline, destructive, premium) onto the
 * underlying shadcn variants and keeps sizes named consistently
 * (sm | md | lg | xl). Never pass hardcoded colors — rely on tokens.
 */
export type TfxButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "premium";

export type TfxButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

export interface TfxButtonProps
  extends Omit<ButtonProps, "variant" | "size"> {
  variant?: TfxButtonVariant;
  size?: TfxButtonSize;
}

const variantMap: Record<TfxButtonVariant, ButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
  outline: "outline",
  destructive: "destructive",
  premium: "hero",
};

const sizeMap: Record<TfxButtonSize, ButtonProps["size"]> = {
  sm: "sm",
  md: "default",
  lg: "lg",
  xl: "xl",
  icon: "icon",
};

export const TfxButton = React.forwardRef<HTMLButtonElement, TfxButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      className={cn(className)}
      {...props}
    />
  ),
);
TfxButton.displayName = "TfxButton";
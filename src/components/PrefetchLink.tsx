import { Link, LinkProps } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { preloadRoute } from "@/lib/routes";

export const PrefetchLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, onMouseEnter, onFocus, ...rest }, ref) => {
    const path = typeof to === "string" ? to : (to as any).pathname || "";
    const prefetch = useCallback(() => {
      try { preloadRoute(path); } catch { /* noop */ }
    }, [path]);
    return (
      <Link
        ref={ref}
        to={to}
        onMouseEnter={(e) => { prefetch(); onMouseEnter?.(e); }}
        onFocus={(e) => { prefetch(); onFocus?.(e); }}
        {...rest}
      />
    );
  },
);
PrefetchLink.displayName = "PrefetchLink";

export default PrefetchLink;
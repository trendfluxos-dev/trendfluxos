import { useLocation } from "react-router-dom";

/**
 * Synthetic error triggers used by Playwright smoke tests to exercise the
 * AppErrorBoundary and RouteErrorBoundary fallbacks. Kept tiny and always
 * available (not dev-only) so the prod preview build can verify error
 * containment as well. Triggered only when the `__boom` query / route is
 * explicitly hit — zero behaviour change for normal users.
 */
export const AppBoomTrigger = () => {
  const { search } = useLocation();
  if (new URLSearchParams(search).get("__boom") === "app") {
    throw new Error("E2E synthetic app-level error");
  }
  return null;
};

export const RouteBoom = () => {
  throw new Error("E2E synthetic route-level error");
};
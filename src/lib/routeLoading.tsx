import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { PageFallback } from "@/components/PageFallback";

/**
 * Route-level loading gate.
 *
 * The Suspense boundary in <App/> already shows <PageFallback/> while a
 * route's code chunk is downloading. This provider extends that so the
 * same skeleton also covers a route's initial *data* fetching — pages
 * opt in by calling `useRouteDataLoading(query.isLoading)` (or passing
 * any boolean/observable "is fetching" flag).
 *
 * Behaviour:
 *   - On every pathname change the gate re-arms and shows the skeleton
 *     for one paint frame so downstream effects have a chance to
 *     register their loaders.
 *   - While ANY registered loader is truthy, the skeleton stays on top
 *     of the (hidden) route content. Content is mounted underneath so
 *     fetchers actually run.
 *   - Once every loader clears, the skeleton is removed and the route
 *     content is revealed atomically.
 *
 * Pages without any data fetching don't need to call the hook — the
 * gate auto-disarms after one paint frame if no loaders registered.
 */

type Ctx = {
  register: (id: string, loading: boolean) => void;
  unregister: (id: string) => void;
};

const RouteLoadingContext = createContext<Ctx | null>(null);

export function RouteLoadingProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});
  const [armed, setArmed] = useState(true);
  const currentPath = useRef(location.pathname);

  // Re-arm the gate on every route change so the skeleton reappears
  // between navigations, not just on the initial mount.
  useEffect(() => {
    if (currentPath.current === location.pathname) return;
    currentPath.current = location.pathname;
    setLoaders({});
    setArmed(true);
  }, [location.pathname]);

  // Give one paint frame for children to mount + register their loaders
  // before we auto-disarm. If any loader has registered `true` by then,
  // the `anyLoading` check keeps the skeleton up.
  useEffect(() => {
    if (!armed) return;
    const handle = requestAnimationFrame(() => setArmed(false));
    return () => cancelAnimationFrame(handle);
  }, [armed, location.pathname]);

  const register = useCallback((id: string, loading: boolean) => {
    setLoaders((prev) => {
      if (prev[id] === loading) return prev;
      return { ...prev, [id]: loading };
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setLoaders((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => ({ register, unregister }), [register, unregister]);

  const anyLoading = Object.values(loaders).some(Boolean);
  const showFallback = armed || anyLoading;

  return (
    <RouteLoadingContext.Provider value={value}>
      {showFallback && (
        <div className="fixed inset-0 z-[60] bg-background">
          <PageFallback />
        </div>
      )}
      {/*
        Mount children even when the fallback is up so their data
        fetchers actually run. `aria-hidden` + `inert` keeps assistive
        tech and focus on the skeleton until content is ready.
      */}
      <div aria-hidden={showFallback} {...(showFallback ? { inert: "" as unknown as boolean } : {})}>
        {children}
      </div>
    </RouteLoadingContext.Provider>
  );
}

/**
 * Register the current component's data-loading state with the route
 * gate. Pass `true` while your route-critical data is in flight, and
 * `false` once it's settled (success OR error — the gate isn't a retry
 * mechanism, it just holds the skeleton).
 *
 * Multiple components on the same route may call this; the gate stays
 * up until every registered loader reports `false`.
 */
export function useRouteDataLoading(loading: boolean): void {
  const ctx = useContext(RouteLoadingContext);
  const id = useId();
  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, loading);
    return () => ctx.unregister(id);
  }, [ctx, id, loading]);
}
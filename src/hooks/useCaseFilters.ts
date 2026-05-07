import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EMPTY_FILTERS, type CaseFilters } from "@/components/FilterBar";

const KEYS: Array<keyof CaseFilters> = ["service", "industry", "stack", "stage", "query"];
const PARAM_MAP: Record<keyof CaseFilters, string> = {
  service: "service",
  industry: "industry",
  stack: "stack",
  stage: "stage",
  query: "q",
};

/** Serialise a CaseFilters object into a URLSearchParams string (sorted, no empty values). */
export const serializeFilters = (f: CaseFilters): string => {
  const sp = new URLSearchParams();
  KEYS.forEach((k) => {
    const v = (f[k] ?? "").trim();
    if (v) sp.set(PARAM_MAP[k], v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

/** Read a CaseFilters object out of any URLSearchParams instance. */
export const filtersFromSearchParams = (sp: URLSearchParams): CaseFilters => ({
  service: sp.get(PARAM_MAP.service) ?? "",
  industry: sp.get(PARAM_MAP.industry) ?? "",
  stack: sp.get(PARAM_MAP.stack) ?? "",
  stage: sp.get(PARAM_MAP.stage) ?? "",
  query: sp.get(PARAM_MAP.query) ?? "",
});

/**
 * URL-synced filter state. Reading/writing the filters updates the query string,
 * which means navigation (back/forward, deep-links) keeps the user's selection.
 */
export const useCaseFilters = (): [CaseFilters, (next: CaseFilters) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  const setValue = useCallback(
    (next: CaseFilters) => {
      const sp = new URLSearchParams();
      KEYS.forEach((k) => {
        const v = (next[k] ?? "").trim();
        if (v) sp.set(PARAM_MAP[k], v);
      });
      // `replace: true` so each keystroke doesn't pollute history.
      setSearchParams(sp, { replace: true });
    },
    [setSearchParams]
  );

  return [value, setValue];
};

export { EMPTY_FILTERS };

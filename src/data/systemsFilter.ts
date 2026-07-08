// Map FilterBar selections (CaseFilters) onto the SYSTEMS_PORTFOLIO entries.
//
// The systems dataset was authored before the CaseFilters facets existed, so
// none of {service, industry, stack, stage} exists as a first-class field on
// SystemCase. Rather than duplicate metadata, we do a permissive text match
// across the fields that DO exist (title, tagline, summary, stack chips,
// built bullets, slug, eyebrow). Any non-empty filter term must appear
// somewhere in that haystack (AND across facets, OR within a facet is not
// needed because each facet is a single string).
//
// The free-text `query` matches the same haystack.

import { SYSTEMS_PORTFOLIO, type SystemCase } from "./systemsPortfolio";
import type { CaseFilters } from "@/components/FilterBar";

const haystack = (s: SystemCase): string =>
  [
    s.slug,
    s.title,
    s.eyebrow,
    s.tagline,
    s.summary,
    s.outcome.label,
    ...s.stack,
    ...s.built,
  ]
    .join(" \n ")
    .toLowerCase();

const matches = (hay: string, term: string): boolean => {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return hay.includes(t);
};

/** True when every non-empty filter facet appears somewhere in the system. */
export const systemMatchesFilters = (s: SystemCase, f: CaseFilters): boolean => {
  const hay = haystack(s);
  return (
    matches(hay, f.service) &&
    matches(hay, f.industry) &&
    matches(hay, f.stack) &&
    matches(hay, f.stage) &&
    matches(hay, f.query)
  );
};

/** True when at least one facet has a non-empty value. */
export const hasActiveFilters = (f: CaseFilters): boolean =>
  Boolean(f.service || f.industry || f.stack || f.stage || f.query.trim());

/** Ordered list of slugs matching the given filters (preserves data order). */
export const filterSystemSlugs = (f: CaseFilters): string[] =>
  SYSTEMS_PORTFOLIO.filter((s) => systemMatchesFilters(s, f)).map((s) => s.slug);

/** Stable DOM ids for each rendered surface, so scrollIntoView can find them. */
export const bentoTileId = (slug: string) => `system-tile-${slug}`;
export const narrativeCardId = (slug: string) => `system-narrative-${slug}`;
import { useCallback, useMemo, useState } from "react";
import FilterBar, { EMPTY_FILTERS, type CaseFilters } from "@/components/FilterBar";
import { SystemsBentoSection } from "./SystemsBentoSection";
import {
  bentoTileId,
  filterSystemSlugs,
  hasActiveFilters,
} from "@/data/systemsFilter";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  tone?: "light" | "muted";
};

/**
 * FilterBar-driven wrapper around <SystemsBentoSection />. Filters commit
 * only when the user presses "Search Operations" (the FilterBar's submit),
 * mirroring the case-cards behaviour. On commit we:
 *
 *   1. Compute the set of matching system slugs.
 *   2. Pass it to the bento section so matches highlight and non-matches dim.
 *   3. Scroll the first matching bento tile into view, if any.
 *
 * The FilterBar draft state is kept locally; nothing writes to the URL from
 * here (the systems page is public marketing, not deep-linkable filters).
 */
export const FilteredSystemsBentoSection = (props: Props) => {
  // Draft filters the user is editing in the FilterBar.
  const [draft, setDraft] = useState<CaseFilters>(EMPTY_FILTERS);
  // Committed filters — only updated on "Search Operations".
  const [committed, setCommitted] = useState<CaseFilters>(EMPTY_FILTERS);

  const matchingSlugs = useMemo(() => {
    if (!hasActiveFilters(committed)) return null;
    return new Set(filterSystemSlugs(committed));
  }, [committed]);

  const resultCount = matchingSlugs?.size;

  const handleApply = useCallback(() => {
    setCommitted(draft);

    // Defer to after paint so the highlight class is applied before we scroll,
    // which prevents the browser from picking a "before-highlight" scroll y.
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      const slugs = hasActiveFilters(draft) ? filterSystemSlugs(draft) : [];
      const first = slugs[0];
      if (!first) return;
      const el = document.getElementById(bentoTileId(first));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [draft]);

  return (
    <>
      <FilterBar
        value={draft}
        onChange={setDraft}
        resultCount={resultCount}
        onApply={handleApply}
      />
      <SystemsBentoSection {...props} highlightSlugs={matchingSlugs} />
    </>
  );
};

export default FilteredSystemsBentoSection;
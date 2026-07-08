import { describe, it, expect } from "vitest";
import { useMemo } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FilterBar, { type CaseFilters } from "@/components/FilterBar";
import CaseStudyPage from "@/pages/CaseStudyPage";
import { caseStudies } from "@/data/caseStudies";
import { useCaseFilters } from "@/hooks/useCaseFilters";

// jsdom polyfills for browser APIs the narrative page depends on.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
// @ts-expect-error — test-only shim
globalThis.IntersectionObserver ??= MockIntersectionObserver;
if (typeof window !== "undefined" && !("scrollTo" in window && window.scrollTo.toString().includes("[native"))) {
  window.scrollTo = () => {};
}

/**
 * Deep-link + back-restore E2E for the "View Narrative" flow.
 *
 * Scenario:
 *   1. User previously filtered the cases list (URL-synced filters).
 *   2. User opened a case narrative — the narrative route is reachable as a
 *      shareable deep link `/case-studies/:slug`.
 *   3. User presses Back on the narrative page.
 *   4. The card list must render again with the exact same filter state
 *      (query-string preserved), so the filtered cards are restored.
 *
 * We simulate this by seeding MemoryRouter with two history entries — the
 * filtered list URL, then the narrative URL — and landing the app on the
 * narrative (as if the user had opened a shared link after having filtered).
 */

function applyFilters(items: typeof caseStudies, f: CaseFilters) {
  return items.filter((c) => {
    if (f.service && c.service !== f.service) return false;
    if (f.industry && c.industry !== f.industry) return false;
    if (f.stack && !c.stack.includes(f.stack as (typeof c.stack)[number])) return false;
    if (f.stage && c.stage !== f.stage) return false;
    return true;
  });
}

function CasesListRoute() {
  const [filters, setFilters] = useCaseFilters();
  const results = useMemo(() => applyFilters(caseStudies, filters), [filters]);
  return (
    <>
      <h1>Cases list</h1>
      <FilterBar value={filters} onChange={setFilters} resultCount={results.length} />
      <ul id="cases-results" aria-label="Case results" data-testid="cases-list">
        {results.map((c) => (
          <li key={c.slug} data-testid={`case-card-${c.slug}`}>
            {c.title}
          </li>
        ))}
      </ul>
    </>
  );
}

const NARRATIVE_SLUG = "kormoshikkha-edtech-platform";
const LIST_URL = "/cases?service=AI+Automation";
const NARRATIVE_URL = `/case-studies/${NARRATIVE_SLUG}`;

function renderAtNarrative() {
  return render(
    <MemoryRouter initialEntries={[LIST_URL, NARRATIVE_URL]} initialIndex={1}>
      <Routes>
        <Route path="/cases" element={<CasesListRoute />} />
        <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Case narrative deep link → back restores list", () => {
  it("renders narrative content when opened directly as a deep link", async () => {
    renderAtNarrative();

    const study = caseStudies.find((c) => c.slug === NARRATIVE_SLUG)!;
    // Narrative headline & description are visible on the deep-linked page.
    expect(
      await screen.findByRole("heading", { level: 1, name: new RegExp(study.title.slice(0, 12), "i") }),
    ).toBeInTheDocument();
    expect(screen.getByText(study.description)).toBeInTheDocument();

    // The cards list is NOT on screen — we're on the narrative route.
    expect(screen.queryByTestId("cases-list")).not.toBeInTheDocument();
  });

  it("restores the filtered card list when Back is pressed", async () => {
    const user = userEvent.setup();
    renderAtNarrative();

    // Wait for narrative to mount, then press the visible in-page Back button.
    const back = await screen.findByRole("button", {
      name: /return to impact map and case studies/i,
    });
    await user.click(back);

    // After Back we should be on the cases list with the original filter
    // preserved via the URL query-string.
    const list = await screen.findByTestId("cases-list");
    expect(list).toBeInTheDocument();

    // Filter was service="AI Automation" — only the matching subset must
    // render, proving filter state was restored (not reset).
    const expected = applyFilters(caseStudies, {
      service: "AI Automation",
      industry: "",
      stack: "",
      stage: "",
      query: "",
    });
    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(caseStudies.length);

    const cards = screen.getAllByTestId(/^case-card-/);
    expect(cards).toHaveLength(expected.length);
    for (const c of expected) {
      expect(screen.getByTestId(`case-card-${c.slug}`)).toBeInTheDocument();
    }

    // FilterBar's Growth Service select still shows the restored value.
    await waitFor(() => {
      const select = screen.getByLabelText("Growth Service") as HTMLSelectElement;
      expect(select.value).toBe("AI Automation");
    });
  });
});
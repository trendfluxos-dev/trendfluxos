import { describe, it, expect } from "vitest";
import { useMemo, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FilterBar, { EMPTY_FILTERS, type CaseFilters } from "@/components/FilterBar";
import { DigitalImpactMap } from "@/components/DigitalImpactMap";
import { caseStudies } from "@/data/caseStudies";

/**
 * End-to-end style integration test that wires FilterBar + the case-card list
 * + DigitalImpactMap through the same case-study dataset — the exact composition
 * a "Cases" page renders — and verifies that:
 *
 *   1. Setting Growth Service / Industry / Tech Stack / Business Stage facets
 *      and pressing "Search Operations" filters the visible case cards.
 *   2. The Digital Impact Map stays in sync — matched nodes stay lit, all other
 *      nodes get the `data-no-match` marker used by the map for its "dimmed /
 *      no match" visual state.
 *
 * Filters only commit when Search Operations is pressed, so we also assert the
 * pre-commit state is unchanged.
 */

function applyFilters(items: typeof caseStudies, f: CaseFilters) {
  return items.filter((c) => {
    if (f.service && c.service !== f.service) return false;
    if (f.industry && c.industry !== f.industry) return false;
    if (f.stack && !c.stack.includes(f.stack as (typeof c.stack)[number])) return false;
    if (f.stage && c.stage !== f.stage) return false;
    if (f.query) {
      const q = f.query.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

function CasesHarness() {
  const [draft, setDraft] = useState<CaseFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<CaseFilters>(EMPTY_FILTERS);

  const results = useMemo(() => applyFilters(caseStudies, applied), [applied]);
  const matchingSlugs = useMemo(() => results.map((c) => c.slug), [results]);

  return (
    <>
      <FilterBar
        value={draft}
        onChange={setDraft}
        resultCount={results.length}
        onApply={() => setApplied(draft)}
      />
      <ul id="cases-results" aria-label="Case results">
        {results.map((c) => (
          <li key={c.slug} data-testid={`case-card-${c.slug}`}>
            {c.title}
          </li>
        ))}
      </ul>
      <DigitalImpactMap matchingSlugs={matchingSlugs} />
    </>
  );
}

const renderHarness = () =>
  render(
    <MemoryRouter>
      <CasesHarness />
    </MemoryRouter>,
  );

const mapNodeButtons = () =>
  screen
    .getAllByRole("button")
    .filter((el) => el.getAttribute("aria-label")?.includes("Press Enter to open narrative"));

describe("Cases + Impact Map filter sync", () => {
  it("filters case cards and map nodes when Search Operations is pressed", async () => {
    const user = userEvent.setup();
    renderHarness();

    // Baseline: every case is visible, no map node marked as no-match.
    const totalCases = caseStudies.length;
    expect(screen.getAllByTestId(/^case-card-/)).toHaveLength(totalCases);
    const nodesBefore = mapNodeButtons();
    expect(nodesBefore.length).toBe(totalCases);
    for (const btn of nodesBefore) {
      expect(btn.getAttribute("data-no-match")).toBeNull();
    }

    // Select facets that isolate a single case study.
    await user.selectOptions(screen.getByLabelText("Growth Service"), "AI Automation");
    await user.selectOptions(screen.getByLabelText("Industry Sector"), "Education");
    await user.selectOptions(screen.getByLabelText("Tech Stack"), "CRM");
    await user.selectOptions(screen.getByLabelText("Business Stage"), "Growth");

    // Nothing should commit until Search Operations is pressed.
    expect(screen.getAllByTestId(/^case-card-/)).toHaveLength(totalCases);

    await user.click(screen.getByRole("button", { name: /search operations/i }));

    // After commit: only the matching case card remains.
    const cards = screen.getAllByTestId(/^case-card-/);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute(
      "data-testid",
      "case-card-kormoshikkha-edtech-platform",
    );

    // Map stays in sync: the matched node has no `data-no-match`, every other
    // node does.
    const nodesAfter = mapNodeButtons();
    const matched = nodesAfter.filter(
      (b) => b.getAttribute("data-no-match") === null,
    );
    const dimmed = nodesAfter.filter(
      (b) => b.getAttribute("data-no-match") === "true",
    );
    expect(matched).toHaveLength(1);
    expect(dimmed).toHaveLength(totalCases - 1);
    expect(matched[0].getAttribute("aria-label")).toMatch(/কর্মশিক্ষা|Kormoshikkha|TED/i);

    // Result counter in the FilterBar reflects the new count.
    expect(screen.getByText(/^\s*1\s+result$/i)).toBeInTheDocument();
  });

  it("resets both cards and map when the reset control is used", async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.selectOptions(screen.getByLabelText("Growth Service"), "Branding");
    await user.click(screen.getByRole("button", { name: /search operations/i }));

    // Branding matches at least one but fewer than all.
    const filteredCards = screen.getAllByTestId(/^case-card-/);
    expect(filteredCards.length).toBeGreaterThan(0);
    expect(filteredCards.length).toBeLessThan(caseStudies.length);

    // Reset clears the draft; press Search Operations again to commit.
    await user.click(screen.getByRole("button", { name: /reset all filters/i }));
    await user.click(screen.getByRole("button", { name: /search operations/i }));

    expect(screen.getAllByTestId(/^case-card-/)).toHaveLength(caseStudies.length);
    for (const btn of mapNodeButtons()) {
      expect(btn.getAttribute("data-no-match")).toBeNull();
    }
  });
});

// Silence unused-import lint when `within` gets removed by future refactors.
void within;
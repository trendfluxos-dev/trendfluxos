import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { expectNoA11yViolations } from "@/test/axe-helpers";
import {
  TfxButton,
  TfxCard,
  TfxSection,
  TfxHeading,
  TfxProse,
  TfxEyebrow,
} from "..";

/**
 * Baseline accessibility (jest-axe) checks for every design-system
 * wrapper. Guards against regressions like icon-only buttons losing
 * their accessible name, headings dropping semantic tags, or cards
 * rendering interactive markup without keyboard support.
 *
 * Rules skipped (see `src/test/axe-helpers.ts`): page-level rules
 * (region, landmark-one-main, page-has-heading-one, html-has-lang,
 * document-title) and color-contrast (needs real CSS, unreliable in
 * jsdom).
 */

describe("design-system wrappers — axe accessibility", () => {
  it("TfxButton (default) has no violations", async () => {
    const { container } = render(<TfxButton>Book strategy call</TfxButton>);
    await expectNoA11yViolations(container);
  });

  it("TfxButton (icon-only requires aria-label)", async () => {
    const { container } = render(
      <TfxButton size="icon" aria-label="Close dialog">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </TfxButton>,
    );
    await expectNoA11yViolations(container);
  });

  it("TfxButton asChild anchor keeps link accessibility", async () => {
    const { container } = render(
      <TfxButton asChild variant="outline">
        <a href="/founder">Read the founder dossier</a>
      </TfxButton>,
    );
    await expectNoA11yViolations(container);
  });

  it("TfxCard renders accessibly (static content)", async () => {
    const { container } = render(
      <TfxCard variant="default" padding="md">
        <TfxHeading level={3}>Systems He Built</TfxHeading>
        <TfxProse>Eight production systems shipped by the founder.</TfxProse>
      </TfxCard>,
    );
    await expectNoA11yViolations(container);
  });

  it("TfxCard interactive variant remains keyboard-accessible", async () => {
    const { container } = render(
      <a href="/portfolio" aria-label="Open portfolio">
        <TfxCard variant="default" padding="md" interactive>
          <TfxHeading level={4}>Portfolio</TfxHeading>
          <TfxProse size="sm">Signature outcomes across the ecosystem.</TfxProse>
        </TfxCard>
      </a>,
    );
    await expectNoA11yViolations(container);
  });

  it("TfxSection wraps content without introducing violations", async () => {
    const { container } = render(
      <TfxSection tone="muted" padding="lg" container="lg">
        <TfxEyebrow>Chapter I</TfxEyebrow>
        <TfxHeading level={2}>Growth as infrastructure.</TfxHeading>
        <TfxProse measure="wide">
          Composable modules for automation, CRM, paid media, creative and analytics.
        </TfxProse>
      </TfxSection>,
    );
    await expectNoA11yViolations(container);
  });

  it("TfxHeading renders the requested semantic level", async () => {
    const { container } = render(
      <>
        <TfxHeading level={1}>Page title</TfxHeading>
        <TfxHeading level={2}>Section</TfxHeading>
        <TfxHeading level={3}>Subsection</TfxHeading>
      </>,
    );
    await expectNoA11yViolations(container);
  });

  it("TfxProse + TfxEyebrow render without violations", async () => {
    const { container } = render(
      <div>
        <TfxEyebrow>Verified outcomes</TfxEyebrow>
        <TfxProse size="lg" measure="wide">
          Every deployment ships with dashboards, docs and handover.
        </TfxProse>
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});

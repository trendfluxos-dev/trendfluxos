import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import CaseStudies from "@/components/CaseStudies";

// Radix Dialog uses PointerEvent internals — jsdom doesn't ship one.
if (typeof (globalThis as unknown as { PointerEvent?: unknown }).PointerEvent === "undefined") {
  (globalThis as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent =
    class PointerEvent extends MouseEvent {} as unknown as typeof MouseEvent;
}

describe("CaseStudies narrative flow (e2e-style)", () => {
  it("opens the narrative dialog when 'View Narrative' is clicked and returns to the card list on Close", async () => {
    render(<CaseStudies />);

    // 1. Case list is rendered — pick the first card that has 'View Narrative'.
    const openBtn = screen.getByRole("button", {
      name: /View Narrative for Education Brand Growth System/i,
    });
    expect(openBtn).toHaveAttribute("aria-expanded", "false");

    // 2. Click opens the narrative dialog.
    fireEvent.click(openBtn);
    const dialog = await screen.findByRole("dialog", {
      name: /Education Brand Growth System/i,
    });
    expect(dialog).toBeInTheDocument();

    // Dialog surfaces the narrative + at least one outcome bullet.
    expect(
      within(dialog).getByText(/Designed an end-to-end content engine/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/\+45% engagement lift in 90 days/i),
    ).toBeInTheDocument();

    // The trigger reflects its expanded state.
    expect(openBtn).toHaveAttribute("aria-expanded", "true");

    // 3. Close returns us to the card list. Radix renders both an
    // icon-only 'X Close' and our footer 'Close' — click the footer one.
    const closeButtons = within(dialog).getAllByRole("button", { name: /^Close$/i });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(
      screen.queryByRole("dialog", {
        name: /Education Brand Growth System/i,
      }),
    ).not.toBeInTheDocument();

    // Card list still visible + trigger back to collapsed.
    expect(
      screen.getByRole("heading", { name: /Education Brand Growth System/i }),
    ).toBeInTheDocument();
    expect(openBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("each case card exposes an independently working narrative dialog", async () => {
    render(<CaseStudies />);
    const triggers = screen
      .getAllByRole("button")
      .filter((b) => /^(View Narrative|View Funnel|View Strategy) for /i.test(b.getAttribute("aria-label") ?? ""));
    expect(triggers.length).toBeGreaterThanOrEqual(3);

    for (const trigger of triggers) {
      fireEvent.click(trigger);
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
      const closes = within(dialog).getAllByRole("button", { name: /^Close$/i });
      fireEvent.click(closes[closes.length - 1]);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  });
});
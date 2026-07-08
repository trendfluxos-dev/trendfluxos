import { describe, it, expect, vi, beforeAll } from "vitest";
import { useState } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { QuoteDialog } from "@/components/QuoteDialog";

// Radix (Dialog + Select) touches PointerEvent / hasPointerCapture, which
// jsdom does not implement. Polyfill just enough for both to render.
beforeAll(() => {
  const g = globalThis as unknown as { PointerEvent?: unknown };
  if (typeof g.PointerEvent === "undefined") {
    g.PointerEvent = class PointerEvent extends MouseEvent {} as unknown as typeof MouseEvent;
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

// The dialog navigates to `mailto:` via window.location.href — swallow it so
// jsdom doesn't emit its "Not implemented: navigation" noise.
const originalHref = Object.getOwnPropertyDescriptor(window.location, "href");
function stubHref() {
  Object.defineProperty(window.location, "href", {
    configurable: true,
    set: vi.fn(),
    get: () => "http://localhost/",
  });
  return () => {
    if (originalHref) Object.defineProperty(window.location, "href", originalHref);
  };
}

// Toast hook renders through a portal; not needed for these assertions.
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn(), toasts: [] }),
}));

// A minimal harness that mirrors how the home page wires the CTA to the
// booking dialog. This keeps the test focused on the flow, not on lazy
// homepage sections and Supabase-backed JSON-LD.
function HomeCtaHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HomeHeroSection onOpenQuote={() => setOpen(true)} />
      <QuoteDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

describe("Book Strategy Call → booking flow → success state (e2e)", () => {
  it("opens the booking form when the hero CTA is clicked, then shows the success state on submit", async () => {
    const restoreHref = stubHref();
    const user = userEvent.setup();
    try {
      render(<HomeCtaHarness />);

      // 1. Hero CTA visible.
      const cta = screen.getByRole("button", { name: /Book a Free Strategy Call/i });
      expect(cta).toBeInTheDocument();

      // 2. Clicking the CTA opens the booking dialog (the "form page").
      await user.click(cta);
      const dialog = await screen.findByRole("dialog", {
        name: /Architect your growth operation/i,
      });
      expect(within(dialog).getByText(/Request a Quote/i)).toBeInTheDocument();

      // 3. Fill the form with valid values.
      await user.type(within(dialog).getByLabelText(/Name/i), "Test Operator");
      await user.type(
        within(dialog).getByLabelText(/Email/i),
        "operator@example.com",
      );
      await user.type(
        within(dialog).getByLabelText(/Company URL/i),
        "example.com",
      );

      // Radix Select — open trigger, pick an option.
      await user.click(
        within(dialog).getByRole("combobox", { name: /Growth Objective/i }),
      );
      const listbox = await screen.findByRole("listbox");
      await user.click(within(listbox).getByRole("option", { name: /Lead Generation/i }));

      // 4. Submit.
      await user.click(
        within(dialog).getByRole("button", { name: /Initiate Operations/i }),
      );

      // 5. Success state renders inside the same dialog.
      const success = await screen.findByRole("dialog", {
        name: /Welcome aboard, Test/i,
      });
      expect(
        within(success).getByText(/Operations initiated/i),
      ).toBeInTheDocument();
      expect(
        within(success).getByText(/Your Growth Strategy request has been logged/i),
      ).toBeInTheDocument();
      // Brief snapshot echoes the submitted values.
      expect(within(success).getByText(/operator@example\.com/)).toBeInTheDocument();
      expect(within(success).getByText(/^Lead Generation$/)).toBeInTheDocument();
      // Next-step timeline appears with the discovery-call milestone.
      expect(within(success).getByText(/Discovery call/i)).toBeInTheDocument();

      // Closing the success state dismisses the dialog and returns to the page.
      await user.click(within(success).getByRole("button", { name: /^Close/i }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    } finally {
      restoreHref();
    }
  });

  it("blocks submission and surfaces field errors when the form is empty", async () => {
    const restoreHref = stubHref();
    const user = userEvent.setup();
    try {
      render(<HomeCtaHarness />);
      await user.click(
        screen.getByRole("button", { name: /Book a Free Strategy Call/i }),
      );
      const dialog = await screen.findByRole("dialog", {
        name: /Architect your growth operation/i,
      });
      await user.click(
        within(dialog).getByRole("button", { name: /Initiate Operations/i }),
      );
      expect(
        await within(dialog).findByText(/Please enter your full name/i),
      ).toBeInTheDocument();
      // Still on the form — success state has not rendered.
      expect(
        within(dialog).queryByText(/Operations initiated/i),
      ).not.toBeInTheDocument();
    } finally {
      restoreHref();
    }
  });
});
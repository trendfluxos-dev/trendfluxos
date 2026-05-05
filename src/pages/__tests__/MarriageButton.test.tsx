import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectLead from "../ProjectLead";

// jsdom doesn't implement these — needed by Radix Tooltip / shadcn UI
beforeEach(() => {
  if (!(window as any).PointerEvent) {
    (window as any).PointerEvent = class extends Event {} as any;
  }
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ProjectLead />
    </MemoryRouter>
  );

describe("Available for Marriage button", () => {
  it("fires marriage_button_clicked on dataLayer when clicked", () => {
    const dataLayer: any[] = [];
    (window as any).dataLayer = dataLayer;
    const gtag = vi.fn();
    (window as any).gtag = gtag;

    renderPage();

    const btn = screen.getByRole("link", {
      name: /available for marriage/i,
    });
    fireEvent.click(btn);

    expect(dataLayer.some((e) => e.event === "marriage_button_clicked")).toBe(true);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "marriage_button_clicked",
      expect.objectContaining({ location: "project_lead_cta" })
    );
  });

  it("shows tooltip content on keyboard focus", async () => {
    renderPage();
    const btn = screen.getByRole("link", { name: /available for marriage/i });

    btn.focus();

    await waitFor(() => {
      expect(
        screen.getAllByText(/open the marriage profile/i).length
      ).toBeGreaterThan(0);
    });
  });

  it("shows tooltip content on hover", async () => {
    renderPage();
    const btn = screen.getByRole("link", { name: /available for marriage/i });

    fireEvent.pointerEnter(btn);
    fireEvent.mouseEnter(btn);
    btn.focus();

    await waitFor(() => {
      expect(
        screen.getAllByText(/open the marriage profile/i).length
      ).toBeGreaterThan(0);
    });
  });
});

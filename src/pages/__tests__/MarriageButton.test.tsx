import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectLead from "../ProjectLead";

// jsdom doesn't implement these — needed by Radix Tooltip / Dialog
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

describe("A Sincere Introduction button", () => {
  it("fires marriage_button_clicked on dataLayer when clicked", () => {
    const dataLayer: any[] = [];
    (window as any).dataLayer = dataLayer;
    const gtag = vi.fn();
    (window as any).gtag = gtag;

    renderPage();

    const btn = screen.getByRole("button", {
      name: /sincere marriage introduction|sincere introduction/i,
    });
    fireEvent.click(btn);

    expect(dataLayer.some((e) => e.event === "marriage_button_clicked")).toBe(true);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "marriage_button_clicked",
      expect.objectContaining({ location: "project_lead_cta" })
    );
  });

  it("opens the introduction dialog with name and WhatsApp fields when clicked", async () => {
    renderPage();
    const btn = screen.getByRole("button", {
      name: /sincere marriage introduction|sincere introduction/i,
    });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/whatsapp number/i)).toBeInTheDocument();
  });

  it("shows tooltip content on hover/focus", async () => {
    renderPage();
    const btn = screen.getByRole("button", {
      name: /sincere marriage introduction|sincere introduction/i,
    });

    fireEvent.pointerEnter(btn);
    fireEvent.mouseEnter(btn);
    btn.focus();

    await waitFor(() => {
      expect(
        screen.getAllByText(/private marriage profile|share a quick intro/i).length
      ).toBeGreaterThan(0);
    });
  });
});

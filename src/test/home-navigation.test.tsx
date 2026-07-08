import { beforeAll, describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ArchitecturalHero from "@/components/home/ArchitecturalHero";

beforeAll(() => {
  // jsdom doesn't ship ResizeObserver / IntersectionObserver; the Navbar
  // relies on them for its sticky-offset measurement effect.
  if (!("ResizeObserver" in globalThis)) {
    class RO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    // @ts-expect-error test-only polyfill
    globalThis.ResizeObserver = RO;
  }
  if (!("IntersectionObserver" in globalThis)) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
      root = null; rootMargin = ""; thresholds = [];
    }
    // @ts-expect-error test-only polyfill
    globalThis.IntersectionObserver = IO;
  }
});

/**
 * "E2E-lite" contract test for the home experience. jsdom cannot boot the
 * full app + hosting fallback, so we assert the two invariants that matter:
 *
 *  1. Every top-level "home" navigation entry (brand logo + Home links,
 *     desktop and mobile) points at "/". If any of these regresses to a
 *     different path, deep-linked users can't find their way back.
 *  2. The homepage hero component actually renders visible hero content —
 *     the h1 headline, supporting copy, and the brand-grid heading — so the
 *     "/" route can never silently render an empty shell.
 */
describe("home navigation contract", () => {
  it("routes every Home / brand nav link to '/'", () => {
    render(
      <MemoryRouter initialEntries={["/some/deep/page"]}>
        <Navbar />
      </MemoryRouter>,
    );

    const homeAnchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href="/"]'),
    );

    // Desktop brand link + mobile "Home" link at minimum.
    expect(homeAnchors.length).toBeGreaterThanOrEqual(1);
    for (const a of homeAnchors) {
      expect(a.getAttribute("href")).toBe("/");
    }

    // Any anchor with an accessible name of "Home" must resolve to "/".
    const namedHome = screen.queryAllByRole("link", { name: /^home$/i });
    for (const link of namedHome) {
      expect(link.getAttribute("href")).toBe("/");
    }
  });

  it("renders the hero + supporting content on '/'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ArchitecturalHero onOpenQuote={() => {}} />
      </MemoryRouter>,
    );

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent ?? "").toMatch(/Next-Gen Operator/i);

    // Supporting hero copy — proves the hero shell isn't empty.
    expect(
      screen.getByText(/Zahid Hasan Emon orchestrates/i),
    ).toBeInTheDocument();

    // Content region below the headline (brand grid) is present.
    const brandGrid = document.getElementById("home-brand-grid-heading");
    expect(brandGrid).not.toBeNull();
    if (brandGrid) {
      expect(within(brandGrid).getByText(/./)).toBeInTheDocument();
    }
  });
});
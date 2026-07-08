import { beforeAll, describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { routes } from "@/lib/routes";

beforeAll(() => {
  // Home page pulls in Navbar / lazy sections that expect these browser APIs.
  if (!("ResizeObserver" in globalThis)) {
    class RO { observe() {} unobserve() {} disconnect() {} }
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = RO;
  }
  if (!("IntersectionObserver" in globalThis)) {
    class IO {
      observe() {} unobserve() {} disconnect() {}
      takeRecords() { return []; }
      root = null; rootMargin = ""; thresholds = [];
    }
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
  }
});

/**
 * Regression guard for the "/" route. This mirrors how <App /> mounts the
 * home page (via the shared `routes` registry + React Router Suspense), so a
 * routing refactor that accidentally removes or remaps "/" — or breaks the
 * lazy chunk for the home page — will fail here instead of surfacing as a
 * blank preview.
 */
describe("home route ('/') regression", () => {
  it("registers a component for '/' in the routes registry", () => {
    expect(routes).toHaveProperty("/");
    expect(typeof routes["/"]).toBe("object");
    // The route component must expose the preload() we rely on for warming.
    expect(
      typeof (routes["/"] as unknown as { preload?: unknown }).preload,
    ).toBe("function");
  });

  it("mounts hero + content when navigating to '/'", async () => {
    const Home = routes["/"];

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Suspense fallback={<div data-testid="route-fallback">loading</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<div data-testid="not-home" />} />
          </Routes>
        </Suspense>
      </MemoryRouter>,
    );

    // Wait for the lazy chunk to resolve, then assert the home hero is live.
    const h1 = await waitFor(
      () => screen.getByRole("heading", { level: 1 }),
      { timeout: 5000 },
    );
    expect(h1.textContent ?? "").toMatch(/Next-Gen Operator/i);
    expect(
      screen.getByText(/Zahid Hasan Emon orchestrates/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("not-home")).toBeNull();
  });
});
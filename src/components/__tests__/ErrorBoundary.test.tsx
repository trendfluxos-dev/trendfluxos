import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { ErrorBoundary } from "../ErrorBoundary";
import RouteErrorBoundaryWithContext from "../RouteErrorBoundary";

vi.mock("@/lib/errorLogger", () => ({
  logClientError: vi.fn(),
  newCorrelationId: () => "cid_test_1234",
  setLastCorrelationId: vi.fn(),
}));

vi.mock("@/lib/sentry", () => ({
  getSentry: () => null,
}));

const Boom = ({ when = true }: { when?: boolean }) => {
  if (when) throw new Error("kaboom");
  return <div>safe</div>;
};

beforeEach(() => {
  // Silence the expected React error-boundary console noise so test output
  // stays clean while still exercising the boundary path.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ErrorBoundary (global)", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>app-shell-ok</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("app-shell-ok")).toBeInTheDocument();
  });

  it("renders the fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("logs to client_errors with a correlation id when it catches", async () => {
    const { logClientError } = await import("@/lib/errorLogger");
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(logClientError).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "ErrorBoundary",
        severity: "error",
        meta: expect.objectContaining({
          correlation_id: expect.any(String),
          boundary: "ErrorBoundary",
        }),
      }),
    );
  });
});

describe("RouteErrorBoundary (per-route)", () => {
  it("renders only the inline fallback while the shell stays interactive", () => {
    render(
      <MemoryRouter initialEntries={["/broken"]}>
        <header>
          <Link to="/safe">go-safe</Link>
        </header>
        <RouteErrorBoundaryWithContext>
          <Routes>
            <Route path="/broken" element={<Boom />} />
            <Route path="/safe" element={<div>safe-page</div>} />
          </Routes>
        </RouteErrorBoundaryWithContext>
        <footer>shell-footer</footer>
      </MemoryRouter>,
    );

    // Fallback is shown
    expect(screen.getByText(/this page hit a snag/i)).toBeInTheDocument();
    // Shell remained mounted and interactive
    expect(screen.getByText("shell-footer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go-safe/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
  });

  it("renders the route when there is no error", () => {
    render(
      <MemoryRouter initialEntries={["/safe"]}>
        <RouteErrorBoundaryWithContext>
          <Routes>
            <Route path="/safe" element={<div>safe-page</div>} />
          </Routes>
        </RouteErrorBoundaryWithContext>
      </MemoryRouter>,
    );
    expect(screen.getByText("safe-page")).toBeInTheDocument();
    expect(screen.queryByText(/this page hit a snag/i)).not.toBeInTheDocument();
  });

  it("logs route context (pathname) and a correlation id on catch", async () => {
    const { logClientError } = await import("@/lib/errorLogger");
    (logClientError as ReturnType<typeof vi.fn>).mockClear();

    render(
      <MemoryRouter initialEntries={["/broken?x=1"]}>
        <RouteErrorBoundaryWithContext>
          <Routes>
            <Route path="/broken" element={<Boom />} />
          </Routes>
        </RouteErrorBoundaryWithContext>
      </MemoryRouter>,
    );

    expect(logClientError).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "RouteErrorBoundary:/broken",
        severity: "error",
        meta: expect.objectContaining({
          correlation_id: expect.any(String),
          boundary: "RouteErrorBoundary",
          route: expect.objectContaining({ pathname: "/broken", search: "?x=1" }),
        }),
      }),
    );
  });

  it("Try again resets state and re-renders the (now-safe) subtree", () => {
    let shouldThrow = true;
    const Toggleable = () => {
      if (shouldThrow) throw new Error("first render fails");
      return <div>recovered</div>;
    };

    render(
      <MemoryRouter initialEntries={["/x"]}>
        <RouteErrorBoundaryWithContext>
          <Routes>
            <Route path="/x" element={<Toggleable />} />
          </Routes>
        </RouteErrorBoundaryWithContext>
      </MemoryRouter>,
    );

    expect(screen.getByText(/this page hit a snag/i)).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(screen.queryByText(/this page hit a snag/i)).not.toBeInTheDocument();
  });
});
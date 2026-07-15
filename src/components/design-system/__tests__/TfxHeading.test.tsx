import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TfxHeading } from "../TfxHeading";

describe("TfxHeading", () => {
  it("renders as <h2> by default with children", () => {
    render(<TfxHeading>Title</TfxHeading>);
    const h = screen.getByRole("heading", { name: /title/i, level: 2 });
    expect(h.tagName).toBe("H2");
  });

  it("renders semantic tag matching level prop", () => {
    render(<TfxHeading level={1}>Big</TfxHeading>);
    const h = screen.getByRole("heading", { level: 1 });
    expect(h.tagName).toBe("H1");
    expect(h.className).toMatch(/text-4xl/);
  });

  it("`as` overrides semantic tag but keeps level styling", () => {
    render(
      <TfxHeading level={1} as="h3">
        Overridden
      </TfxHeading>,
    );
    const h = screen.getByRole("heading", { level: 3 });
    expect(h.tagName).toBe("H3");
    expect(h.className).toMatch(/text-4xl/);
  });

  it("applies tone variant classes", () => {
    render(<TfxHeading tone="primary">P</TfxHeading>);
    const h = screen.getByRole("heading");
    expect(h.className).toMatch(/text-primary/);
  });

  it("merges custom className", () => {
    render(<TfxHeading className="my-h">X</TfxHeading>);
    expect(screen.getByRole("heading")).toHaveClass("my-h");
  });
});
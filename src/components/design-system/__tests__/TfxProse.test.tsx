import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TfxProse, TfxEyebrow } from "../TfxProse";

describe("TfxProse", () => {
  it("renders as <p> by default with children and default classes", () => {
    render(<TfxProse>Body copy</TfxProse>);
    const el = screen.getByText("Body copy");
    expect(el.tagName).toBe("P");
    expect(el.className).toMatch(/text-muted-foreground/);
    expect(el.className).toMatch(/max-w-prose/);
  });

  it("renders with custom element via `as`", () => {
    render(<TfxProse as="div">D</TfxProse>);
    expect(screen.getByText("D").tagName).toBe("DIV");
  });

  it("applies size, tone, and measure variants", () => {
    render(
      <TfxProse size="lg" tone="strong" measure="full">
        X
      </TfxProse>,
    );
    const el = screen.getByText("X");
    expect(el.className).toMatch(/text-base/);
    expect(el.className).toMatch(/text-foreground/);
    expect(el.className).not.toMatch(/max-w-prose/);
  });

  it("merges custom className", () => {
    render(<TfxProse className="my-prose">Y</TfxProse>);
    expect(screen.getByText("Y")).toHaveClass("my-prose");
  });
});

describe("TfxEyebrow", () => {
  it("renders children with uppercase tracking and primary token", () => {
    render(<TfxEyebrow>Label</TfxEyebrow>);
    const el = screen.getByText("Label");
    expect(el.tagName).toBe("P");
    expect(el.className).toMatch(/uppercase/);
    expect(el.className).toMatch(/tracking-\[0\.3em\]/);
    expect(el.className).toMatch(/text-primary/);
  });

  it("merges custom className", () => {
    render(<TfxEyebrow className="my-eb">L</TfxEyebrow>);
    expect(screen.getByText("L")).toHaveClass("my-eb");
  });
});
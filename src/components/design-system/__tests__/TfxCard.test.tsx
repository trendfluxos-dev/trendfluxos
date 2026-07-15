import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TfxCard } from "../TfxCard";

describe("TfxCard", () => {
  it("renders children in a div", () => {
    render(<TfxCard>hello card</TfxCard>);
    const el = screen.getByText("hello card");
    expect(el.parentElement?.tagName).toBe("DIV");
  });

  it("applies default variant border classes", () => {
    const { container } = render(<TfxCard>x</TfxCard>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/border/);
    expect(root.className).toMatch(/bg-card/);
  });

  it("applies elevated variant with shadow", () => {
    const { container } = render(<TfxCard variant="elevated">x</TfxCard>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/shadow-\[/);
  });

  it("applies padding variant classes", () => {
    const { container } = render(<TfxCard padding="xl">x</TfxCard>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/p-8/);
  });

  it("wraps content in an inner surface for gradient-border variant", () => {
    const { container } = render(
      <TfxCard variant="gradient-border" padding="md">
        <span>inner</span>
      </TfxCard>,
    );
    const root = container.firstChild as HTMLElement;
    // outer keeps no padding, has p-[1px] gradient rim
    expect(root.className).toMatch(/p-\[1px\]/);
    const inner = screen.getByText("inner").parentElement as HTMLElement;
    expect(inner.className).toMatch(/bg-card/);
    expect(inner.className).toMatch(/p-5/);
  });

  it("merges custom className", () => {
    const { container } = render(<TfxCard className="my-card">x</TfxCard>);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("my-card");
  });
});
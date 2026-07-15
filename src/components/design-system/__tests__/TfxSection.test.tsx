import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TfxSection } from "../TfxSection";

describe("TfxSection", () => {
  it("renders a <section> element with children by default", () => {
    const { container } = render(
      <TfxSection>
        <p>content</p>
      </TfxSection>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe("SECTION");
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies tone and padding variants", () => {
    const { container } = render(
      <TfxSection tone="muted" padding="xl">
        x
      </TfxSection>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/bg-muted/);
    expect(root.className).toMatch(/py-20/);
  });

  it("applies divide border when divide=true", () => {
    const { container } = render(<TfxSection divide>x</TfxSection>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/border-t/);
  });

  it("wraps children in a max-width container", () => {
    const { container } = render(<TfxSection container="sm">x</TfxSection>);
    const inner = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(inner.className).toMatch(/max-w-2xl/);
    expect(inner.className).toMatch(/mx-auto/);
  });

  it("renders as custom element via as prop", () => {
    const { container } = render(<TfxSection as="div">x</TfxSection>);
    expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
  });

  it("merges custom className", () => {
    const { container } = render(<TfxSection className="my-section">x</TfxSection>);
    expect(container.firstChild as HTMLElement).toHaveClass("my-section");
  });
});
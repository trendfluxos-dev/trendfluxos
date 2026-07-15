import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TfxButton } from "../TfxButton";

describe("TfxButton", () => {
  it("renders a button with children", () => {
    render(<TfxButton>Click me</TfxButton>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("applies primary variant (default) mapping to underlying default button", () => {
    render(<TfxButton>Primary</TfxButton>);
    const btn = screen.getByRole("button");
    // shadcn default variant uses bg-primary token
    expect(btn.className).toMatch(/bg-primary/);
  });

  it("applies outline variant classes", () => {
    render(<TfxButton variant="outline">Outline</TfxButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/border/);
  });

  it("applies size mapping (lg)", () => {
    render(<TfxButton size="lg">Big</TfxButton>);
    const btn = screen.getByRole("button");
    // shadcn lg size includes h-11 or similar height token
    expect(btn.className).toMatch(/h-1[12]|h-\[/);
  });

  it("renders as anchor when asChild is used", () => {
    render(
      <TfxButton asChild>
        <a href="/x">Link</a>
      </TfxButton>,
    );
    const link = screen.getByRole("link", { name: /link/i });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });

  it("disables the button and merges custom className", () => {
    render(
      <TfxButton disabled className="custom-x">
        Nope
      </TfxButton>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("custom-x");
  });
});
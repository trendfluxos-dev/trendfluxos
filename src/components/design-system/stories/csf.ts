/**
 * Minimal local CSF3 type shims.
 *
 * Storybook is not yet installed in this repo, but the design-system
 * stories are written in the standard Component Story Format v3 shape
 * so they drop straight into `@storybook/react-vite` when Storybook is
 * added. These shims keep the story files typechecked in the meantime
 * without pulling the Storybook toolchain into the bundle.
 *
 * When Storybook is installed, delete this file and change the story
 * imports from `./csf` to `@storybook/react`.
 */
import type { ComponentProps, ReactElement } from "react";

// Accepts any React component (function, class, or forwardRef).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = (...args: any[]) => any;

export interface Meta<TComponent extends AnyComponent> {
  title?: string;
  component: TComponent;
  tags?: string[];
  parameters?: Record<string, unknown>;
  argTypes?: Partial<
    Record<keyof ComponentProps<TComponent>, Record<string, unknown>>
  >;
  args?: Partial<ComponentProps<TComponent>>;
}

export interface StoryObj<TMeta extends Meta<AnyComponent>> {
  name?: string;
  args?: Partial<ComponentProps<TMeta["component"]>>;
  parameters?: Record<string, unknown>;
  render?: (args: ComponentProps<TMeta["component"]>) => ReactElement;
}
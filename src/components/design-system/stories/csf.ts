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
import type { ComponentProps, ComponentType, ReactElement } from "react";

export interface Meta<TComponent extends ComponentType<never>> {
  title?: string;
  component: TComponent;
  tags?: string[];
  parameters?: Record<string, unknown>;
  argTypes?: Partial<
    Record<keyof ComponentProps<TComponent>, Record<string, unknown>>
  >;
  args?: Partial<ComponentProps<TComponent>>;
}

export interface StoryObj<TMeta extends Meta<ComponentType<never>>> {
  name?: string;
  args?: Partial<ComponentProps<TMeta["component"]>>;
  parameters?: Record<string, unknown>;
  render?: (
    args: ComponentProps<TMeta["component"]>,
  ) => ReactElement;
}
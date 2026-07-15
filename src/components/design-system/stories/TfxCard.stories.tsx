import { TfxCard } from "../TfxCard";
import { TfxHeading } from "../TfxHeading";
import { TfxProse } from "../TfxProse";
import type { Meta, StoryObj } from "./csf";

const meta: Meta<typeof TfxCard> = {
  title: "Design System/TfxCard",
  component: TfxCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Surface container with variant (default / elevated / glass / outlined / gradient-border) and padding (none / sm / md / lg / xl). All colors are token-driven — never hardcode.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "elevated", "glass", "outlined", "gradient-border"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
    },
    interactive: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Sample = () => (
  <>
    <TfxHeading level={4}>High-ticket conversion</TfxHeading>
    <TfxProse className="mt-2">
      A short paragraph inside the card demonstrates how tokens map to
      background, border, and typography without any hardcoded color.
    </TfxProse>
  </>
);

export const Default: Story = { render: () => (<TfxCard><Sample /></TfxCard>) };
export const Elevated: Story = { render: () => (<TfxCard variant="elevated"><Sample /></TfxCard>) };
export const Glass: Story = { render: () => (<TfxCard variant="glass"><Sample /></TfxCard>) };
export const Outlined: Story = { render: () => (<TfxCard variant="outlined"><Sample /></TfxCard>) };
export const GradientBorder: Story = {
  name: "Gradient border",
  render: () => (<TfxCard variant="gradient-border"><Sample /></TfxCard>),
};
export const Interactive: Story = {
  render: () => (
    <TfxCard interactive><Sample /></TfxCard>
  ),
};

export const PaddingScale: Story = {
  name: "Padding scale",
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["sm", "md", "lg", "xl"] as const).map((p) => (
        <TfxCard key={p} padding={p}>
          <TfxHeading level={6}>padding = {p}</TfxHeading>
        </TfxCard>
      ))}
    </div>
  ),
};
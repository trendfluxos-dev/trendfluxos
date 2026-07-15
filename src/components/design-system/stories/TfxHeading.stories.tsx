import { TfxHeading } from "../TfxHeading";
import type { Meta, StoryObj } from "./csf";

const meta: Meta<typeof TfxHeading> = {
  title: "Design System/TfxHeading",
  component: TfxHeading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Typographic heading with a locked visual scale (levels 1–6). Use `as` to override the semantic tag when the visual size and the outline hierarchy disagree.",
      },
    },
  },
  argTypes: {
    level: { control: { type: "inline-radio" }, options: [1, 2, 3, 4, 5, 6] },
    tone: { control: "select", options: ["default", "muted", "primary", "gradient"] },
    as: { control: "select", options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  },
  args: { children: "Systems he built" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Level1: Story = { args: { level: 1 } };
export const Level2: Story = { args: { level: 2 } };
export const Level3: Story = { args: { level: 3 } };

export const AllLevels: Story = {
  name: "All levels",
  render: () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((lvl) => (
        <TfxHeading key={lvl} level={lvl as 1}>
          Level {lvl} — Systems he built
        </TfxHeading>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="space-y-2">
      <TfxHeading tone="default">Default tone</TfxHeading>
      <TfxHeading tone="muted">Muted tone</TfxHeading>
      <TfxHeading tone="primary">Primary tone</TfxHeading>
      <TfxHeading tone="gradient">Gradient tone</TfxHeading>
    </div>
  ),
};
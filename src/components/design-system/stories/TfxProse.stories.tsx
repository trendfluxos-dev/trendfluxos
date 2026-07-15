import { TfxProse, TfxEyebrow } from "../TfxProse";
import { TfxHeading } from "../TfxHeading";
import type { Meta, StoryObj } from "./csf";

const meta: Meta<typeof TfxProse> = {
  title: "Design System/TfxProse",
  component: TfxProse,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Body copy wrapper with tuned line-height and measure. Pair with TfxEyebrow above a TfxHeading for standard section intros.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    tone: { control: "select", options: ["default", "strong", "subtle"] },
    measure: { control: "select", options: ["narrow", "wide", "full"] },
  },
  args: {
    children:
      "A short paragraph of realistic body copy so QA can eyeball the leading, tracking, and measure on every size and tone.",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <TfxProse key={size} size={size}>
          size = {size} — pack my box with five dozen liquor jugs.
        </TfxProse>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="space-y-3">
      <TfxProse tone="default">Default muted-foreground tone.</TfxProse>
      <TfxProse tone="strong">Strong foreground tone.</TfxProse>
      <TfxProse tone="subtle">Subtle 80% opacity tone.</TfxProse>
    </div>
  ),
};

export const WithEyebrowAndHeading: Story = {
  name: "Eyebrow + heading + prose",
  render: () => (
    <div className="space-y-3">
      <TfxEyebrow>Case study</TfxEyebrow>
      <TfxHeading level={2}>How a lean team shipped in 21 days</TfxHeading>
      <TfxProse>
        Standard pattern for section intros: TfxEyebrow → TfxHeading → TfxProse.
      </TfxProse>
    </div>
  ),
};
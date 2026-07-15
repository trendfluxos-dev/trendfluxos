import { TfxSection } from "../TfxSection";
import { TfxHeading } from "../TfxHeading";
import { TfxProse, TfxEyebrow } from "../TfxProse";
import type { Meta, StoryObj } from "./csf";

const meta: Meta<typeof TfxSection> = {
  title: "Design System/TfxSection",
  component: TfxSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Page-section wrapper: applies the container width, vertical padding scale, and background tone. Compose TfxCard / TfxHeading / TfxProse inside.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["default", "muted", "inverted", "gradient"] },
    padding: { control: "select", options: ["sm", "md", "lg", "xl"] },
    container: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    divide: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Sample = () => (
  <div className="space-y-3">
    <TfxEyebrow>Section</TfxEyebrow>
    <TfxHeading level={2}>Systems he built</TfxHeading>
    <TfxProse>
      Consistent container width and vertical rhythm across every page.
    </TfxProse>
  </div>
);

export const Default: Story = { render: () => (<TfxSection><Sample /></TfxSection>) };
export const Muted: Story = { render: () => (<TfxSection tone="muted"><Sample /></TfxSection>) };
export const Inverted: Story = { render: () => (<TfxSection tone="inverted"><Sample /></TfxSection>) };
export const Gradient: Story = { render: () => (<TfxSection tone="gradient"><Sample /></TfxSection>) };

export const Divided: Story = {
  render: () => (
    <>
      <TfxSection><Sample /></TfxSection>
      <TfxSection divide><Sample /></TfxSection>
    </>
  ),
};

export const ContainerWidths: Story = {
  name: "Container widths",
  render: () => (
    <>
      {(["sm", "md", "lg", "xl", "full"] as const).map((w) => (
        <TfxSection key={w} container={w} tone={w === "md" ? "muted" : "default"} padding="sm">
          <TfxHeading level={5}>container = {w}</TfxHeading>
        </TfxSection>
      ))}
    </>
  ),
};
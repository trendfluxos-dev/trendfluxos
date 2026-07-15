import { TfxButton } from "../TfxButton";
import type { Meta, StoryObj } from "./csf";

const meta: Meta<typeof TfxButton> = {
  title: "Design System/TfxButton",
  component: TfxButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system wrapper around the shadcn Button. Always prefer this in new pages so the semantic vocabulary (primary / secondary / ghost / outline / destructive / premium) and size ladder (sm / md / lg / xl / icon) stays consistent.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "outline", "destructive", "premium"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "icon"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Book strategy call",
    variant: "primary",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete workspace" },
};
export const Premium: Story = {
  args: { variant: "premium", children: "Enter the vault" },
};

export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TfxButton size="sm">Small</TfxButton>
      <TfxButton size="md">Medium</TfxButton>
      <TfxButton size="lg">Large</TfxButton>
      <TfxButton size="xl">Extra large</TfxButton>
      <TfxButton size="icon" aria-label="Close">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </TfxButton>
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div className="flex flex-wrap gap-3">
      <TfxButton variant="primary">Primary</TfxButton>
      <TfxButton variant="secondary">Secondary</TfxButton>
      <TfxButton variant="ghost">Ghost</TfxButton>
      <TfxButton variant="outline">Outline</TfxButton>
      <TfxButton variant="destructive">Destructive</TfxButton>
      <TfxButton variant="premium">Premium</TfxButton>
    </div>
  ),
};

export const AsLink: Story = {
  name: "asChild anchor",
  render: () => (
    <TfxButton asChild variant="outline">
      <a href="/founder">Read the founder dossier</a>
    </TfxButton>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
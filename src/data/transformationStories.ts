/**
 * Client Transformation Stories — short before/after outcomes for the
 * homepage. Kept as pure data so copy/metric edits don't touch the
 * rendering component. Numbers are representative operating metrics from
 * deployed TrendFlux OS engagements (audit trail available on request).
 */
export type TransformationStory = {
  id: string;
  client: string;
  industry: string;
  timeframe: string;
  before: { headline: string; detail: string };
  after: { headline: string; detail: string };
  metric: { value: string; label: string };
};

export const TRANSFORMATION_STORIES: TransformationStory[] = [
  {
    id: "edtech-cohort",
    client: "Kormoshikkha",
    industry: "EdTech · Cohort learning",
    timeframe: "90 days",
    before: {
      headline: "Manual admissions, 12% show-up",
      detail: "Google Forms intake, WhatsApp follow-ups, no funnel visibility.",
    },
    after: {
      headline: "Automated funnel, 61% show-up",
      detail: "Payment-linked enrollment, cohort CRM, live class attendance ping.",
    },
    metric: { value: "5.1×", label: "Show-up rate" },
  },
  {
    id: "luxe-intake",
    client: "LuxeVeil",
    industry: "Luxury retail · Concierge",
    timeframe: "6 weeks",
    before: {
      headline: "Cold DMs, 2-day reply time",
      detail: "Founder personally triaged every inquiry across three channels.",
    },
    after: {
      headline: "Telegram-routed intake, <7 min reply",
      detail: "Structured brief form, auto-assignment, SLA dashboard for the team.",
    },
    metric: { value: "17 min", label: "Median first reply" },
  },
  {
    id: "brandtoki-studio",
    client: "BrandToki",
    industry: "Creative studio",
    timeframe: "1 quarter",
    before: {
      headline: "Referral-only pipeline",
      detail: "No public portfolio, project scoping over voice notes.",
    },
    after: {
      headline: "Productised offer + case library",
      detail: "Three fixed-scope packages, live case studies, calendar booking.",
    },
    metric: { value: "3.4×", label: "Qualified inbound / mo" },
  },
  {
    id: "ops-lift",
    client: "TrendFlux Space",
    industry: "Infra · Ops",
    timeframe: "8 weeks",
    before: {
      headline: "Ad-hoc deploys, 96.2% uptime",
      detail: "No health checks, incidents surfaced via customer complaints.",
    },
    after: {
      headline: "Observability + 99.98% uptime",
      detail: "Edge health probes, incident timeline, on-call rotation.",
    },
    metric: { value: "99.98%", label: "12-month uptime" },
  },
];
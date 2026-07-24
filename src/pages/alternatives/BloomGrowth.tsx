import { Link } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import {
  TfxSection,
  TfxCard,
  TfxHeading,
  TfxProse,
  TfxEyebrow,
} from "@/components/design-system";

const CANONICAL = "https://trendflux.digital/alternatives/bloom-growth";

type Row = {
  capability: string;
  bloom: { supported: boolean; note: string };
  trendflux: { supported: boolean; note: string };
};

const COMPARISON: Row[] = [
  {
    capability: "Operating framework",
    bloom: { supported: true, note: "EOS / Traction — manual meetings, scorecards, rocks" },
    trendflux: { supported: true, note: "AI-native OS — outcomes, agents, and playbooks in one graph" },
  },
  {
    capability: "AI automation",
    bloom: { supported: false, note: "Templates and spreadsheets, no native AI" },
    trendflux: { supported: true, note: "Built-in AI agents for content, outreach, analytics, and reporting" },
  },
  {
    capability: "Content & marketing engine",
    bloom: { supported: false, note: "Not included — bring your own tools" },
    trendflux: { supported: true, note: "Ships with a content engine, campaign OS, and press workflows" },
  },
  {
    capability: "Weekly meeting cadence",
    bloom: { supported: true, note: "L10 meetings — human-led, manually tracked" },
    trendflux: { supported: true, note: "Automated pulse checks with AI meeting notes and next-step routing" },
  },
  {
    capability: "KPI scorecards",
    bloom: { supported: true, note: "Static weekly scorecards" },
    trendflux: { supported: true, note: "Live KPI graph auto-fed from ops, sales, and content data" },
  },
  {
    capability: "Implementation cost",
    bloom: { supported: true, note: "$149–$249/mo + certified coach fees" },
    trendflux: { supported: true, note: "Bundled inside TrendFlux OS — no coach retainer required" },
  },
  {
    capability: "Best for",
    bloom: { supported: true, note: "Legacy SMBs already inside the EOS coaching network" },
    trendflux: { supported: true, note: "Modern founders scaling with AI, content, and lean ops" },
  },
];

export default function AlternativesBloomGrowth() {
  useSeo({
    title: "TrendFlux OS vs Bloom Growth: The AI-Native Alternative for Modern Founders",
    description:
      "Compare TrendFlux OS and Bloom Growth (EOS / Traction). See how AI-native automation replaces manual scorecards, L10 meetings, and coach retainers for founders scaling in 2026.",
    canonical: CANONICAL,
    type: "article",
  });

  useJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best AI alternative to Bloom Growth?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TrendFlux OS is an AI-native operating system for founders. It replaces the manual EOS/Traction workflow used by Bloom Growth with automated scorecards, AI agents, and a built-in content and outreach engine — without a certified coach retainer.",
        },
      },
      {
        "@type": "Question",
        name: "How is TrendFlux OS different from EOS or Traction tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EOS-style tools like Bloom Growth digitise manual rituals — L10 meetings, rocks, weekly scorecards. TrendFlux OS treats those rituals as jobs an AI agent can run: it collects the data, drafts the report, routes the next action, and keeps the KPI graph live.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a coach to run TrendFlux OS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. TrendFlux OS ships with playbooks and AI copilots, so founders can adopt it without a certified implementer. Optional strategy calls are available with the TrendFlux team.",
        },
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <TfxSection className="pt-24 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <TfxEyebrow>Alternatives · Bloom Growth</TfxEyebrow>
            <TfxHeading level={1} className="mt-4 text-balance">
              TrendFlux OS vs Bloom Growth: the AI-native alternative for modern founders
            </TfxHeading>
            <TfxProse className="mt-6 text-lg text-muted-foreground">
              Bloom Growth digitises the EOS/Traction playbook — manual meetings, static scorecards, and
              certified coach retainers. TrendFlux OS replaces that stack with AI agents, live KPI graphs,
              and an integrated content and outreach engine, so a lean founding team can run the whole
              operating system without hiring an implementer.
            </TfxProse>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/project-lead"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Book a strategy call <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/ecosystem"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Explore the TrendFlux OS layers
              </Link>
            </div>
          </div>
        </TfxSection>

        <TfxSection>
          <div className="mx-auto max-w-5xl">
            <TfxHeading level={2} className="text-center">
              Feature-by-feature comparison
            </TfxHeading>
            <TfxProse className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              A side-by-side look at how each platform handles the day-to-day operating rhythm.
            </TfxProse>

            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <div className="col-span-4">Capability</div>
                <div className="col-span-4">Bloom Growth (EOS)</div>
                <div className="col-span-4">TrendFlux OS</div>
              </div>
              <ul>
                {COMPARISON.map((row, i) => (
                  <li
                    key={row.capability}
                    className={`grid gap-3 border-border px-5 py-5 md:grid-cols-12 md:gap-6 md:py-4 ${
                      i > 0 ? "border-t" : ""
                    }`}
                  >
                    <div className="md:col-span-4">
                      <p className="text-sm font-semibold text-foreground">{row.capability}</p>
                    </div>
                    <Cell data={row.bloom} label="Bloom Growth" />
                    <Cell data={row.trendflux} label="TrendFlux OS" highlight />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TfxSection>

        <TfxSection>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <TfxCard>
              <TfxEyebrow>Infrastructure layer</TfxEyebrow>
              <TfxHeading level={3} className="mt-2 text-xl">
                Data & ops on autopilot
              </TfxHeading>
              <TfxProse className="mt-2 text-sm text-muted-foreground">
                Native connectors keep KPIs, revenue, and content pipelines live — no more copy-pasting
                numbers into a weekly scorecard.
              </TfxProse>
            </TfxCard>
            <TfxCard>
              <TfxEyebrow>Intelligence layer</TfxEyebrow>
              <TfxHeading level={3} className="mt-2 text-xl">
                AI agents that ship work
              </TfxHeading>
              <TfxProse className="mt-2 text-sm text-muted-foreground">
                Purpose-built agents draft reports, route follow-ups, and surface blockers — turning
                EOS-style rituals into automated jobs.
              </TfxProse>
            </TfxCard>
            <TfxCard>
              <TfxEyebrow>Growth layer</TfxEyebrow>
              <TfxHeading level={3} className="mt-2 text-xl">
                Content + outreach built-in
              </TfxHeading>
              <TfxProse className="mt-2 text-sm text-muted-foreground">
                Traction alternatives stop at ops. TrendFlux OS ships with a content engine, campaign
                automation, and press workflows out of the box.
              </TfxProse>
            </TfxCard>
          </div>
        </TfxSection>

        <TfxSection>
          <div className="mx-auto max-w-3xl">
            <TfxHeading level={2}>Frequently asked questions</TfxHeading>
            <dl className="mt-8 space-y-6">
              <Faq
                q="What is the best AI alternative to Bloom Growth?"
                a="TrendFlux OS is an AI-native operating system for founders. It replaces the manual EOS/Traction workflow used by Bloom Growth with automated scorecards, AI agents, and a built-in content and outreach engine — without a certified coach retainer."
              />
              <Faq
                q="How is TrendFlux OS different from EOS or Traction tools?"
                a="EOS-style tools like Bloom Growth digitise manual rituals — L10 meetings, rocks, weekly scorecards. TrendFlux OS treats those rituals as jobs an AI agent can run: it collects the data, drafts the report, routes the next action, and keeps the KPI graph live."
              />
              <Faq
                q="Do I need a certified coach to run TrendFlux OS?"
                a="No. TrendFlux OS ships with playbooks and AI copilots, so founders can adopt it without a certified implementer. Optional strategy calls are available with the TrendFlux team."
              />
              <Faq
                q="Can I migrate from Bloom Growth to TrendFlux OS?"
                a="Yes. Bring your existing scorecards, rocks, and V/TO exports — the TrendFlux team maps them into the OS during onboarding, so you keep the rhythm your team already knows."
              />
            </dl>
          </div>
        </TfxSection>

        <TfxSection>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
            <TfxEyebrow>Ready to switch?</TfxEyebrow>
            <TfxHeading level={2} className="mt-3">
              Run your operating system on AI, not spreadsheets.
            </TfxHeading>
            <TfxProse className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Book a 30-minute walkthrough with the TrendFlux team and see how the Infrastructure,
              Intelligence, and Growth layers replace your EOS stack.
            </TfxProse>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/project-lead"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Book a strategy call <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                See services
              </Link>
            </div>
          </div>
        </TfxSection>
      </main>
      <Footer />
    </div>
  );
}

function Cell({
  data,
  label,
  highlight = false,
}: {
  data: Row["bloom"];
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="md:col-span-4">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
        {label}
      </p>
      <div className="flex items-start gap-2">
        {data.supported ? (
          <Check
            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
              highlight ? "text-primary" : "text-muted-foreground"
            }`}
            aria-hidden
          />
        ) : (
          <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden />
        )}
        <p className={`text-sm ${highlight ? "text-foreground" : "text-muted-foreground"}`}>{data.note}</p>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <dt className="text-base font-semibold text-foreground">{q}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</dd>
    </div>
  );
}
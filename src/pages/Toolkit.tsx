import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Sparkles,
  Library,
  Workflow,
  BarChart3,
  Briefcase,
  GraduationCap,
  Brain,
  Search,
  Layers,
  PaintBucket,
  LineChart,
  Cog,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/analytics";

const hubCategories = [
  { icon: GraduationCap, title: "System Modules", desc: "8 execution-grade systems, each with frameworks and templates." },
  { icon: Library, title: "Prompt Library", desc: "Production prompts for research, content, ops, and strategy." },
  { icon: Workflow, title: "Automation Systems", desc: "End-to-end SOPs and workflow blueprints, ready to ship." },
  { icon: BarChart3, title: "Data & Analytics Tools", desc: "Dashboards, attribution stacks, and decision frameworks." },
  { icon: Briefcase, title: "Portfolio Kit", desc: "Case study templates, proof assets, and pitch scripts." },
];

const modules = [
  {
    n: "01",
    icon: Brain,
    title: "Prompt Architect System",
    subtitle: "From user → AI operator",
    tools: [
      "Role-Task-Context-Format framework",
      "Zero-shot vs Few-shot templates",
      "AI Persona builder worksheet",
    ],
  },
  {
    n: "02",
    icon: Search,
    title: "Information Mining System",
    subtitle: "From data → insight",
    tools: [
      "Source triangulation checklist",
      "Deep research prompt chain",
      "Signal extraction template",
    ],
  },
  {
    n: "03",
    icon: Layers,
    title: "AI Strategy Selection Matrix",
    subtitle: "From tools → strategy",
    tools: [
      "Model selection decision tree",
      "Use-case mapping canvas",
      "Build vs buy scorecard",
    ],
  },
  {
    n: "04",
    icon: Cog,
    title: "Brand Automation System",
    subtitle: "From manual → autonomous brand ops",
    tools: [
      "Content engine SOP",
      "Response automation playbook",
      "Brand voice prompt pack",
    ],
  },
  {
    n: "05",
    icon: PaintBucket,
    title: "Premium Visual Identity System",
    subtitle: "From generic → ownable visual world",
    tools: [
      "Identity audit framework",
      "Design system token sheet",
      "AI-assisted moodboard kit",
    ],
  },
  {
    n: "06",
    icon: LineChart,
    title: "Data-Driven Growth System",
    subtitle: "From guesswork → measured growth",
    tools: [
      "North-star metric canvas",
      "Attribution stack blueprint",
      "Weekly growth review template",
    ],
  },
  {
    n: "07",
    icon: Workflow,
    title: "Automation Blueprint System",
    subtitle: "From tasks → systems",
    tools: [
      "Workflow mapping template",
      "n8n / Make starter recipes",
      "ROI of automation calculator",
    ],
  },
  {
    n: "08",
    icon: Rocket,
    title: "Master Project & Portfolio System",
    subtitle: "From learner → high-ticket operator",
    tools: [
      "Case study story framework",
      "Pitch deck + proof asset kit",
      "High-ticket offer builder",
    ],
  },
];

const outcomes = [
  "AI Growth Operator",
  "Automation Strategist",
  "Data-driven decision maker",
  "High-ticket service provider",
];

const Toolkit = () => {
  useSeo({
    title: "Growth Operator Toolkit Hub — TrendFlux Digital",
    description:
      "A modular execution system for AI-powered growth operators. 8 system modules, prompt library, automation blueprints, and portfolio kit — an execution OS, not a course.",
    canonical: `${BRAND.url}/toolkit`,
  });

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 h-[520px] w-[520px] bg-primary/15 blur-[160px]" />
        <div className="absolute bottom-0 left-0 h-[520px] w-[520px] bg-gold/10 blur-[160px]" />
      </div>

      {/* top bar */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12 lg:px-20">
        <Link to="/" className="font-display text-base font-bold tracking-tight">
          <span>{BRAND.nameLead}</span>{" "}
          <span className="text-gradient">{BRAND.nameTrail}</span>
        </Link>
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-gold"
        >
          ← Back to home
        </Link>
      </header>

      {/* hero */}
      <section className="relative px-6 pb-16 pt-12 md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Growth Execution OS
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Growth Operator{" "}
            <span className="text-gradient">Toolkit Hub</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/70 md:text-lg">
            A modular execution system for AI-powered growth operators.
            A centralized hub of systems, prompts, automations, and playbooks
            you can execute from day one.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#hub"
              onClick={() => track("toolkit_cta_click", { source: "toolkit_hero", cta: "access" })}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_hsl(var(--gold)/0.55)]"
            >
              Access Toolkit Hub
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#modules"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-semibold text-foreground/85 transition-colors hover:border-gold/40 hover:text-gold"
            >
              Browse system modules
            </a>
          </div>
        </div>
      </section>

      {/* central hub */}
      <section id="hub" className="relative px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">— Central Resource Hub</p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              One dashboard. <span className="text-gradient">Every system you need.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {hubCategories.map((c) => {
              const Icon = c.icon;
              return (
                <article
                  key={c.title}
                  className="group glass-strong relative overflow-hidden rounded-2xl border border-foreground/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_50px_-20px_hsl(var(--gold)/0.4)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">{c.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* system modules */}
      <section id="modules" className="relative px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">— System Modules</p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              8 systems. <span className="text-gradient">Each a transformation.</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <article
                  key={m.n}
                  className="group glass-strong flex flex-col rounded-2xl border border-foreground/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_-20px_hsl(var(--primary)/0.45)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm text-foreground/40">{m.n}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold leading-snug tracking-tight">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold">{m.subtitle}</p>

                  <ul className="mt-5 space-y-2.5 text-[13px] text-foreground/75">
                    {m.tools.map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => track("toolkit_module_open", { module: m.title })}
                    className="group/cta mt-6 inline-flex w-full items-center justify-between gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/15"
                  >
                    <span>Open Module</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* outcomes */}
      <section className="relative px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border border-gold/25 glass-strong p-10 md:p-14">
            <div className="absolute -top-24 -right-24 h-[360px] w-[360px] bg-gold/15 blur-[140px]" aria-hidden />
            <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] bg-primary/15 blur-[140px]" aria-hidden />
            <div className="relative">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">— Output</p>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                What you will <span className="text-gradient">become</span>.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {outcomes.map((o) => (
                  <div
                    key={o}
                    className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background/40 p-5 backdrop-blur"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <span className="text-sm font-medium text-foreground/90">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="relative px-6 py-12 md:px-12 lg:px-20 border-t border-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-sm">
            <span className="font-display font-semibold">{BRAND.nameLead}</span>{" "}
            <span className="text-foreground/55">{BRAND.nameTrail}</span>
            <span className="mx-3 text-foreground/25">·</span>
            <span className="text-foreground/55">Growth Operator Toolkit Hub</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/65">
            <Link to="/portfolio" className="hover:text-gold transition-colors">Portfolio</Link>
            <Link to="/project-lead" className="hover:text-gold transition-colors">Contact</Link>
            <Link to="/enterprise" className="hover:text-gold transition-colors">Enterprise</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Toolkit;
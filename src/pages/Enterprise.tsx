import { ArrowRight, ShieldCheck, Workflow, LayoutDashboard, Database, Boxes, KeyRound, ExternalLink } from "lucide-react";
import enterpriseMark from "@/assets/trendflux-enterprise-mark.webp";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { ENTERPRISE } from "@/config/enterprise";
import { track } from "@/lib/analytics";
import EnterpriseDemoForm from "@/components/EnterpriseDemoForm";

const features = [
  {
    icon: KeyRound,
    title: "Auth & Role Management",
    body: "Google + email sign-in with role-based access — Manager, Finance, HR, Auditor, Admin and CEO. Promote, restrict and audit every workspace seat.",
  },
  {
    icon: LayoutDashboard,
    title: "Executive Dashboard",
    body: "A single command surface for KPIs, approvals and operational health. Built for CEOs who need clarity, not noise.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    body: "ERP / DSS pipelines that route requests, approvals and SLAs automatically — driven by master data, not tribal knowledge.",
  },
  {
    icon: Database,
    title: "Master Data Management",
    body: "One canonical source of truth for vendors, employees, products and policies — every module reads from the same spine.",
  },
  {
    icon: ShieldCheck,
    title: "Blockchain-style Audit Ledger",
    body: "Tamper-evident event log with hash-chained records for compliance, vendor tracking and dispute resolution.",
  },
  {
    icon: Boxes,
    title: "Compliance & Vendor Tracking",
    body: "Continuous compliance monitoring, vendor performance scoring and risk flags surfaced where decisions are made.",
  },
] as const;

const openPortal = (location: string) => {
  track("enterprise_portal_open", { location, url: ENTERPRISE.portalUrl });
};

const Enterprise = () => {
  useSeo({
    title: `${ENTERPRISE.name} — Enterprise Operating System`,
    description: ENTERPRISE.description,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 grid-dots opacity-40" aria-hidden />
        <div className="absolute top-32 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" aria-hidden />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/10 blur-3xl animate-float [animation-delay:2s]" aria-hidden />

        <div className="relative max-w-6xl mx-auto text-center animate-fade-up">
          <img
            src={enterpriseMark}
            alt="TrendFlux Enterprise Control"
            className="mx-auto h-20 md:h-24 w-auto object-contain mb-6 drop-shadow-[0_0_25px_hsl(var(--primary)/0.25)]"
          />
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary mb-8">
            <ShieldCheck className="w-3.5 h-3.5" />
            {ENTERPRISE.tagline}
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-5xl mx-auto">
            <span className="text-gradient">Enterprise Control</span> for
            <br className="hidden md:block" /> brands that operate at scale
          </h1>

          <p className="mt-7 text-foreground/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {ENTERPRISE.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={ENTERPRISE.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => openPortal("enterprise_hero")}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 bg-gradient-cyan text-primary-foreground hover:shadow-cyan hover:-translate-y-0.5"
            >
              Open Enterprise Portal
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#request-demo"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 border border-foreground/20 bg-transparent text-foreground hover:bg-foreground/10 hover:border-primary/50"
            >
              Request Demo
            </a>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-foreground/40">
            <span>ERP / DSS</span>
            <span className="w-1 h-1 rounded-full bg-foreground/20" />
            <span>AI Analytics</span>
            <span className="w-1 h-1 rounded-full bg-foreground/20" />
            <span>Compliance</span>
            <span className="w-1 h-1 rounded-full bg-foreground/20" />
            <span>Audit Ledger</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-10 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Platform</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              One operating system for the <span className="text-gradient">whole organisation</span>
            </h2>
            <p className="mt-4 text-foreground/70 leading-relaxed">
              Six tightly integrated modules replace a dozen disconnected tools — every action is governed,
              logged and auditable.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass rounded-2xl p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-foreground/65 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2">
                <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Live Portal</p>
                <h3 className="font-display text-2xl md:text-3xl font-bold">
                  Sign in to your workspace
                </h3>
                <p className="mt-3 text-foreground/65 leading-relaxed">
                  New here? After signup you'll start with the Manager role — an Admin or CEO can promote
                  you to Finance, HR, Auditor, Admin or CEO from Roles &amp; Access.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={ENTERPRISE.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => openPortal("enterprise_preview_signin")}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 bg-gradient-cyan text-primary-foreground hover:shadow-cyan hover:-translate-y-0.5"
                  >
                    Sign in <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={ENTERPRISE.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => openPortal("enterprise_preview_signup")}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 border border-foreground/20 bg-transparent text-foreground hover:bg-foreground/10 hover:border-primary/50"
                  >
                    Create workspace
                  </a>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-8 text-center">
                  <img
                    src={enterpriseMark}
                    alt="TrendFlux Enterprise Control"
                    className="mx-auto h-14 w-auto object-contain mb-4"
                  />
                  <p className="font-display text-xl font-semibold">Enterprise Control</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-foreground/40 mt-2">
                    {ENTERPRISE.tagline}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-[11px] uppercase tracking-[0.2em] text-foreground/50">
                    <div className="rounded-lg border border-border/60 py-2">Manager</div>
                    <div className="rounded-lg border border-border/60 py-2">Finance</div>
                    <div className="rounded-lg border border-border/60 py-2">HR</div>
                    <div className="rounded-lg border border-border/60 py-2">Auditor</div>
                    <div className="rounded-lg border border-border/60 py-2">Admin</div>
                    <div className="rounded-lg border border-border/60 py-2 text-primary">CEO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="request-demo" className="px-6 lg:px-10 py-20 scroll-mt-28">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Demo</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            Request a <span className="text-gradient">private demo</span>
          </h2>
          <p className="mt-4 text-foreground/70 leading-relaxed">
            Tell us about your team and what you'd like to automate. We'll set up a
            walkthrough of Enterprise Control tailored to your workflow.
          </p>
        </div>
        <EnterpriseDemoForm />
      </section>

      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-10 md:p-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Ready to operate your business as a system?
          </h2>
          <p className="mt-4 text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Open the Enterprise Control portal to sign in — or scroll up to request a
            private demo with our team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={ENTERPRISE.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => openPortal("enterprise_footer_cta")}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 bg-gradient-cyan text-primary-foreground hover:shadow-cyan hover:-translate-y-0.5"
            >
              Open Enterprise Portal <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#request-demo"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 border border-foreground/20 bg-transparent text-foreground hover:bg-foreground/10 hover:border-primary/50"
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Enterprise;

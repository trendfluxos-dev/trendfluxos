import { Link } from "react-router-dom";
import { Settings, ArrowUpRight, Sparkles, Hexagon } from "lucide-react";

const cases = [
  "Education Brand Growth System (+45% Engagement)",
  "Retail Lead Generation Funnel (High-Intent Capture)",
  "Personal Brand Authority Engine (Organic Visibility)",
];

const modules = [
  {
    icon: Settings,
    title: "AI Business Automation",
    desc: "Automate repetitive workflows, client handling, and internal operations using AI-powered systems.",
  },
  {
    icon: ArrowUpRight,
    title: "Meta Ads & Lead Gen",
    desc: "Build paid acquisition systems that attract qualified leads and convert attention into revenue.",
  },
  {
    icon: Sparkles,
    title: "CRM & WhatsApp Automation",
    desc: "Connect lead capture, follow-up, booking, and client nurturing into one structured workflow.",
  },
  {
    icon: Hexagon,
    title: "Growth Analytics",
    desc: "Track performance, identify growth gaps, and make better decisions through clear KPI dashboards.",
  },
];

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-glow/15 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-gold/10 blur-[160px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-7xl rounded-full glass-strong">
        <div className="flex items-center justify-between px-5 md:px-8 py-4">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            TrendFlux <span className="text-gradient">Digital</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-foreground/70">
            <a href="#systems" className="hover:text-gold transition-colors">
              Systems
            </a>
            <a href="#cases" className="hover:text-gold transition-colors">
              Case Studies
            </a>
            <a href="#modules" className="hover:text-gold transition-colors">
              Modules
            </a>
            <Link to="/project-lead" className="hover:text-gold transition-colors">
              Project Lead
            </Link>
          </div>

          <a
            href="#book"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold transition hover:scale-105"
          >
            Book Strategy Call
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="systems"
        className="relative flex min-h-screen items-center px-6 pt-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl text-center animate-fade-up">
          <div className="mb-6 inline-flex glass rounded-full px-5 py-2 text-sm text-foreground/70">
            AI-Powered Digital Growth & Automation Consultancy
          </div>

          <h1 className="font-display mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Architecting{" "}
            <span className="text-gradient">AI-Powered Digital Growth</span>{" "}
            Systems.
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-foreground/60 md:text-xl">
            We combine AI automation, paid media, and CRM workflows to build
            scalable business ecosystems that compound over time.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#book"
              className="rounded-full bg-gold px-8 py-4 font-semibold text-gold-foreground shadow-gold transition hover:scale-105"
            >
              Book Strategy Call
            </a>
            <a
              href="#cases"
              className="rounded-full border border-foreground/15 px-8 py-4 font-semibold text-foreground transition hover:scale-105 hover:border-primary/60 hover:bg-foreground/5"
            >
              Explore Growth Systems
            </a>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="cases" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              The Operator&apos;s Casebook
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Systems built for visibility, leads, and authority.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {cases.map((item, index) => (
              <article
                key={item}
                className="group min-h-[300px] rounded-3xl glass glass-hover p-7"
              >
                <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl glass text-gold font-display font-bold">
                  0{index + 1}
                </div>
                <h3 className="font-display text-2xl font-bold leading-tight">
                  {item}
                </h3>
                <p className="mt-5 text-foreground/60">
                  A structured growth system designed to replace scattered
                  marketing activity with measurable execution.
                </p>
                <p className="mt-8 translate-y-2 text-sm font-semibold text-primary opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  View System →
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-primary">
              Service Modules
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Modular execution for modern growth.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-3xl glass p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-foreground/[0.07]"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{item.title}</h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-foreground/60">
                    {item.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer id="book" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] glass-strong p-8 text-center md:p-16">
          <p className="mx-auto max-w-3xl font-display text-2xl font-semibold leading-snug text-foreground md:text-4xl">
            The Operator&apos;s Promise: Your business does not need more random
            content. <span className="text-gradient">It needs a growth system.</span>
          </p>
          <a
            href="https://wa.me/message/5GSNUYK6CSDCN1"
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex rounded-full bg-gold px-9 py-4 font-bold text-gold-foreground shadow-gold transition hover:scale-105"
          >
            Book Your Growth Session Today
          </a>
        </div>

        {/* Contact block */}
        <div className="mx-auto mt-12 max-w-7xl border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-foreground/60">
            <a
              href="https://www.linkedin.com/in/zhemongrowth"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
            >
              LinkedIn: /in/zhemongrowth
            </a>
            <span className="text-foreground/20">·</span>
            <a
              href="https://www.facebook.com/zhemongrowth/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
            >
              Facebook: /zhemongrowth
            </a>
            <span className="text-foreground/20">·</span>
            <a
              href="https://www.youtube.com/@zhemongrowth"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
            >
              YouTube: @zhemongrowth
            </a>
            <span className="text-foreground/20">·</span>
            <a
              href="https://wa.me/message/5GSNUYK6CSDCN1"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
            >
              WhatsApp: +8801756004037
            </a>
            <span className="text-foreground/20">·</span>
            <a
              href="mailto:zhemongrowth@gmail.com"
              className="hover:text-gold transition-colors"
            >
              zhemongrowth@gmail.com
            </a>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 text-sm text-foreground/50 md:flex-row">
            <p className="font-semibold text-foreground">TrendFlux Digital</p>
            <p>© 2026 TrendFlux Digital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;

import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Linkedin,
  Award,
  Sparkles,
  Facebook,
  Youtube,
  Mail,
  MessageCircle,
  MapPin,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import emonPortrait from "@/assets/zahid-hasan-emon.jpg";

const metrics = [
  { value: "4.85L+", label: "Organic Views" },
  { value: "82%", label: "Organic Reach" },
  { value: "45%+", label: "Engagement Growth" },
];

const expertise = [
  {
    title: "AI & Business Automation",
    description:
      "GoHighLevel (GHL) workflows, Make.com and webhook integrations, automated sales and lead pipelines built with ChatGPT and Lovable.",
  },
  {
    title: "Business Consultancy",
    description:
      "7-phase, data-driven cash-flow systems and business operating systems optimized for retail and superstore environments.",
  },
  {
    title: "Digital Growth",
    description:
      "Data-driven marketing campaigns, Meta Ads management, and narrative-driven content branding for compounding reach.",
  },
  {
    title: "Leadership & Storytelling",
    description:
      "Narrative leadership, community orchestration, and human-centered corporate communication that builds brand authority.",
  },
];

const portfolio = [
  {
    title: "Pabna Nagarik Committee",
    tag: "Civic Brand · Bangladesh",
    description:
      "4.85 Lakh+ views, 82% organic reach, 166 designs and 22 reels published as a structured content engine.",
    metric: "4.85L+ Views",
  },
  {
    title: "TrendFlux Digital",
    tag: "Founder · Growth Studio",
    description:
      "AI-driven growth systems delivering 45%+ engagement growth across founder-led brands and consultancies.",
    metric: "45%+ Growth",
  },
  {
    title: "Debate Emon",
    tag: "Personal Brand · Education",
    description:
      "50,000+ youth engagement with 65% interaction growth via reels, long-form content and authority funnels.",
    metric: "65% Interaction",
  },
];

const leadership = [
  { role: "Organizing Secretary", org: "National Debate Federation Bangladesh (NDF-BD)" },
  { role: "Founder & Life Member", org: "Pabna Debate Society (PDS)" },
  { role: "Member & Organizer", org: "Pabna Nagarik Committee (Full Permanent Committee)" },
  { role: "Program Director", org: "Citizen Unity Gathering — Dhaka, March 2026" },
];

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/zhemongrowth" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/zhemongrowth/" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@zhemongrowth" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/8801756004037" },
  { icon: Mail, label: "Email", href: "mailto:zhemongrowth@gmail.com" },
];

const ProjectLead = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* HERO / ABOUT */}
      <section className="relative pt-36 pb-20 px-6 lg:px-10">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 grid-dots opacity-30" aria-hidden />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* IMAGE */}
          <div className="relative animate-fade-up">
            <div className="absolute -inset-4 bg-gradient-cyan/20 rounded-[2rem] blur-2xl" aria-hidden />
            <div className="relative rounded-[2rem] overflow-hidden glass-strong p-2">
              <img
                src={emonPortrait}
                alt="Zahid Hasan Emon — Digital Transformation & Growth Operator"
                width={1024}
                height={1024}
                className="w-full h-full object-cover rounded-[1.6rem] aspect-square"
              />
            </div>

            <div className="absolute -bottom-4 -right-4 bg-gradient-gold text-gold-foreground px-5 py-3 rounded-2xl font-semibold shadow-gold flex items-center gap-2">
              <Award className="w-4 h-4" />
              Project Lead
            </div>

            <div className="absolute -top-4 -left-4 glass-strong px-4 py-2 rounded-full text-xs uppercase tracking-[0.25em] text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Available for new systems
            </div>
          </div>

          {/* CONTENT */}
          <div className="animate-fade-up [animation-delay:0.1s]">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              About Our Project Lead
            </p>

            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Zahid Hasan <span className="text-gradient">Emon</span>
            </h1>

            <p className="text-gold mt-3 text-lg font-semibold">
              Digital Transformation & Growth Operator
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-foreground/60">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                Founder & CEO — TrendFlux Digital
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Dhaka, Bangladesh
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                BSc IT — Jahangirnagar University
              </span>
            </div>

            <p className="text-foreground/75 mt-6 leading-relaxed">
              Zahid Hasan Emon is a data-driven Digital Transformation & Growth
              Operator dedicated to replacing manual workflows with structured,
              AI-powered business operating systems. He blends technical
              expertise with actionable business strategy to deliver high-value,
              automated solutions across retail, corporate and digital sectors.
            </p>

            <p className="text-foreground/55 mt-4 leading-relaxed">
              Complementing his academic background in Information Technology,
              his extensive experience in debate and civic organization has
              cultivated a unique strength in narrative leadership and
              human-centered communication — driving sustainable growth through
              global AI automation consultancy and productized digital services.
            </p>

            {/* METRICS */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="glass rounded-2xl p-5 text-center glass-hover"
                >
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-gradient">
                    {m.value}
                  </h3>
                  <p className="text-foreground/55 text-xs mt-1 uppercase tracking-wider">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex gap-4 flex-wrap">
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/8801756004037" target="_blank" rel="noreferrer">
                  Book Direct on WhatsApp
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://www.linkedin.com/in/zhemongrowth"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin />
                  Connect on LinkedIn
                </a>
              </Button>
            </div>

            {/* SOCIALS */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE EXPERTISE */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Core Expertise & Skills
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Where AI, automation & <span className="text-gradient">business strategy</span> converge
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {expertise.map((e, i) => (
              <div key={e.title} className="glass glass-hover rounded-3xl p-7">
                <div className="font-display text-4xl text-gradient font-bold opacity-80">
                  0{i + 1}
                </div>
                <h3 className="font-display text-xl font-bold mt-3">{e.title}</h3>
                <p className="text-foreground/65 mt-3 leading-relaxed text-sm">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO HIGHLIGHTS */}
      <section className="px-6 lg:px-10 py-24 relative">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" aria-hidden />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
                Portfolio Highlights
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl">
                Brands & systems <span className="text-gradient">built end-to-end</span>
              </h2>
            </div>
            <p className="text-foreground/60 max-w-md text-sm">
              Selected engagements where strategy, content and automation came
              together as a single growth machine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {portfolio.map((p) => (
              <article
                key={p.title}
                className="glass glass-hover rounded-3xl p-7 group"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  {p.tag}
                </span>
                <h3 className="font-display text-2xl font-bold mt-3">{p.title}</h3>
                <p className="text-gold font-semibold mt-2">{p.metric}</p>
                <p className="text-foreground/70 mt-4 leading-relaxed text-sm">
                  {p.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP & COMMUNITY */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Leadership & Community Engagement
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Civic leadership behind the <span className="text-gradient">growth operator</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {leadership.map((l) => (
              <div
                key={l.org}
                className="glass glass-hover rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-cyan/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-gold font-semibold text-sm">{l.role}</p>
                  <p className="text-foreground/75 mt-1">{l.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIRECT CTA */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-5xl mx-auto relative rounded-[2rem] glass-strong overflow-hidden p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4">
                Work Direct
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                Book directly with the{" "}
                <span className="text-gradient">Project Lead</span>
              </h2>
              <p className="text-foreground/65 mt-4 max-w-xl">
                Skip the gatekeepers. Get a 30-minute strategy session with Zahid
                Hasan Emon to map your growth system blueprint.
              </p>
              <p className="text-foreground/50 mt-3 text-sm">
                zhemongrowth@gmail.com · WhatsApp +880 1756 004037
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/8801756004037" target="_blank" rel="noreferrer">
                  Book Direct
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/">Back to TrendFlux</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ProjectLead;

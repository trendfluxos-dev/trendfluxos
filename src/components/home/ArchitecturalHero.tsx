import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import ProjectLeadBookingDialog from "@/components/project-lead/ProjectLeadBookingDialog";

/**
 * Architectural portfolio hero — replaces the multi-section top of the
 * homepage. Composition matches the user-selected design direction:
 *   - Left col (lg:7): operator positioning + dual CTA
 *   - Right col (lg:5): brand-grid module with 4 featured entities and
 *     a link to the full ecosystem (+4 more entities)
 *   - Footer strip: four enterprise metrics
 *
 * Palette is locked (crimson on obsidian) and uses literal hex values to
 * match the chosen prototype — no token re-derivation.
 */

type Brand = {
  category: string;
  name: string;
  path: string;
  external?: boolean;
  strength: 50 | 66 | 75 | 80 | 90;
};

const BRANDS: Brand[] = [
  { category: "EDTECH",    name: "Kormoshikkha",      path: "/edtech",                          strength: 80 },
  { category: "CREATIVE",  name: "BrandToki",         path: "/brandtoki",                       strength: 75 },
  { category: "LUXE",      name: "LuxeVeil",          path: "/luxe-veil",                       strength: 66 },
  { category: "INFRA",     name: "TrendFlux Space",   path: "https://trendflux.space",          external: true, strength: 90 },
];

const METRICS = [
  { label: "Capital Managed",   value: "$8.4M+" },
  { label: "Brands Operated",   value: "8 Entities" },
  { label: "System Uptime",     value: "99.98%", accent: true },
  { label: "Founded",           value: "2019" },
];

const widthClass: Record<Brand["strength"], string> = {
  50: "w-1/2", 66: "w-2/3", 75: "w-3/4", 80: "w-4/5", 90: "w-[90%]",
};

export default function ArchitecturalHero({ onOpenQuote }: { onOpenQuote: () => void }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate bg-[#08080d] text-[#f0c9c9] selection:bg-[#c11f1f] selection:text-white overflow-hidden"
    >
      {/* Ambient decoration — grid, radial glow, corner marks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #c11f1f 1px, transparent 1px), linear-gradient(to bottom, #c11f1f 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at 30% 20%, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 30% 20%, black 40%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full bg-[#c11f1f]/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#e25a5a]/10 blur-[100px]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-[calc(var(--nav-offset)+16px)] pb-16 lg:pb-24 overflow-hidden">
        {/* Corner ticks */}
        <span aria-hidden className="absolute left-4 top-4 h-3 w-3 border-l border-t border-[#c11f1f]/40" />
        <span aria-hidden className="absolute right-4 top-4 h-3 w-3 border-r border-t border-[#c11f1f]/40" />
        <span aria-hidden className="absolute left-4 bottom-4 h-3 w-3 border-l border-b border-[#c11f1f]/40" />
        <span aria-hidden className="absolute right-4 bottom-4 h-3 w-3 border-r border-b border-[#c11f1f]/40" />
        <div className="grid grid-cols-12 gap-6 md:gap-10 lg:gap-12 items-start">
          {/* Hero column */}
          <div className="col-span-12 lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c11f1f]/10 border border-[#c11f1f]/20 mb-6">
              <span className="font-mono text-[10px] uppercase tracking-tighter text-[#e25a5a]">
                Brand Architect · Founder Portfolio
              </span>
            </div>
            <h1
              id="home-hero-heading"
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-8 break-words"
            >
              Building the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c11f1f] to-[#e25a5a]">
                Next-Gen Operator
              </span>
              <br />
              Ecosystem.
            </h1>
            <p className="text-lg text-[#f0c9c9]/70 max-w-xl mb-10 leading-relaxed">
              Zahid Hasan Emon orchestrates a vertically integrated network of brands across
              EdTech, Creative, Commerce and Legal sectors. One vision, eight entities,
              unified execution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/ecosystem"
                className="px-8 py-4 bg-[#c11f1f] text-white font-semibold rounded hover:bg-[#a01a1a] transition-all inline-flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080d]"
              >
                View Architecture
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
              </Link>
              <Link
                to="/project-lead"
                onClick={(e) => {
                  // Only intercept plain left-clicks; allow modifier / middle-click to open the page.
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  setBookingOpen(true);
                }}
                aria-haspopup="dialog"
                className="relative px-8 py-4 bg-white text-[#08080d] font-semibold rounded hover:bg-[#f0c9c9] transition-all inline-flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080d] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.35)]"
              >
                <span aria-hidden className="absolute -top-2 -right-2 inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#e25a5a] opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#c11f1f]" />
                </span>
                <CalendarCheck className="w-4 h-4" aria-hidden />
                Book Direct with Project Lead
              </Link>
              <button
                type="button"
                onClick={onOpenQuote}
                className="px-8 py-4 border border-white/10 text-white font-semibold rounded hover:bg-white/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080d]"
              >
                Partnership
              </button>
            </div>
          </div>

          {/* Brand grid column */}
          <aside
            aria-labelledby="home-brand-grid-heading"
            className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4"
          >
            <div className="col-span-2 p-4 border border-white/5 bg-[#1a0a0a] rounded-lg">
              <span className="font-mono text-[10px] uppercase text-[#e25a5a] block mb-1">
                Active Deployment
              </span>
              <h2 id="home-brand-grid-heading" className="text-2xl font-bold text-white">
                8 Brands Managed
              </h2>
            </div>

            {BRANDS.map((b) => {
              const Tag: any = b.external ? "a" : Link;
              const props = b.external
                ? { href: b.path, target: "_blank", rel: "noopener noreferrer" }
                : { to: b.path };
              return (
                <Tag
                  key={b.name}
                  {...props}
                  className="p-4 border border-white/5 bg-[#1a0a0a]/40 hover:border-[#c11f1f]/30 transition-colors rounded-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080d]"
                >
                  <span className="font-mono text-[9px] text-[#f0c9c9]/40 block mb-2">
                    {b.category}
                    {b.external && <span className="ml-1 text-[#e25a5a]/70">↗</span>}
                  </span>
                  <div className="font-semibold text-white text-sm mb-1 group-hover:text-[#e25a5a]">
                    {b.name}
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`${widthClass[b.strength]} h-full bg-[#c11f1f]`} />
                  </div>
                </Tag>
              );
            })}

            <div className="col-span-2 mt-2 text-right">
              <Link
                to="/brands"
                className="font-mono text-[10px] text-[#e25a5a] uppercase tracking-widest hover:underline focus:outline-none focus-visible:underline"
              >
                +4 more entities
              </Link>
            </div>

          </aside>
        </div>

        {/* Metrics footer strip */}
        <div className="mt-16 lg:mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className="font-mono text-[10px] text-[#f0c9c9]/40 uppercase mb-2 tracking-widest">
                {m.label}
              </div>
              <div className={`text-2xl font-bold tracking-tight ${m.accent ? "text-[#e25a5a]" : "text-white"}`}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <ProjectLeadBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
}
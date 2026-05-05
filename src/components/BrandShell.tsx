import { Link } from "react-router-dom";
import { ReactNode } from "react";

type Tier = "open" | "platform" | "private";

const tierMeta: Record<Tier, { label: string; sub: string; tone: string }> = {
  open: { label: "Level 01 · Open", sub: "Mass / Public", tone: "from-gold/30 to-gold/0" },
  platform: { label: "Level 02 · Platform", sub: "Business / Authority", tone: "from-gold/40 to-gold/0" },
  private: { label: "Level 03 · Private", sub: "Invite Only", tone: "from-gold/50 to-gold/0" },
};

export const BrandShell = ({
  tier,
  children,
}: {
  tier: Tier;
  children: ReactNode;
}) => {
  const meta = tierMeta[tier];
  return (
    <main
      className="relative min-h-screen text-white overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, hsl(var(--gold) / 0.14), transparent 40%), linear-gradient(180deg, #0B1F3A 0%, #07182e 100%)",
      }}
    >
      {/* Decorative ambient layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.18), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(187 100% 50% / 0.10), transparent 65%)" }}
        />
        <div className="absolute inset-0 brand-grid-overlay opacity-60" />
        <div className="absolute inset-0 brand-noise" />
      </div>

      <header className="relative max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-gold/80 hover:text-gold transition">
          ← TrendFlux
        </Link>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold/70">{meta.label}</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">{meta.sub}</div>
        </div>
      </header>

      <div className="relative mx-auto mt-3 h-px max-w-6xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${meta.tone}`} />
        <div className="absolute inset-0 brand-divider-shimmer" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 pb-20">{children}</div>

      <BrandFunnelFooter active={tier} />
    </main>
  );
};

const BrandFunnelFooter = ({ active }: { active: Tier }) => {
  const items: { id: Tier; name: string; path: string; tag: string }[] = [
    { id: "open", name: "Brand Tok", path: "/brand-open", tag: "Open" },
    { id: "platform", name: "TrendFlux Talent", path: "/trendflux-talent", tag: "Platform" },
    { id: "private", name: "Luxe Veil", path: "/luxe-veil", tag: "Private" },
  ];
  return (
    <footer className="relative border-t border-gold/15 mt-10">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-center text-[10px] uppercase tracking-[0.4em] text-gold/60 mb-5">
          ◆ The TrendFlux Brand Funnel ◆
        </p>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it, i) => (
            <Link
              key={it.id}
              to={it.path}
              className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-center transition ${
                active === it.id
                  ? "border-gold bg-gold/10"
                  : "border-gold/20 hover:border-gold/60 hover:bg-gold/5"
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[300%] transition-all duration-700"
              />
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gold/40 text-[9px] text-gold/80">
                  {i + 1}
                </span>
                <div className="text-[9px] tracking-[0.3em] uppercase text-gold/70">
                  {it.tag}
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold text-white">{it.name}</div>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-white/40">
          © {new Date().getFullYear()} TrendFlux Ecosystem · Crafted brand architecture
        </p>
      </div>
    </footer>
  );
};

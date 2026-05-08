import { Link } from "react-router-dom";
import { ReactNode } from "react";
import SocialIcons from "@/components/social/SocialIcons";
import PrimaryContactCTA from "@/components/social/PrimaryContactCTA";

type Tier = "open" | "platform" | "private";

const tierMeta: Record<Tier, { label: string; sub: string; tone: string }> = {
  open: { label: "Level 01 · Open", sub: "Mass / Public", tone: "from-primary/30 to-primary/0" },
  platform: { label: "Level 02 · Platform", sub: "Business / Authority", tone: "from-primary/40 to-primary/0" },
  private: { label: "Level 03 · Private", sub: "Invite Only", tone: "from-primary/50 to-primary/0" },
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
      className="relative min-h-screen bg-background text-foreground overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 40% at 50% -10%, hsl(var(--primary) / 0.07), transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
      }}
    >
      {/* Decorative ambient layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.10), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--accent-orange) / 0.06), transparent 65%)" }}
        />
      </div>

      <header className="relative max-w-6xl mx-auto px-5 pt-6 flex items-center justify-between">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-primary/90 hover:text-primary transition">
          ← Studio BrandToki
        </Link>
        <div className="flex items-center gap-4">
          <SocialIcons variant="inline" size="sm" className="hidden md:flex" />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.35em] text-primary/80">{meta.label}</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{meta.sub}</div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto mt-3 h-px max-w-6xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${meta.tone}`} />
        <div className="absolute inset-0 brand-divider-shimmer" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 pb-20">{children}</div>

      <div className="relative max-w-6xl mx-auto px-5 pb-6 flex flex-col items-center gap-3">
        <PrimaryContactCTA />
        <SocialIcons variant="inline" size="sm" />
      </div>

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
    <footer className="relative border-t border-border mt-10">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-center text-[10px] uppercase tracking-[0.4em] text-primary/80 mb-5">
          ◆ The Studio BrandToki Funnel ◆
        </p>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it, i) => (
            <Link
              key={it.id}
              to={it.path}
              className={`group relative overflow-hidden rounded-2xl border bg-card px-4 py-4 text-center transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.22)] ${
                active === it.id
                  ? "border-primary"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[300%] transition-all duration-700"
              />
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-primary/40 text-[9px] text-primary">
                  {i + 1}
                </span>
                <div className="text-[9px] tracking-[0.3em] uppercase text-primary/80">
                  {it.tag}
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">{it.name}</div>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Studio BrandToki · Powered by TrendFlux Ecosystem
        </p>
      </div>
    </footer>
  );
};

import { Link } from "react-router-dom";
import { BRAND } from "@/config/brand";
import SocialIcons from "@/components/social/SocialIcons";
import { LAYER_META, nodesByLayer, type Layer } from "@/config/siteLayers";

const COLUMN_LAYERS: Layer[] = ["company", "founder", "brand", "system"];

const Footer = () => {
  return (
    <footer className="border-t border-border/60 px-6 lg:px-10 pt-16 sm:pt-20 pb-10 mt-16 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 md:gap-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 font-display font-semibold text-lg tracking-tight">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/55 font-normal">{BRAND.nameTrail}</span>
          </Link>
          <p className="text-foreground/55 mt-4 max-w-sm leading-relaxed text-[13.5px]">
            One ecosystem, four layers. Company, founder, brands, system —
            built to operate beyond random marketing.
          </p>
          <div className="mt-7">
            <SocialIcons brand="trendflux" variant="footer" size="md" />
          </div>
        </div>

        {COLUMN_LAYERS.map((layer) => {
          const meta = LAYER_META[layer];
          const items =
            layer === "system"
              ? nodesByLayer(layer).filter((n) => ["/auth", "/dashboard", "/settings"].includes(n.path))
              : nodesByLayer(layer, { includeAlsoIn: true });
          return (
            <nav key={layer} aria-labelledby={`footer-${layer}`}>
              <h2
                id={`footer-${layer}`}
                className="text-[11px] uppercase tracking-[0.22em] text-foreground/40 mb-5 font-medium"
              >
                {meta.label}
              </h2>
              <ul className="space-y-2.5 text-[13.5px] text-foreground/65">
                {items.map((n) => (
                  <li key={`${layer}-${n.path}`}>
                    {n.external ? (
                      <a
                        href={n.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="story-link hover:text-foreground transition-colors"
                      >
                        {n.title} <span className="text-foreground/40">↗</span>
                      </a>
                    ) : (
                      <Link to={n.path} className="story-link hover:text-foreground transition-colors">
                        {n.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-foreground/45 tracking-wide">
        <div className="space-y-1">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="text-foreground/55">
            Designed, built &amp; copyrighted by{" "}
            <span className="text-foreground/80 font-medium">Zahid Hasan Emon</span>
            {" "}— Founder &amp; Brand Architect, TrendFlux.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/explore" className="hover:text-foreground transition-colors">Browse all pages</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <p>Built as a system, not a website.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

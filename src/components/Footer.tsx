import { Link } from "react-router-dom";
import { openLuxeVeilGate } from "@/lib/luxeVeilGate";
import { BRAND } from "@/config/brand";
import { ENTERPRISE } from "@/config/enterprise";
import { track } from "@/lib/analytics";
import SocialIcons from "@/components/social/SocialIcons";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 px-6 lg:px-10 pt-16 sm:pt-20 pb-10 mt-16 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 md:gap-12">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 font-display font-semibold text-lg tracking-tight">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/55 font-normal">{BRAND.nameTrail}</span>
          </Link>
          <p className="text-foreground/55 mt-4 max-w-sm leading-relaxed text-[13.5px]">
            AI-powered growth systems for brands, founders, and businesses ready
            to operate beyond random marketing.
          </p>

          <div className="mt-7">
            <SocialIcons brand="trendflux" variant="footer" size="md" />
          </div>
        </div>

        <nav aria-labelledby="footer-systems">
          <h2 id="footer-systems" className="text-[11px] uppercase tracking-[0.22em] text-foreground/40 mb-5 font-medium">
            Systems
          </h2>
          <ul className="space-y-2.5 text-[13.5px] text-foreground/65">
            <li><a href="#services" className="story-link hover:text-foreground transition-colors">AI Automation</a></li>
            <li><a href="#services" className="story-link hover:text-foreground transition-colors">Paid Media</a></li>
            <li><a href="#services" className="story-link hover:text-foreground transition-colors">CRM Workflows</a></li>
            <li><a href="#services" className="story-link hover:text-foreground transition-colors">Brand Architecture</a></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-studio">
          <h2 id="footer-studio" className="text-[11px] uppercase tracking-[0.22em] text-foreground/40 mb-5 font-medium">
            Studio
          </h2>
          <ul className="space-y-2.5 text-[13.5px] text-foreground/65">
            <li><Link to="/project-lead" className="story-link hover:text-foreground transition-colors">Project Lead</Link></li>
            <li><Link to="/brand-open" className="story-link hover:text-foreground transition-colors">Studio BrandToki</Link></li>
            <li><Link to="/trendflux-talent" className="story-link hover:text-foreground transition-colors">TrendFlux Talent</Link></li>
            <li>
              <button
                type="button"
                onClick={() => openLuxeVeilGate({ source: "footer" })}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 text-left"
              >
                <span className="w-1 h-1 rounded-full bg-foreground/40" /> Luxe Veil
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/35 ml-1">Private</span>
              </button>
            </li>
            <li><a href="#cases" className="story-link hover:text-foreground transition-colors">Case Studies</a></li>
            <li><Link to="/the-stand" className="story-link hover:text-foreground transition-colors">The Stand</Link></li>
            <li><Link to="/toolkit" className="story-link hover:text-foreground transition-colors">Course & Toolkit</Link></li>
            <li><Link to="/contact" className="story-link hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-platform">
          <h2 id="footer-platform" className="text-[11px] uppercase tracking-[0.22em] text-foreground/40 mb-5 font-medium">
            Platform
          </h2>
          <ul className="space-y-2.5 text-[13.5px] text-foreground/65">
            <li>
              <Link to="/enterprise" className="story-link hover:text-foreground transition-colors">
                Enterprise Control
              </Link>
            </li>
            <li>
              <a
                href={ENTERPRISE.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("enterprise_portal_open", { location: "footer_portal" })}
                className="story-link hover:text-foreground transition-colors"
                aria-label="Enterprise Portal (opens in new tab)"
              >
                Enterprise Portal
              </a>
            </li>
            <li>
              <a
                href={ENTERPRISE.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("enterprise_portal_open", { location: "footer_client_access" })}
                className="story-link hover:text-foreground transition-colors"
                aria-label="Client Access (opens in new tab)"
              >
                Client Access
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-foreground/40 tracking-wide">
        <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/explore" className="hover:text-foreground transition-colors">Browse all pages</Link>
          <p>Built as a system, not a website.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

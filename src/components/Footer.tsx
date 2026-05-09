import { Link } from "react-router-dom";
import { BRAND } from "@/config/brand";
import { ENTERPRISE } from "@/config/enterprise";
import { track } from "@/lib/analytics";
import SocialIcons from "@/components/social/SocialIcons";

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 lg:px-10 pt-16 pb-10 mt-10 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-cyan" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/60 font-normal">{BRAND.nameTrail}</span>
          </Link>
          <p className="text-foreground/60 mt-4 max-w-sm leading-relaxed">
            AI-powered growth systems for brands, founders, and businesses ready
            to operate beyond random marketing.
          </p>

          <div className="mt-6">
            <SocialIcons brand="trendflux" variant="footer" size="md" />
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/40 mb-4">
            Systems
          </h4>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li><a href="#services" className="hover:text-primary transition-colors">AI Automation</a></li>
            <li><a href="#services" className="hover:text-primary transition-colors">Paid Media</a></li>
            <li><a href="#services" className="hover:text-primary transition-colors">CRM Workflows</a></li>
            <li><a href="#services" className="hover:text-primary transition-colors">Brand Architecture</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/40 mb-4">
            Studio
          </h4>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li><Link to="/project-lead" className="hover:text-primary transition-colors">Project Lead</Link></li>
            <li><Link to="/brand-open" className="hover:text-primary transition-colors">Studio BrandToki</Link></li>
            <li><Link to="/trendflux-talent" className="hover:text-primary transition-colors">TrendFlux Talent</Link></li>
            <li>
              <Link to="/luxe-veil" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary/60" /> Luxe Veil
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 ml-1">(Private)</span>
              </Link>
            </li>
            <li><a href="#cases" className="hover:text-primary transition-colors">Case Studies</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/40 mb-4">
            Platform
          </h4>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li>
              <Link to="/enterprise" className="hover:text-primary transition-colors">
                Enterprise Control
              </Link>
            </li>
            <li>
              <a
                href={ENTERPRISE.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("enterprise_portal_open", { location: "footer_portal" })}
                className="hover:text-primary transition-colors"
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
                className="hover:text-primary transition-colors"
              >
                Client Access
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-foreground/40">
        <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <p>Built as a system, not a website.</p>
      </div>
    </footer>
  );
};

export default Footer;

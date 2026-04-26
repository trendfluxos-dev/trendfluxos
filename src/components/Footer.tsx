import { Link } from "react-router-dom";
import { Linkedin, Twitter, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 lg:px-10 pt-16 pb-10 mt-10 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-cyan" />
            <span className="text-gradient">TrendFlux</span>
            <span className="text-foreground/60 font-normal">Digital</span>
          </Link>
          <p className="text-foreground/60 mt-4 max-w-sm leading-relaxed">
            AI-powered growth systems for brands, founders, and businesses ready
            to operate beyond random marketing.
          </p>

          <div className="flex gap-3 mt-6">
            {[Linkedin, Twitter, Instagram, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
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
            <li><a href="#cases" className="hover:text-primary transition-colors">Case Studies</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Book a Call</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-foreground/40">
        <p>© {new Date().getFullYear()} TrendFlux Digital. All rights reserved.</p>
        <p>Built as a system, not a website.</p>
      </div>
    </footer>
  );
};

export default Footer;

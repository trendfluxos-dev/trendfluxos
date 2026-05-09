import { Link } from "react-router-dom";
import { BRAND } from "@/config/brand";
import SocialIcons from "@/components/social/SocialIcons";
import { useT, useLocalizedHref, useLang } from "@/i18n";

const Footer = () => {
  const t = useT();
  const localized = useLocalizedHref();
  const lang = useLang();
  return (
    <footer className="border-t border-border px-6 lg:px-10 pt-16 pb-10 mt-10 relative" lang={lang}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to={localized("/")} className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-cyan" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/60 font-normal">{BRAND.nameTrail}</span>
          </Link>
          <p className="text-foreground/60 mt-4 max-w-sm leading-relaxed">
            {t.footer.tagline}
          </p>

          <div className="mt-6">
            <SocialIcons brand="trendflux" variant="footer" size="md" />
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/40 mb-4">
            {t.footer.systems}
          </h4>
          <ul className="space-y-3 text-sm text-foreground/70">
            {t.footer.systemsLinks.map((label) => (
              <li key={label}><a href="#services" className="hover:text-primary transition-colors">{label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/40 mb-4">
            {t.footer.studio}
          </h4>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li><Link to={localized("/project-lead")} className="hover:text-primary transition-colors">{t.footer.projectLead}</Link></li>
            <li><Link to={localized("/brand-open")} className="hover:text-primary transition-colors">{t.footer.studioBrandToki}</Link></li>
            <li><Link to={localized("/trendflux-talent")} className="hover:text-primary transition-colors">{t.footer.trendfluxTalent}</Link></li>
            <li>
              <Link to={localized("/luxe-veil")} className="hover:text-primary transition-colors inline-flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary/60" /> {t.footer.luxeVeil}
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 ml-1">{t.footer.private}</span>
              </Link>
            </li>
            <li><a href="#cases" className="hover:text-primary transition-colors">{t.footer.caseStudies}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.contact}</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-foreground/40">
        <p>© {new Date().getFullYear()} {BRAND.name}. {t.footer.rights}</p>
        <p>{t.footer.builtAs}</p>
      </div>
    </footer>
  );
};

export default Footer;

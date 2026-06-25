import { Link, useLocation } from "react-router-dom";
import { Languages } from "lucide-react";
import { EDTECH } from "@/config/edtech";
import { useEdtechLang } from "@/lib/edtechLang";
import trendfluxLogo from "@/assets/trendflux-arrow-icon.jpeg.asset.json";

const EdtechHeader = () => {
  const { pathname } = useLocation();
  const { t, lang, toggle } = useEdtechLang();

  const links = [
    { to: EDTECH.routes.home, label: t("header.home") },
    { to: EDTECH.routes.courses, label: t("header.courses") },
    { to: EDTECH.routes.live, label: t("header.live") },
    { to: EDTECH.routes.myLearning, label: t("header.myLearning") },
    { to: EDTECH.routes.pricing, label: t("header.pricing") },
  ];

  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-10">
        <Link
          to={EDTECH.routes.home}
          className="inline-flex min-w-0 items-center gap-2 font-display text-sm font-semibold text-foreground"
        >
          <img
            src={trendfluxLogo.url}
            alt="TrendFlux"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-border/60"
          />
          <span className="truncate">
            TrendFlux <span className="edtech-text-gradient">EdTech</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => {
            const active =
              l.to === EDTECH.routes.home
                ? pathname === EDTECH.routes.home
                : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={[
                  "rounded-full px-3 py-1.5 transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/65 hover:bg-accent hover:text-foreground",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggle}
          aria-label={t("header.langToggle")}
          title={t("header.langToggle")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-accent sm:text-xs"
        >
          <Languages className="h-3.5 w-3.5 text-primary" aria-hidden />
          {lang === "bn" ? "EN" : "বাংলা"}
        </button>
      </div>
    </div>
  );
};

export default EdtechHeader;
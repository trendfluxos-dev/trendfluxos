import { Link, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { EDTECH } from "@/config/edtech";

const links = [
  { to: EDTECH.routes.home, label: "Home" },
  { to: EDTECH.routes.courses, label: "Courses" },
  { to: EDTECH.routes.live, label: "Live" },
  { to: EDTECH.routes.myLearning, label: "My Learning" },
  { to: EDTECH.routes.pricing, label: "Pricing" },
];

const EdtechHeader = () => {
  const { pathname } = useLocation();
  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:px-10">
        <Link
          to={EDTECH.routes.home}
          className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
          </span>
          KormoShikkha
          <span className="ml-1 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/45 sm:inline">
            · TrendFlux EdTech
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
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
      </div>
    </div>
  );
};

export default EdtechHeader;
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";

const links = [
  { label: "Systems", href: "/#services" },
  { label: "Case Studies", href: "/#cases" },
  { label: "Project Lead", href: "/project-lead" },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-4">
        <nav className="glass-strong rounded-full flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg whitespace-nowrap shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-cyan animate-pulse-glow" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/60 font-normal">{BRAND.nameTrail}</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-foreground/70">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`transition-colors hover:text-primary ${
                  pathname === l.href ? "text-primary" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Button variant="hero" size="sm" className="hidden sm:inline-flex">
            Book Call
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

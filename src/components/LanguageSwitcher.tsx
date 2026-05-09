import { Link, useLocation } from "react-router-dom";
import { useLang, stripLangPrefix } from "@/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const LanguageSwitcher = ({ className }: { className?: string }) => {
  const lang = useLang();
  const { pathname, search, hash } = useLocation();
  const base = stripLangPrefix(pathname);

  const enHref = `${base}${search}${hash}`;
  const bnHref = `${base === "/" ? "/bn" : `/bn${base}`}${search}${hash}`;

  const onSwitch = (to: "en" | "bn") => {
    if (to !== lang) track("language_switch", { from: lang, to, page: pathname });
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full border border-border/60 bg-background/40 p-0.5 text-[11px]",
        className,
      )}
    >
      <Link
        to={enHref}
        onClick={() => onSwitch("en")}
        aria-current={lang === "en" ? "true" : undefined}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-primary",
        )}
      >
        EN
      </Link>
      <Link
        to={bnHref}
        onClick={() => onSwitch("bn")}
        aria-current={lang === "bn" ? "true" : undefined}
        lang="bn"
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "bn" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-primary",
        )}
      >
        বাংলা
      </Link>
    </div>
  );
};

export default LanguageSwitcher;
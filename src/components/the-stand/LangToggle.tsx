import { useStandLang } from "@/context/StandLanguageContext";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { lang, setLang } = useStandLang();
  const base =
    "text-[10px] uppercase tracking-[0.35em] transition-colors";
  const active = "text-[hsl(var(--stand-ink))]";
  const idle = "text-[hsl(var(--stand-muted))]/60 hover:text-[hsl(var(--stand-red))]";
  return (
    <div className="fixed right-6 top-6 z-50 flex items-center gap-3">
      <button
        type="button"
        onClick={() => setLang("bn")}
        className={cn(base, lang === "bn" ? active : idle)}
        aria-pressed={lang === "bn"}
        aria-label="বাংলা ভাষায় পড়ুন"
      >
        বাংলা
      </button>
      <span aria-hidden className="h-3 w-px bg-[hsl(var(--stand-hairline))]" />
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(base, lang === "en" ? active : idle)}
        aria-pressed={lang === "en"}
        aria-label="Read in English"
      >
        EN
      </button>
    </div>
  );
}

/**
 * Cinematic section divider for the homepage — hairline rule + monospace
 * chapter tag + amber/crimson pulse. Purely decorative (aria-hidden except
 * the label, which is read as text). No color changes to project tokens.
 */
type Props = {
  chapter: string;
  label: string;
  accent?: "amber" | "crimson";
};

export default function SectionOrnament({ chapter, label, accent = "crimson" }: Props) {
  // Token-driven so the ornament stays readable in light, dark and any
  // Theme Studio palette (no fixed hex / fixed-opacity text here).
  const dot = accent === "amber" ? "bg-gold" : "bg-primary";
  const text =
    accent === "amber"
      ? "text-amber-700 dark:text-amber-300"
      : "text-primary dark:text-crimson-glow";
  return (
    <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 px-4 sm:px-6 py-10 sm:py-14">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_12px_currentColor]`} />
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-foreground/15 via-foreground/[0.07] to-transparent" />
      <span className={`font-mono text-[10px] uppercase tracking-[0.35em] ${text} whitespace-nowrap`}>
        <span>{chapter}</span>
        <span aria-hidden className="mx-2 opacity-60">·</span>
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-foreground/15 via-foreground/[0.07] to-transparent" />
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_12px_currentColor]`} />
    </div>
  );
}
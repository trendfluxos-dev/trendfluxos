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
  const dot = accent === "amber" ? "bg-amber-400" : "bg-[#c11f1f]";
  const text = accent === "amber" ? "text-amber-400/80" : "text-[#e25a5a]";
  return (
    <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 px-4 sm:px-6 py-10 sm:py-14">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_12px_currentColor]`} />
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-white/[0.12] via-white/[0.05] to-transparent" />
      <span className={`font-mono text-[10px] uppercase tracking-[0.35em] ${text} whitespace-nowrap`}>
        <span className="opacity-60">{chapter}</span>
        <span aria-hidden className="mx-2 opacity-40">·</span>
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-white/[0.12] via-white/[0.05] to-transparent" />
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_12px_currentColor]`} />
    </div>
  );
}
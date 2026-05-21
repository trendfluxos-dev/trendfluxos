import { ArrowUpRight } from "lucide-react";
import { usePressItems } from "@/hooks/usePressItems";
import { Reveal } from "./Reveal";

export function MediaWall() {
  const { items } = usePressItems();
  if (!items.length) return null;

  return (
    <section
      aria-label="Media wall"
      className="px-6 lg:px-10 py-28 md:py-40 bg-[hsl(var(--stand-bone))]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            Media wall · Public record
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]">
            {items.length} verified national reports.
          </h2>
          <p
            lang="en"
            className="mt-4 max-w-xl text-sm md:text-base text-[hsl(var(--stand-muted))]"
          >
            Quiet archival mentions. Each link individually reviewed.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-[hsl(var(--stand-hairline))]">
          {items.map((item, i) => (
            <Reveal as="li" key={item.id ?? item.href} delay={(i % 6) * 60}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-4 bg-[hsl(var(--stand-bone))] p-6 md:p-7 transition-colors hover:bg-[hsl(var(--stand-bone-soft))]"
              >
                <span
                  lang="en"
                  className="font-mono text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-red))]"
                >
                  {item.outlet}
                </span>
                <p
                  lang={/[\u0980-\u09FF]/.test(item.headline) ? "bn" : undefined}
                  className="text-sm md:text-base leading-snug text-[hsl(var(--stand-ink))] group-hover:text-[hsl(var(--stand-ink))]"
                >
                  {item.headline}
                </p>
                <span
                  lang="en"
                  className="mt-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--stand-muted))] group-hover:text-[hsl(var(--stand-red))]"
                >
                  Read archive
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

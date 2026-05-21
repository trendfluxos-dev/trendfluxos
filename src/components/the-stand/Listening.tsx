import { STAND_LISTEN } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function Listening() {
  return (
    <section
      aria-label="Why people started listening"
      className="px-6 lg:px-10 py-24 md:py-36"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {STAND_LISTEN.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p
            lang="bn"
            className="mt-8 font-display text-2xl md:text-4xl leading-[1.45] text-[hsl(var(--stand-ink))]"
          >
            {STAND_LISTEN.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

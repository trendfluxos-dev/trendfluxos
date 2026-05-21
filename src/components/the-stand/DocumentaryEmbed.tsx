import { STAND_DOCUMENTARY } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function DocumentaryEmbed() {
  const { eyebrow, title, sub, youtubeId } = STAND_DOCUMENTARY;
  return (
    <section
      aria-label={title}
      className="px-6 lg:px-10 py-28 md:py-40 bg-[hsl(var(--stand-bone-soft))]"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]">
            {title}
          </h2>
          <p
            lang="en"
            className="mt-4 max-w-xl text-base text-[hsl(var(--stand-muted))]"
          >
            {sub}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-[hsl(var(--stand-hairline))] bg-[hsl(var(--stand-charcoal))]">
            <div className="aspect-video w-full">
              {youtubeId ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="relative grid h-full w-full place-items-center text-[hsl(var(--stand-bone))]">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "radial-gradient(hsl(var(--stand-bone) / 0.25) 1px, transparent 1px)",
                      backgroundSize: "4px 4px",
                    }}
                  />
                  <div className="relative text-center">
                    <p
                      lang="en"
                      className="font-mono text-[10px] uppercase tracking-[0.5em] text-[hsl(var(--stand-red-glow))]"
                    >
                      Reel · Coming soon
                    </p>
                    <p className="mt-4 font-display text-2xl md:text-3xl">
                      A cinematic reconstruction is in production.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

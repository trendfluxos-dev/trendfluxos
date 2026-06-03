import { useStandLang } from "@/context/StandLanguageContext";
import {
  STAND_DOCUMENTARY,
  STAND_DOCUMENTARY_BN,
  STAND_DOCUMENTARY_EN,
} from "@/content/theStand";
import { Reveal } from "./Reveal";

export function DocumentaryEmbed() {
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_DOCUMENTARY_BN : STAND_DOCUMENTARY_EN;
  const { youtubeId } = STAND_DOCUMENTARY;

  return (
    <section
      aria-label={t.title}
      className="px-6 lg:px-10 py-32 md:py-44 bg-[hsl(var(--stand-bone-soft))]"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {t.eyebrow}
          </p>
          <h2
            lang={lang}
            className="mt-6 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
          >
            {t.title}
          </h2>
          <p
            lang={lang}
            className="mt-4 max-w-xl text-base text-[hsl(var(--stand-muted))]"
          >
            {t.sub}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 overflow-hidden border border-[hsl(var(--stand-hairline))] bg-[hsl(var(--stand-charcoal))]">
            <div className="aspect-video w-full">
              {youtubeId ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                  title={t.title}
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
                  <div className="relative text-center px-6">
                    <p
                      lang="en"
                      className="font-mono text-[10px] uppercase tracking-[0.5em] text-[hsl(var(--stand-red-glow))]"
                    >
                      Reel · In production
                    </p>
                    <p
                      lang={lang}
                      className="mt-4 font-display text-2xl md:text-3xl"
                    >
                      {t.sub}
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

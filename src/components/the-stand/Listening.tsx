import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_LISTEN, STAND_LISTEN_EN, STAND_LISTEN_BN_TITLE } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function Listening() {
  const { lang } = useStandLang();
  const eyebrow = lang === "bn" ? STAND_LISTEN_BN_TITLE : STAND_LISTEN_EN.eyebrow;
  const body = lang === "bn" ? STAND_LISTEN.body : STAND_LISTEN_EN.body;

  return (
    <section
      aria-label="Why this moment matters"
      className="px-6 lg:px-10 py-32 md:py-44"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p
            lang={lang}
            className="mt-10 font-display text-2xl md:text-4xl leading-[1.55] text-[hsl(var(--stand-ink))]"
          >
            {body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

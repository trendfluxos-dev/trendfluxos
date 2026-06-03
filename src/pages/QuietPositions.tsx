import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import textureUrl from "@/assets/quiet-positions-texture.jpg";
import sareeUrl from "@/assets/quiet-positions-saree.jpg";
import concreteUrl from "@/assets/quiet-positions-concrete.jpg";
import { copy, fragments, principles } from "@/content/quietPositions";

/**
 * নীরব অবস্থান · Quiet Positions
 *
 * A standalone editorial layer that lives parallel to /the-stand.
 * Civic, restrained, documentary. No names, no portraits, no claims.
 * Discoverable only via hairline links between the two pages.
 */

// --- Shared reveal (opacity + 8px y-translate, IO once, reduced-motion aware) ---
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : "translate3d(0,8px,0)",
        transition: `opacity 1200ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 1200ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}


const Movement = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`relative flex w-full min-h-[88vh] items-center justify-center px-6 py-24 sm:px-10 md:min-h-screen md:px-16 ${className}`}
  >
    {children}
  </section>
);

export default function QuietPositions() {
  return (
    <>
      <Helmet>
        <title>নীরব অবস্থান · Quiet Positions</title>
        <meta
          name="description"
          content="An emotional archive — a quiet, civic reflection on how a society remembers the people who chose to stay near without making a claim."
        />
        <meta property="og:title" content="নীরব অবস্থান · Quiet Positions" />
        <meta
          property="og:description"
          content="An emotional archive — silent support, dignity in distance, memory without bitterness."
        />
        <meta property="og:image" content={textureUrl} />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="canonical" href="https://trendfluxdigital.lovable.app/quiet-positions" />
      </Helmet>

      <main
        data-surface="quiet"
        className="relative w-full overflow-x-hidden text-[hsl(var(--quiet-ink))]"
        style={{ backgroundColor: "hsl(var(--quiet-bg))" }}
      >
        {/* Vertical vignette */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Film grain */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "160px 160px",
          }}
        />

        <div className="relative z-10">
          {/* ────────────── 00 Cover ────────────── */}
          <Movement>
            <div className="mx-auto max-w-3xl text-center">
              <Reveal delay={320}>
                <h1
                  lang="bn"
                  className="quiet-display mt-10 text-[44px] leading-[1.05] text-[hsl(var(--quiet-ink))]/92 sm:text-[64px] md:text-[88px]"
                >
                  {copy.cover.bn}
                </h1>
              </Reveal>
              <Reveal delay={520}>
                <h2
                  lang="en"
                  className="quiet-serif mt-3 text-[20px] italic tracking-[0.01em] text-[hsl(var(--quiet-ink))]/55 sm:text-[24px]"
                >
                  {copy.cover.en}
                </h2>
              </Reveal>
              <Reveal delay={900}>
                <div className="mx-auto mt-14 h-px w-12 bg-[hsl(var(--quiet-rule))]" />
              </Reveal>
            </div>
          </Movement>

          {/* ────────────── 01 Threshold ────────────── */}
          <Movement>
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p
                  lang="bn"
                  className="quiet-display text-[36px] leading-[1.25] text-[hsl(var(--quiet-ink))]/88 sm:text-[52px] md:text-[72px]"
                >
                  {copy.threshold.bn}
                </p>
                <p
                  lang="en"
                  className="quiet-serif mt-8 text-[15px] italic text-[hsl(var(--quiet-ink))]/45 sm:text-[17px]"
                >
                  {copy.threshold.en}
                </p>
              </div>
            </Reveal>
          </Movement>

          {/* ────────────── 02 Definition ────────────── */}
          <Movement>
            <div className="mx-auto max-w-[60ch] space-y-10">
              {copy.definition.map((p, i) => (
                <Reveal key={i} delay={i * 160}>
                  <div>
                    <p
                      lang="bn"
                      className="quiet-serif text-[19px] leading-[1.85] text-[hsl(var(--quiet-ink))]/78 sm:text-[21px]"
                    >
                      {p.bn}
                    </p>
                    <p
                      lang="en"
                      className="quiet-serif mt-3 text-[15px] italic leading-[1.75] text-[hsl(var(--quiet-ink))]/45 sm:text-[16px]"
                    >
                      {p.en}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Movement>

          {/* ────────────── 03 Fragments ────────────── */}
          {fragments.map((f, i) => (
            <Movement key={f.id}>
              <div className="mx-auto w-full max-w-2xl">
                <Reveal>
                  <div className="flex items-center justify-between text-[10px] tracking-[0.35em] text-[hsl(var(--quiet-ink))]/35 sm:text-[11px]">
                    <span lang="en">
                      {String(i + 1).padStart(2, "0")} / {String(fragments.length).padStart(2, "0")}
                    </span>
                    <span lang="en" className="uppercase">
                      {f.theme}
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={180}>
                  <p
                    lang="bn"
                    className="quiet-display mt-10 text-[26px] leading-[1.5] text-[hsl(var(--quiet-ink))]/90 sm:text-[34px] md:text-[40px]"
                  >
                    {f.bn}
                  </p>
                </Reveal>
                <Reveal delay={340}>
                  <p
                    lang="en"
                    className="quiet-serif mt-6 text-[15px] italic leading-[1.7] text-[hsl(var(--quiet-ink))]/45 sm:text-[16px]"
                  >
                    {f.en}
                  </p>
                </Reveal>
              </div>
            </Movement>
          ))}

          {/* ────────────── 04 Texture Triptych ────────────── */}
          <section className="relative w-full">
            <Reveal>
              <figure className="relative w-full">
                <div className="grid grid-cols-1 gap-px bg-[hsl(var(--quiet-bg))] md:grid-cols-3">
                  {[
                    { src: textureUrl, alt: "Abstract macro — silver chain weave, material memory." },
                    { src: sareeUrl, alt: "Abstract macro — woven gold thread on teal silk." },
                    { src: concreteUrl, alt: "Abstract macro — concrete grain, weathered surface." },
                  ].map((plate, i) => (
                    <img
                      key={i}
                      src={plate.src}
                      alt={plate.alt}
                      width={1600}
                      height={1024}
                      loading="lazy"
                      className="block h-[42vh] w-full object-cover sm:h-[55vh] md:h-[70vh]"
                    />
                  ))}
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(var(--quiet-bg)) 0%, transparent 14%, transparent 86%, hsl(var(--quiet-bg)) 100%)",
                  }}
                />
                <figcaption className="mx-auto mt-10 flex max-w-3xl items-center gap-4 px-6 sm:px-10 md:px-16">
                  <span
                    aria-hidden
                    className="h-px w-10"
                    style={{ backgroundColor: "hsl(var(--quiet-accent))" }}
                  />
                  <span
                    lang="bn"
                    className="quiet-serif text-[12px] italic tracking-[0.04em] text-[hsl(var(--quiet-ink))]/55 sm:text-[13px]"
                  >
                    {copy.texture.bn} · <span lang="en">{copy.texture.en}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </section>


          {/* ────────────── 05 Principles ────────────── */}
          <Movement>
            <div className="mx-auto w-full max-w-3xl">
              <Reveal>
                <p
                  lang="en"
                  className="mb-12 text-[10px] tracking-[0.4em] text-[hsl(var(--quiet-ink))]/45 sm:text-[11px]"
                >
                  PRINCIPLES
                </p>
              </Reveal>
              <ol className="space-y-10">
                {principles.map((p, i) => (
                  <li key={p.n}>
                    <Reveal delay={i * 140}>
                      <div className="flex gap-6 sm:gap-10">
                        <span
                          lang="en"
                          className="pt-2 text-[12px] tracking-[0.3em] text-[hsl(var(--quiet-ink))]/40 sm:text-[13px]"
                        >
                          {p.n}
                        </span>
                        <div>
                          <p
                            lang="en"
                            className="quiet-serif text-[22px] leading-[1.35] text-[hsl(var(--quiet-ink))]/88 sm:text-[28px] md:text-[34px]"
                          >
                            {p.en}
                          </p>
                          <p
                            lang="bn"
                            className="quiet-serif mt-2 text-[15px] leading-[1.55] text-[hsl(var(--quiet-ink))]/50 sm:text-[17px]"
                          >
                            {p.bn}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>

            </div>
          </Movement>

          {/* ────────────── 06 Civic Note ────────────── */}
          <Movement>
            <div className="mx-auto max-w-[58ch] text-center">
              <Reveal>
                <p
                  lang="bn"
                  className="quiet-serif text-[19px] leading-[1.85] text-[hsl(var(--quiet-ink))]/78 sm:text-[22px]"
                >
                  {copy.civic.bn}
                </p>
              </Reveal>
              <Reveal delay={220}>
                <p
                  lang="en"
                  className="quiet-serif mt-4 text-[15px] italic leading-[1.75] text-[hsl(var(--quiet-ink))]/45 sm:text-[16px]"
                >
                  {copy.civic.en}
                </p>
              </Reveal>
            </div>
          </Movement>

          {/* ────────────── 07 Closing breath ────────────── */}
          <Movement>
            <div className="mx-auto w-full max-w-3xl text-center">
              <Reveal>
                <div
                  className="mx-auto mb-16 h-px w-16"
                  style={{ backgroundColor: "hsl(var(--quiet-accent) / 0.55)" }}
                />
              </Reveal>
              <Reveal delay={240}>
                <p
                  lang="bn"
                  className="quiet-display text-[28px] leading-[1.45] text-[hsl(var(--quiet-ink))]/90 sm:text-[40px] md:text-[52px]"
                >
                  {copy.closing.bn}
                </p>
              </Reveal>
              <Reveal delay={520}>
                <p
                  lang="en"
                  className="quiet-serif mt-6 text-[15px] italic text-[hsl(var(--quiet-ink))]/45 sm:text-[17px]"
                >
                  {copy.closing.en}
                </p>
              </Reveal>
              <Reveal delay={900}>
                <div className="mt-24 flex flex-col items-center gap-4">
                  <Link
                    to="/the-stand"
                    lang="en"
                    className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--quiet-ink))]/45 transition-colors hover:text-[hsl(var(--quiet-ink))]/85 sm:text-[11px]"
                  >
                    The Stand →
                  </Link>
                  <Link
                    to="/"
                    lang="en"
                    className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--quiet-ink))]/30 transition-colors hover:text-[hsl(var(--quiet-ink))]/65 sm:text-[11px]"
                  >
                    Home
                  </Link>
                </div>
              </Reveal>
            </div>
          </Movement>
        </div>
      </main>
    </>
  );
}

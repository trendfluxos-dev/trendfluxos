import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SHOWCASE_ITEMS } from "@/data/showcase";

/**
 * /brands — browse index of every brand / product surface under the
 * TrendFlux umbrella. Replaces the old 404 by surfacing the real pages
 * directly (TrendFlux Space, VerdaFlux Spectrum, কর্মশিক্ষা, Luxe Veil,
 * BrandToki, Talent, Enterprise, The Stand, Justice Appeal, etc.).
 */
const BRAND_IDS = [
  "trendflux-space",
  "verdaflux-spectrum",
  "kormoshikkha",
  "trendflux-ecosystem",
  "luxe-veil",
  "brandtoki",
  "trendflux-talent",
  "enterprise-control",
  "the-stand",
  "masterclass",
  "justice-appeal",
  "pabna-nagarik",
];

const Brands = () => {
  const items = BRAND_IDS
    .map((id) => SHOWCASE_ITEMS.find((s) => s.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x && !!x.href);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>Brands · TrendFlux Ecosystem</title>
        <meta
          name="description"
          content="Browse every brand and product surface under the TrendFlux ecosystem — TrendFlux Space, VerdaFlux Spectrum, কর্মশিক্ষা EdTech, Luxe Veil, BrandToki, Talent, Enterprise and more."
        />
        <link rel="canonical" href="https://trendflux.digital/brands" />
      </Helmet>

      <main className="container mx-auto px-4 py-16 lg:py-24">
        <header className="max-w-2xl mb-12">
          <p className="cd-eyebrow mb-3">Ecosystem · Browse</p>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">
            Brands &amp; Products
          </h1>
          <p className="mt-4 text-muted-foreground">
            Every live surface under the TrendFlux Digital umbrella — open any
            to explore directly.
          </p>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b) => {
            const isExternal = b.external || b.href!.startsWith("http");
            const content = (
              <article className="cd-card h-full p-5 flex flex-col gap-3 group">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-snug">
                    {b.title}
                  </h2>
                  {isExternal ? (
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {b.summary}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {b.tags?.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase tracking-wider rounded-full border border-foreground/15 px-2 py-0.5 text-foreground/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            );
            return (
              <li key={b.id}>
                {isExternal ? (
                  <a
                    href={b.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    to={b.href!}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default Brands;
import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, BookOpen, ArrowLeft, CalendarCheck, MessageCircle, Smartphone, FileText } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectLeadBookingDialog from "@/components/project-lead/ProjectLeadBookingDialog";
import jobApplyPdf from "@/assets/ebooks/job-apply-v2.pdf.asset.json";
import jobApplyCover from "@/assets/ebooks/job-apply-v2-cover.jpg.asset.json";
import jobApplyEpub from "@/assets/ebooks/job-apply-v2.epub.asset.json";
import jobApplyEpubPhone from "@/assets/ebooks/job-apply-v2-phone.epub.asset.json";
import clientHuntingPdf from "@/assets/ebooks/client-hunting-v2.pdf.asset.json";
import clientHuntingCover from "@/assets/ebooks/client-hunting-v2-cover.jpg.asset.json";
import marriagePdf from "@/assets/ebooks/marriage-v2.pdf.asset.json";
import marriageCover from "@/assets/ebooks/marriage-v2-cover.jpg.asset.json";
import profilePdf from "@/assets/ebooks/profile-v2.pdf.asset.json";
import profileCover from "@/assets/ebooks/profile-v2-cover.jpg.asset.json";

type VersionKey = "v1" | "v2";

type EbookVersion = {
  pages: number;
  sizeLabel: string;
  cover: string | null;
  pdf: string | null;
  filename: string;
};

type Ebook = {
  slug: string;
  title: string;
  tagline: string;
  versions: Record<VersionKey, EbookVersion | null>;
  defaultVersion: VersionKey;
};

// v1 pointers will be dropped in as they're uploaded. Until then, set to null
// and the selector will show the v1 tab as disabled ("Coming soon").
const EBOOKS: Ebook[] = [
  {
    slug: "job-apply-playbook",
    title: "Job-Apply Playbook",
    tagline:
      "Operator-grade CV, cover-letter and outreach system for landing interviews without spraying applications.",
    defaultVersion: "v2",
    versions: {
      v1: null,
      v2: {
        pages: 10,
        sizeLabel: "PDF",
        cover: jobApplyCover.url,
        pdf: jobApplyPdf.url,
        filename: "JobApply_Playbook_v2.pdf",
      },
    },
  },
  {
    slug: "client-hunting-playbook",
    title: "Client-Hunting Playbook",
    tagline:
      "The full inbound + outbound stack for freelancers and agencies to book qualified clients on repeat.",
    defaultVersion: "v2",
    versions: {
      v1: null,
      v2: {
        pages: 9,
        sizeLabel: "PDF",
        cover: clientHuntingCover.url,
        pdf: clientHuntingPdf.url,
        filename: "ClientHunting_Playbook_v2.pdf",
      },
    },
  },
  {
    slug: "marriage-based-playbook",
    title: "Marriage-Based Playbook",
    tagline:
      "A calm, values-first guide to choosing a life partner with clarity — filters, conversations and the 30-day decision protocol.",
    defaultVersion: "v2",
    versions: {
      v1: null,
      v2: {
        pages: 9,
        sizeLabel: "PDF",
        cover: marriageCover.url,
        pdf: marriagePdf.url,
        filename: "Marriage_Playbook_v2.pdf",
      },
    },
  },
  {
    slug: "profile-based-playbook",
    title: "Profile-Based Playbook",
    tagline:
      "Build a founder profile that opens doors: positioning, pitch, LinkedIn, proof stack and the referral loop.",
    defaultVersion: "v2",
    versions: {
      v1: null,
      v2: {
        pages: 9,
        sizeLabel: "PDF",
        cover: profileCover.url,
        pdf: profilePdf.url,
        filename: "Profile_Playbook_v2.pdf",
      },
    },
  },
];

const VERSION_ORDER: VersionKey[] = ["v1", "v2"];

const EbookCard = ({ book }: { book: Ebook }) => {
  const [active, setActive] = useState<VersionKey>(book.defaultVersion);
  const current = book.versions[active];

  return (
    <article
      id={book.slug}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative block aspect-[3/4] overflow-hidden bg-muted">
        {current?.cover ? (
          <a
            href={current.pdf ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preview ${book.title} ${active}`}
            className="block h-full w-full"
          >
            <img
              src={current.cover}
              alt={`${book.title} ${active} cover`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </a>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted p-6 text-center text-sm text-muted-foreground">
            {active.toUpperCase()} cover coming soon
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md">
          {active.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div
          role="tablist"
          aria-label={`${book.title} version`}
          className="mb-4 inline-flex self-start rounded-lg border border-border bg-muted/50 p-1"
        >
          {VERSION_ORDER.map((v) => {
            const available = Boolean(book.versions[v]?.pdf);
            const isActive = active === v;
            return (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${book.slug}-panel`}
                disabled={!available}
                onClick={() => available && setActive(v)}
                className={
                  "rounded-md px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors " +
                  (isActive
                    ? "bg-background text-foreground shadow-sm"
                    : available
                      ? "text-muted-foreground hover:text-foreground"
                      : "cursor-not-allowed text-muted-foreground/50")
                }
                title={available ? `Show ${v.toUpperCase()}` : `${v.toUpperCase()} — coming soon`}
              >
                {v.toUpperCase()}
                {!available && <span className="ml-1 opacity-70">·soon</span>}
              </button>
            );
          })}
        </div>

        <div id={`${book.slug}-panel`} role="tabpanel">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{current?.pages ?? "—"} pages</span>
            <span aria-hidden>•</span>
            <span>{current?.sizeLabel ?? "PDF"}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {book.title}{" "}
            <span className="text-muted-foreground">{active}</span>
          </h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">{book.tagline}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild={Boolean(current?.pdf)} disabled={!current?.pdf} className="gap-2">
              {current?.pdf ? (
                <a
                  href={current.pdf}
                  download={current.filename}
                  title={`Download ${book.title} ${active.toUpperCase()} (PDF)`}
                  aria-label={`Download ${book.title} ${active.toUpperCase()} as PDF`}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              ) : (
                <span>
                  <Download className="h-4 w-4" />
                  Download PDF
                </span>
              )}
            </Button>
            <Button
              asChild={Boolean(current?.pdf)}
              disabled={!current?.pdf}
              variant="outline"
              className="gap-2"
            >
              {current?.pdf ? (
                <a
                  href={current.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Preview ${book.title} ${active.toUpperCase()} in browser`}
                  aria-label={`Preview ${book.title} ${active.toUpperCase()} in browser`}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </a>
              ) : (
                <span>
                  <Eye className="h-4 w-4" />
                  Preview
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

const Ebooks = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const canonicalPath = "/ebooks";
  const canonicalUrl = `${BRAND.url}${canonicalPath}`;
  const seoTitle =
    "Operator Playbooks — Free PDF & EPUB Downloads | TrendFlux";
  const seoDescription =
    "Download TrendFlux's operator playbooks: Job-Apply, Client-Hunting, Profile-Based and Marriage-Based (v2). Free PDF for desktop, EPUB for mobile — preview in-browser or grab the file.";
  const ogImage = jobApplyCover.url;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TrendFlux Operator Playbooks",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: EBOOKS.length,
    itemListElement: EBOOKS.map((book, i) => {
      const v = book.versions[book.defaultVersion];
      const isJobApply = book.slug === "job-apply-playbook";
      const encodings: Array<{
        "@type": "MediaObject";
        contentUrl: string;
        encodingFormat: string;
        name: string;
      }> = [];
      if (v?.pdf) {
        encodings.push({
          "@type": "MediaObject",
          contentUrl: v.pdf,
          encodingFormat: "application/pdf",
          name: `${book.title} (PDF)`,
        });
      }
      if (isJobApply) {
        encodings.push({
          "@type": "MediaObject",
          contentUrl: jobApplyEpub.url,
          encodingFormat: "application/epub+zip",
          name: `${book.title} (EPUB)`,
        });
        encodings.push({
          "@type": "MediaObject",
          contentUrl: jobApplyEpubPhone.url,
          encodingFormat: "application/epub+zip",
          name: `${book.title} (EPUB · Phone Edition)`,
        });
      }
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          name: `${book.title} v2`,
          description: book.tagline,
          author: { "@type": "Person", name: "ZAHID HASAN EMON" },
          publisher: { "@type": "Organization", name: BRAND.name },
          inLanguage: "en",
          numberOfPages: v?.pages,
          image: v?.cover,
          url: `${canonicalUrl}#${book.slug}`,
          bookFormat: "https://schema.org/EBook",
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: v?.pdf ?? canonicalUrl,
          },
          encoding: encodings,
        },
      };
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BRAND.url },
      { "@type": "ListItem", position: 2, name: "eBooks", item: canonicalUrl },
    ],
  };

  useSeo({
    title: seoTitle,
    description: seoDescription,
    canonical: canonicalPath,
    type: "website",
    image: ogImage,
    imageAlt: "TrendFlux Operator Playbooks — Job-Apply v2 cover",
    imageType: "image/jpeg",
    jsonLd: [itemListJsonLd, breadcrumbJsonLd],
  });

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className="uppercase tracking-wider">
              Operator Library
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            eBooks &amp; Playbooks
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Field-tested playbooks from the TrendFlux desk. Preview a book in
            your browser, or download the full PDF to keep on hand.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-2">
          {EBOOKS.map((book) => (
            <EbookCard key={book.slug} book={book} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <Badge variant="secondary" className="uppercase tracking-wider">
                Downloads · Job-Apply Playbook v2
              </Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Pick the format that fits your device
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                The PDF keeps the print-ready layout. The EPUB reflows text and
                scales fonts smoothly on phones — best for reading on Apple
                Books, Google Play Books or any e-reader app.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:min-w-[22rem]">
              <a
                href={jobApplyPdf.url}
                download="JobApply_Playbook_v2.pdf"
                className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    PDF
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Print layout
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Desktop &amp; tablet · fixed pages
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    Download .pdf
                  </span>
                </div>
              </a>
              <a
                href={jobApplyEpub.url}
                download="JobApply_Playbook_v2.epub"
                className="group flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 transition-colors hover:border-primary hover:bg-primary/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    EPUB
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                      Mobile
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reflows text · scales fonts
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    Download .epub
                  </span>
                </div>
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tip · on iPhone, tap the EPUB link and choose <em>Open in Books</em>.
            On Android, install <em>Google Play Books</em> or <em>Moon+ Reader</em>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-12">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr,1fr] md:items-center">
            <div>
              <Badge variant="secondary" className="uppercase tracking-wider">
                Ready to apply this?
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Book a strategy call with the Project Lead
              </h2>
              <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
                30 minutes with Zahid Hasan Emon to map the playbook to your
                exact situation — CV, offer, funnel or partner search. You leave
                with a written next-step plan.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <CalendarCheck className="mt-0.5 h-4 w-4 text-primary" />
                  Google Meet, auto-scheduled
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                  WhatsApp fallback if you prefer chat first
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button
                size="lg"
                variant="hero"
                className="gap-2"
                onClick={() => setBookingOpen(true)}
              >
                <CalendarCheck className="h-4 w-4" />
                Book a strategy call
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <a
                  href="https://wa.me/message/5GSNUYK6CSDCN1"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </Button>
              <p className="text-xs text-muted-foreground md:text-right">
                Usually confirmed within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProjectLeadBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </main>
  );
};

export default Ebooks;
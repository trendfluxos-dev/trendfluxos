import { Link } from "react-router-dom";
import { Download, Eye, BookOpen, ArrowLeft } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import jobApplyPdf from "@/assets/ebooks/job-apply-v2.pdf.asset.json";
import jobApplyCover from "@/assets/ebooks/job-apply-v2-cover.jpg.asset.json";
import clientHuntingPdf from "@/assets/ebooks/client-hunting-v2.pdf.asset.json";
import clientHuntingCover from "@/assets/ebooks/client-hunting-v2-cover.jpg.asset.json";

type Ebook = {
  slug: string;
  title: string;
  tagline: string;
  version: string;
  pages: number;
  sizeLabel: string;
  cover: string;
  pdf: string;
  filename: string;
};

const EBOOKS: Ebook[] = [
  {
    slug: "job-apply-playbook",
    title: "Job-Apply Playbook",
    tagline:
      "Operator-grade CV, cover-letter and outreach system for landing interviews without spraying applications.",
    version: "v2",
    pages: 10,
    sizeLabel: "PDF",
    cover: jobApplyCover.url,
    pdf: jobApplyPdf.url,
    filename: "JobApply_Playbook_v2.pdf",
  },
  {
    slug: "client-hunting-playbook",
    title: "Client-Hunting Playbook",
    tagline:
      "The full inbound + outbound stack for freelancers and agencies to book qualified clients on repeat.",
    version: "v2",
    pages: 9,
    sizeLabel: "PDF",
    cover: clientHuntingCover.url,
    pdf: clientHuntingPdf.url,
    filename: "ClientHunting_Playbook_v2.pdf",
  },
];

const Ebooks = () => {
  useSeo({
    title: "eBooks — Operator Playbooks (v2) | TrendFlux",
    description:
      "Download the latest TrendFlux operator playbooks: Job-Apply v2 and Client-Hunting v2. Preview in-browser or grab the PDF.",
    canonical: `${BRAND.url}/ebooks`,
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
            <article
              key={book.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
            >
              <a
                href={book.pdf}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Preview ${book.title} ${book.version}`}
                className="relative block aspect-[3/4] overflow-hidden bg-muted"
              >
                <img
                  src={book.cover}
                  alt={`${book.title} ${book.version} cover`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute left-4 top-4 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  {book.version.toUpperCase()}
                </span>
              </a>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{book.pages} pages</span>
                  <span aria-hidden>•</span>
                  <span>{book.sizeLabel}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  {book.title}{" "}
                  <span className="text-muted-foreground">{book.version}</span>
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {book.tagline}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="gap-2">
                    <a href={book.pdf} download={book.filename}>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <a
                      href={book.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Ebooks;
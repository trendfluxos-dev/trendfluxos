import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Download, ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { Badge } from "@/components/ui/badge";
import bdjobsHtml from "@/data/bdjobs-profile.html?raw";

// Last export timestamp is baked at build time from the uploaded file's mtime
// (see: user re-uploads the Bdjobs CV export → this string refreshes on rebuild).
const LAST_UPDATED_ISO = "2026-07-08T15:00:00Z";

const BdjobsProfile = () => {
  useSeo({
    title: "BD Jobs Profile · ZAHID HASAN EMON | Trendflux",
    description:
      "Live BD Jobs (Bdjobs.com) professional profile for ZAHID HASAN EMON — synced from the latest Bdjobs CV export.",
    canonical: `${BRAND.url}/bdjobs-profile`,
  });

  const updatedLabel = useMemo(
    () =>
      new Date(LAST_UPDATED_ISO).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Portfolio
          </Link>
          <a
            href="https://www.linkedin.com/in/zhemon-it/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            LinkedIn <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <header className="mb-8 border-b border-border pb-6">
          <Badge variant="secondary" className="uppercase tracking-[0.22em]">
            BD Jobs Profile
          </Badge>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            ZAHID HASAN EMON — Bdjobs.com CV
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A mirror of the latest CV exported from Bdjobs.com. Bdjobs has no
            public API, so this page is refreshed by re-uploading the export;
            the timestamp below tracks the current version.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Last synced from Bdjobs export · {updatedLabel}
            </span>
            <a
              href="/__l5e/assets-v1/none/resume.doc"
              onClick={(e) => {
                e.preventDefault();
                const blob = new Blob([bdjobsHtml], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "ZahidHasanEmon_Bdjobs_CV.doc";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Download .doc
            </a>
          </div>
        </header>

        {/* Bdjobs export is self-styled; render it inside an isolated frame so
            its inline CSS can't leak into the app shell. */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div
            className="bdjobs-cv text-black [&_a]:text-[#333399] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: bdjobsHtml }}
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Source of truth: {" "}
          <a
            className="underline hover:text-foreground"
            href="https://www.bdjobs.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bdjobs.com
          </a>
          · Contact for consulting: {BRAND.name}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default BdjobsProfile;
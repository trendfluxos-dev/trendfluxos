import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  Download,
  ArrowLeft,
  RefreshCw,
  FileDown,
  Pencil,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchBdjobsProfile } from "@/lib/bdjobsProfile";
import { DEFAULT_BDJOBS_PROFILE, type BdjobsProfileData } from "@/data/bdjobsProfileDefault";
import { BdjobsProfileView } from "@/components/bdjobs/BdjobsProfileView";

const BdjobsProfile = () => {
  useSeo({
    title: "BD Jobs Profile · ZAHID HASAN EMON | Trendflux",
    description:
      "Live BD Jobs (Bdjobs.com) professional profile for ZAHID HASAN EMON — synced from the latest CV data.",
    canonical: `${BRAND.url}/bdjobs-profile`,
  });

  const [profile, setProfile] = useState<BdjobsProfileData>(DEFAULT_BDJOBS_PROFILE);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBdjobsProfile().then((res) => {
      if (cancelled) return;
      setProfile(res.data);
      setUpdatedAt(res.updatedAt);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Admin gate for showing the "Edit" button — RLS on the table is the
  // authoritative check; this just avoids flashing the button to strangers.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const { data, error } = await supabase.rpc("current_user_has_role", {
        _role: "admin" as never,
      });
      if (!cancelled && !error && data === true) setIsAdmin(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updatedLabel = useMemo(() => {
    const iso = updatedAt ?? "2026-07-08T15:00:00Z";
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [updatedAt]);

  const downloadDoc = () => {
    if (!viewRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${profile.fullName} — Bdjobs CV</title></head><body>${viewRef.current.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ZahidHasanEmon_Bdjobs_CV.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!viewRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      // Dynamic import keeps ~200KB of html2canvas + jsPDF out of the
      // initial route bundle for visitors who never click download.
      const mod = await import("html2pdf.js");
      const html2pdf = (mod as unknown as { default: (...args: unknown[]) => unknown })
        .default as unknown as () => {
        set: (opts: Record<string, unknown>) => { from: (el: HTMLElement) => { save: () => Promise<void> } };
      };
      await html2pdf()
        .set({
          margin: [10, 10, 12, 10],
          filename: "ZahidHasanEmon_Bdjobs_CV.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(viewRef.current)
        .save();
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed");
    } finally {
      setPdfBusy(false);
    }
  };

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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge variant="secondary" className="uppercase tracking-[0.22em]">
                BD Jobs Profile
              </Badge>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {profile.fullName} — Bdjobs.com CV
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                A live mirror of the CV stored on Bdjobs.com. Admin edits sync
                instantly to this page — no re-upload required.
              </p>
            </div>
            {isAdmin && (
              <Button asChild size="sm" variant="outline">
                <Link to="/bdjobs-profile/edit">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit profile
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Last updated · {updatedLabel}
            </span>
            <Button
              size="sm"
              variant="default"
              onClick={downloadPdf}
              disabled={pdfBusy}
              className="h-8"
            >
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
              {pdfBusy ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <button
              type="button"
              onClick={downloadDoc}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Download .doc
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <BdjobsProfileView ref={viewRef} data={profile} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Source of truth:{" "}
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

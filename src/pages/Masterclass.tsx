import { useEffect } from "react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { EDTECH } from "@/config/edtech";

/**
 * Advanced AI Masterclass now lives on the কর্মশিক্ষা TED Plus edtech platform.
 * This route is preserved for backward-compatible links and SEO continuity,
 * and performs a fast client-side redirect to the platform.
 */
const Masterclass = () => {
  useEffect(() => {
    window.location.replace(EDTECH.url);
  }, []);

  useSeo({
    title: "Advanced AI Masterclass — AI Growth Operator | TrendFlux",
    description:
      "Operator-grade AI training: automation, content, and growth systems. Hosted on কর্মশিক্ষা TED Plus — TrendFlux's online edtech platform.",
    canonical: `${BRAND.url}/masterclass`,
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Advanced AI Masterclass — Digital Growth & Transformation",
    description:
      "Operator-grade AI training delivered on কর্মশিক্ষা TED Plus — TrendFlux's online edtech platform.",
    provider: { "@type": "Organization", name: BRAND.legalName, url: BRAND.url },
    url: EDTECH.url,
  });

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">
        Redirecting to {EDTECH.name} —{" "}
        <a
          href={EDTECH.url}
          className="text-primary underline-offset-4 hover:underline"
        >
          open the platform
        </a>
      </p>
    </main>
  );
};

export default Masterclass;

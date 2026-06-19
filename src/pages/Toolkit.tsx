import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";

/**
 * /toolkit is now a thin entry point that routes traffic into the
 * conversion-optimized Advanced AI Masterclass funnel.
 * - Logged-in students → paid module dashboard
 * - Cold traffic       → /masterclass landing page
 */
const Toolkit = () => {
  const navigate = useNavigate();

  useSeo({
    title: "Growth Operator Toolkit — Advanced AI Masterclass | TrendFlux",
    description:
      "Operator-grade AI training: workflows, automation, content scaling and growth systems. Limited batch.",
    canonical: `${BRAND.url}/toolkit`,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      navigate(data.session ? "/course/trendflux" : "/masterclass", {
        replace: true,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </main>
  );
};

export default Toolkit;

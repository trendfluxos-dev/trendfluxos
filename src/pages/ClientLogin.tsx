import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";
import { ENTERPRISE } from "@/config/enterprise";
import { track } from "@/lib/analytics";
import logo from "@/assets/trendflux-enterprise-mark.png";

const ClientLogin = () => {
  const navigate = useNavigate();

  useSeo({
    title: "Client Login — TrendFlux Enterprise Control",
    description: "Sign in to the TrendFlux Enterprise Control workspace.",
    noindex: true,
  });

  useEffect(() => {
    track("enterprise_portal_open", { location: "client_login_route" });
    // Open portal in a new tab without window features to ensure tab (not popup)
    const opened = window.open(ENTERPRISE.portalUrl, "_blank");
    if (!opened) {
      track("enterprise_portal_popup_blocked", { location: "client_login_route" });
    }
    const t = window.setTimeout(() => navigate("/enterprise", { replace: true }), 1800);
    return () => window.clearTimeout(t);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="glass-strong rounded-3xl p-10 max-w-lg w-full text-center">
        <img
          src={logo}
          alt="TrendFlux Enterprise Control"
          className="h-16 w-auto mx-auto object-contain"
        />
        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary bg-primary/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          Client Login
        </div>
        <h1 className="mt-5 font-display text-2xl md:text-3xl font-bold">
          Opening Enterprise Control…
        </h1>
        <p className="mt-3 text-foreground/65 leading-relaxed">
          The portal is opening in a new tab. If nothing happened, your browser may have
          blocked the popup — use the button below.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            variant="hero"
            size="lg"
            asChild
          >
            <a
              href={ENTERPRISE.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("enterprise_portal_open", { location: "client_login_fallback" })
              }
            >
              <ExternalLink className="w-4 h-4" />
              Open Enterprise Portal
            </a>
          </Button>
          <Button variant="outline" onClick={() => navigate("/enterprise")}>
            Back to TrendFlux
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ClientLogin;

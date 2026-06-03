import ConsentBanner from "@/components/ConsentBanner";
import { useConsentBannerEnabled } from "@/hooks/useConsentBannerEnabled";

/**
 * Renders the consent banner only when the per-environment toggle in
 * `site_settings` is enabled. Keeps App.tsx free of the DB lookup.
 */
const ConsentBannerGate = () => {
  const enabled = useConsentBannerEnabled();
  if (!enabled) return null;
  return <ConsentBanner />;
};

export default ConsentBannerGate;

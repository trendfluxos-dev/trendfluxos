/**
 * Enterprise Control portal configuration.
 * Swap PORTAL_URL to the custom subdomain (https://enterprise.trendflux.digital)
 * once DNS is connected — every link on the site will update automatically.
 */
export const ENTERPRISE = {
  name: "TrendFlux Enterprise Control",
  shortName: "Enterprise Control",
  tagline: "Automation · Compliance · Blockchain Audit",
  description:
    "A premium enterprise operating system: master-data-driven automation, ERP/DSS workflows, AI analytics, compliance monitoring, vendor tracking and a blockchain-style audit ledger — all under role-based access.",
  portalUrl: "https://nexus-pro-vault.lovable.app",
  signupUrl: "https://nexus-pro-vault.lovable.app/signup",
} as const;

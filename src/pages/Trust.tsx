import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TfSection, TfCard } from "@/components/tf/Section";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Database,
  Cookie,
  UserCheck,
  FileText,
  AlertCircle,
  Mail,
} from "lucide-react";

/**
 * Customer-facing trust page. App-owned editable content — not a
 * certification, audit, or third-party verification. Describes the
 * controls and practices currently enabled in this app and the
 * shared responsibility between the platform, this app owner,
 * and customers.
 */
const SECTIONS = [
  {
    icon: UserCheck,
    title: "Access & authentication",
    body: "Sign-in is handled by our managed auth provider. Administrative areas are protected by server-side role checks stored in a dedicated roles table — never on user profile records. Public pages remain accessible without an account.",
  },
  {
    icon: ShieldCheck,
    title: "Platform & hosting",
    body: "The site is delivered through a global CDN over HTTPS with automatically renewed TLS certificates. Backend data, authentication, and serverless functions run on our managed cloud backend.",
  },
  {
    icon: Database,
    title: "Data collection & use",
    body: "We only collect the information you submit through forms (e.g. contact, project lead, enrollment) and the technical metadata required to deliver the site. Submissions are used to respond to your inquiry and operate the requested service — not sold to third parties.",
  },
  {
    icon: Lock,
    title: "Row-level security",
    body: "Database tables that store user-submitted records have row-level security enabled with explicit policies. Administrative read access requires an authenticated session with an assigned admin role.",
  },
  {
    icon: Cookie,
    title: "Cookies & analytics",
    body: "A consent banner is shown on first visit. Analytics tags load in a denied state until you explicitly accept, in line with Google Consent Mode v2. You can decline at any time without losing access to the site.",
  },
  {
    icon: FileText,
    title: "Retention & deletion",
    body: "Lead and inquiry submissions are retained for as long as needed to follow up on your request. You can request deletion of records associated with your email address by contacting us — see below.",
  },
  {
    icon: AlertCircle,
    title: "Incident & vulnerability reporting",
    body: "If you believe you've found a security issue affecting this site, please report it privately so we can investigate and remediate before any public disclosure. We do not run a paid bug bounty at this time.",
  },
] as const;

const Trust = () => {
  useSeo({
    title: "Trust, Security & Privacy — TrendFlux",
    description:
      "How TrendFlux handles access, data, cookies, and security. App-owned editable content describing controls currently enabled in this app.",
    canonical: `${BRAND.url}/trust`,
  });

  return (
    <main className="min-h-dvh bg-background text-foreground font-sans antialiased">
      <Navbar />

      <TfSection
        className="pt-40"
        eyebrow="Trust"
        title="Security, privacy & how this site is operated"
        titleAs="h1"
        intro={
          <>
            This page is maintained by the {BRAND.legalName} team to answer
            common security and privacy questions about {BRAND.name}. It is
            app-owned editable content and is <strong>not</strong> a
            certification or independent third-party verification.
          </>
        }
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/40 p-6 text-sm leading-relaxed text-foreground/75">
          <p>
            <strong className="text-foreground">Shared responsibility.</strong>{" "}
            Our hosting and backend providers operate the underlying
            infrastructure. {BRAND.legalName} configures application-level
            controls (auth roles, RLS policies, consent, retention). You are
            responsible for safeguarding your own account credentials and the
            information you choose to share with us.
          </p>
        </div>
      </TfSection>

      <TfSection tone="muted" title="What's enabled today" align="left">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <TfCard key={title} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                    {body}
                  </p>
                </div>
              </div>
            </TfCard>
          ))}
        </div>
      </TfSection>

      <TfSection title="Privacy requests & security contact" align="left">
        <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-foreground/75">
          <p>
            To request a copy or deletion of personal data you've submitted, or
            to report a suspected security issue, please reach out through our{" "}
            <Link to="/contact" className="story-link text-foreground underline-offset-4">
              contact page
            </Link>
            . Include enough detail for us to verify the request and respond
            appropriately.
          </p>
          <div className="flex items-center gap-2 pt-2 text-foreground/60">
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span>We aim to acknowledge security reports within 5 business days.</span>
          </div>
          <p className="pt-4 text-xs text-foreground/45">
            Last reviewed: {new Date().toISOString().split("T")[0]}. This page
            describes current app-level practices and may change as the product
            evolves. It is not a contract, warranty, or compliance
            certification.
          </p>
        </div>
      </TfSection>

      <Footer />
    </main>
  );
};

export default Trust;
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { Link } from "react-router-dom";

const LAST_UPDATED = "June 30, 2026";
const CONTROLLER = "TrendFlux — operated by Zahid Hasan Emon (Pabna, Bangladesh)";
const CONTACT_EMAIL = "privacy@trendflux.digital";

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 space-y-3">
    <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
      {title}
    </h2>
    <div className="text-[15px] leading-relaxed text-foreground/75 space-y-3">
      {children}
    </div>
  </section>
);

const TOC = [
  ["who", "Who we are"],
  ["scope", "Scope of this policy"],
  ["data", "What data we collect"],
  ["use", "How we use your data"],
  ["legal", "Legal basis"],
  ["share", "Subprocessors & sharing"],
  ["cookies", "Cookies & analytics"],
  ["retention", "Retention & deletion"],
  ["rights", "Your rights"],
  ["security", "Security"],
  ["children", "Children"],
  ["changes", "Changes to this policy"],
  ["contact", "Contact"],
] as const;

const Privacy = () => {
  useSeo({
    title: "Privacy Policy — TrendFlux",
    description:
      "How TrendFlux collects, uses, stores and protects your data across the ecosystem — including the EdTech platform, live classes, and brand sites.",
    canonical: `${BRAND.url}/privacy`,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="px-6 lg:px-10 pt-28 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45 mb-3">
              Legal · Privacy
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-foreground/65 max-w-2xl leading-relaxed">
              This page is maintained by the TrendFlux team to explain what data
              the TrendFlux ecosystem collects, why, and what control you have
              over it. It is informational and is not a certification or a legal
              opinion.
            </p>
            <p className="mt-2 text-sm text-foreground/45">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
            {/* TOC */}
            <nav
              aria-label="On this page"
              className="lg:sticky lg:top-24 self-start text-sm"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40 mb-3">
                On this page
              </p>
              <ul className="space-y-2">
                {TOC.map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Body */}
            <article className="space-y-10">
              <Section id="who" title="1. Who we are">
                <p>
                  The TrendFlux ecosystem (this website and its sub-brands —
                  including the EdTech platform at <code>/edtech</code>, Studio
                  BrandToki, Luxe Veil, TrendFlux Space and VerdaFlux Spectrum)
                  is operated by <strong>{CONTROLLER}</strong>, acting as the
                  data controller for personal data processed through these
                  surfaces.
                </p>
                <p>
                  For any privacy question, write to{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </Section>

              <Section id="scope" title="2. Scope of this policy">
                <p>
                  This policy covers the websites and applications hosted under{" "}
                  <code>trendflux.digital</code> and its connected sub-brand
                  pages. Some features are powered by third-party platforms
                  (sign-in, payments, analytics, hosting) — when you use those,
                  their own privacy terms also apply. We list the main ones
                  under "Subprocessors & sharing" below.
                </p>
                <p className="text-foreground/55 text-sm">
                  Shared responsibility: we control how data is requested and
                  stored inside our app, but each integrated platform controls
                  what it collects on its own surface. You also control which
                  optional features (analytics, cookies, marketing emails) you
                  enable.
                </p>
              </Section>

              <Section id="data" title="3. What data we collect">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Account data</strong> — name, email and avatar you
                    provide when signing in (email, Google or Apple sign-in).
                  </li>
                  <li>
                    <strong>Profile &amp; role data</strong> — learner / teacher
                    / tutor / admin role, course enrolments, bookings and any
                    profile fields you fill in.
                  </li>
                  <li>
                    <strong>Learning activity</strong> — lessons viewed,
                    progress, quiz answers, certificate issuance and live-class
                    attendance.
                  </li>
                  <li>
                    <strong>Communications</strong> — messages you send through
                    contact forms, project-lead booking, marriage-profile
                    inquiries or support.
                  </li>
                  <li>
                    <strong>Live class &amp; voice content</strong> — audio,
                    video and chat that you choose to publish into a live room
                    or voice studio you joined.
                  </li>
                  <li>
                    <strong>Technical data</strong> — IP address, browser type,
                    device, referrer, pages visited, performance metrics (LCP /
                    CLS / INP) and error logs needed to keep the site running.
                  </li>
                  <li>
                    <strong>Cookies &amp; analytics</strong> — see the Cookies
                    section below. Analytics only run after you accept the
                    consent banner.
                  </li>
                </ul>
                <p>
                  We do not knowingly collect government IDs, financial card
                  numbers, biometric data or other sensitive categories through
                  this site. Payments, if any, are handled by the relevant
                  payment provider on their own surface.
                </p>
              </Section>

              <Section id="use" title="4. How we use your data">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create and secure your account.</li>
                  <li>
                    Deliver the service you asked for — course access, live
                    classes, certificate verification, booking confirmations.
                  </li>
                  <li>
                    Send operational messages (sign-in links, enrolment
                    receipts, class reminders).
                  </li>
                  <li>
                    Improve performance, fix bugs and prevent abuse using
                    aggregated technical metrics and error logs.
                  </li>
                  <li>
                    Comply with applicable law and respond to lawful requests.
                  </li>
                </ul>
                <p>
                  We do not sell your personal data, and we do not use your
                  content to train third-party AI models without your explicit
                  consent.
                </p>
              </Section>

              <Section id="legal" title="5. Legal basis">
                <p>
                  Depending on where you are located, we rely on one or more of
                  the following: <em>performance of a contract</em> (delivering
                  the service you signed up for), <em>legitimate interests</em>{" "}
                  (keeping the site secure and improving it),{" "}
                  <em>consent</em> (analytics, marketing emails, optional
                  cookies) and <em>legal obligation</em> (responding to lawful
                  requests).
                </p>
              </Section>

              <Section id="share" title="6. Subprocessors & sharing">
                <p>
                  We use a small set of trusted infrastructure providers to run
                  the service. They process data on our behalf under their own
                  security terms:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Cloud backend &amp; database</strong> — for
                    authentication, database, file storage and serverless
                    functions.
                  </li>
                  <li>
                    <strong>OAuth providers</strong> — Google and Apple, only
                    when you choose to sign in with them.
                  </li>
                  <li>
                    <strong>Analytics</strong> — Google Analytics 4 with Consent
                    Mode v2 (only after you accept the consent banner).
                  </li>
                  <li>
                    <strong>Live class infrastructure</strong> — WebRTC / Jitsi
                    components used to deliver real-time audio &amp; video.
                  </li>
                  <li>
                    <strong>Email &amp; notifications</strong> — transactional
                    email and Telegram bot used for operational notifications.
                  </li>
                  <li>
                    <strong>Hosting / CDN</strong> — Vercel / Lovable
                    infrastructure used to serve the site.
                  </li>
                </ul>
                <p>
                  We do not share personal data with advertisers or data
                  brokers.
                </p>
              </Section>

              <Section id="cookies" title="7. Cookies & analytics">
                <p>
                  We use a minimal set of cookies and similar storage:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Strictly necessary</strong> — sign-in session,
                    consent choice, theme preference. These are always on.
                  </li>
                  <li>
                    <strong>Analytics</strong> — Google Analytics 4, loaded
                    only after you click "Accept" on the consent banner.
                  </li>
                </ul>
                <p>
                  You can change your choice any time by clearing site data in
                  your browser, which will make the consent banner appear
                  again.
                </p>
              </Section>

              <Section id="retention" title="8. Retention & deletion">
                <p>
                  We keep personal data for as long as your account is active
                  or as long as needed to provide the service. When you ask us
                  to delete your account, we remove or anonymise your personal
                  data within <strong>30 days</strong>, except where we are
                  required to keep limited records (for example financial or
                  legal records, or to defend a claim).
                </p>
                <p>
                  Aggregated, non-identifying analytics may be kept longer.
                </p>
              </Section>

              <Section id="rights" title="9. Your rights">
                <p>
                  Depending on where you live, you may have the right to
                  access, correct, export or delete your personal data, to
                  object to certain processing, and to withdraw consent at any
                  time. To exercise any of these rights, email{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>{" "}
                  from the email address linked to your account. We respond
                  within a reasonable time, usually under 30 days.
                </p>
                <p>
                  EU/EEA visitors also have the right to lodge a complaint with
                  their local data-protection authority.
                </p>
              </Section>

              <Section id="security" title="10. Security">
                <p>
                  We use industry-standard safeguards: encrypted connections
                  (HTTPS/TLS) for all traffic, row-level security on the
                  database, role-based access for staff features, and signed
                  URLs for private media. No system can be guaranteed 100%
                  secure — if you discover a vulnerability, please report it to{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </Section>

              <Section id="children" title="11. Children">
                <p>
                  The TrendFlux platform is not directed at children under 13.
                  If you believe a child has provided personal data, contact us
                  and we will delete it.
                </p>
              </Section>

              <Section id="changes" title="12. Changes to this policy">
                <p>
                  We may update this policy as the product evolves. Material
                  changes will be highlighted on this page with a new "Last
                  updated" date. Continued use of the service after a change
                  means you accept the updated policy.
                </p>
              </Section>

              <Section id="contact" title="13. Contact">
                <p>
                  Questions, requests or complaints about this policy or your
                  personal data:
                </p>
                <p>
                  <strong>{CONTROLLER}</strong>
                  <br />
                  Email:{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
                <p className="text-sm text-foreground/55">
                  See also:{" "}
                  <Link to="/contact" className="hover:text-foreground underline">
                    Contact
                  </Link>
                  {" · "}
                  <Link to="/about" className="hover:text-foreground underline">
                    About
                  </Link>
                </p>
              </Section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
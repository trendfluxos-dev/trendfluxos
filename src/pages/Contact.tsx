import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TfSection, TfCard } from "@/components/tf/Section";
import { useSeo } from "@/hooks/useSeo";
import { QuoteDialog } from "@/components/QuoteDialog";
import { Mail, MessageSquare, Calendar, ArrowRight } from "lucide-react";

const Contact = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  useSeo({
    title: "Contact — TrendFlux",
    description: "Start a conversation with the TrendFlux team. Strategy calls, enterprise engagements, partnerships.",
  });

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />

      <TfSection
        className="pt-40"
        eyebrow="Contact"
        title="Start a conversation."
        intro="Tell us about the system you're trying to build. We'll respond within one business day."
      >
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <TfCard className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-foreground">
              Strategy Call
            </h3>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              45 minutes. Audit your stack. Map the gaps.
            </p>
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
            >
              Book <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </TfCard>

          <TfCard className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-foreground">
              Email
            </h3>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              For partnerships, press, and enterprise.
            </p>
            <a
              href="mailto:hello@trendflux.digital"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
            >
              hello@trendflux.digital <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </TfCard>

          <TfCard className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-foreground">
              Project Brief
            </h3>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Structured intake for new engagements.
            </p>
            <a
              href="/project-lead"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
            >
              Submit <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </TfCard>
        </div>
      </TfSection>

      <Footer />

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        context={{ source: "contact_page" }}
      />
    </main>
  );
};

export default Contact;

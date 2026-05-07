import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What does “operating at full velocity” actually mean?",
    a: "It means your acquisition, conversion, and retention systems run as one connected operation — paid media feeds qualified leads into automated funnels, content compounds reach, and CRM workflows close the loop. No more isolated tactics.",
  },
  {
    q: "How long before I see measurable results?",
    a: "Most partners see initial signal (faster lead response, lower CAC, first ROAS lift) inside 30 days. Compounding system results — predictable pipeline, brand pull — typically land between days 60 and 90.",
  },
  {
    q: "What should I prepare for the strategy call?",
    a: "Bring a clear sense of (1) your current monthly revenue and growth target, (2) the channels you've tried, (3) one bottleneck slowing you down. We'll do the rest — including a custom roadmap you can keep regardless of next steps.",
  },
  {
    q: "Do I need an existing tech stack or team?",
    a: "No. We work with founders running solo and with teams of 50+. We adapt to what you have — Meta Ads, GoHighLevel, WhatsApp, HubSpot, custom CRMs — or recommend the leanest stack that fits your stage.",
  },
  {
    q: "Is the session really free? What's the catch?",
    a: "Yes — fully complimentary. We only take on a limited number of partners each quarter, so the call is also how we evaluate fit. You walk away with a roadmap whether or not we work together.",
  },
  {
    q: "Which industries do you typically work with?",
    a: "Education, retail / D2C, B2B SaaS, and personal brands across Bangladesh, the US, and the UK. If you have a real product and a willingness to operate, we can usually help.",
  },
];

export const Faq = () => {
  return (
    <section id="faq" className="relative px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Before you book the call.
          </h2>
          <p className="mx-auto mt-4 text-foreground/60">
            Quick answers on velocity, timelines, and how to prepare for your strategy session.
          </p>
        </div>

        <Accordion type="single" collapsible className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-2 md:px-4">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-foreground/10">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Faq;

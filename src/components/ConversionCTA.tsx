import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ConversionCTA = () => {
  return (
    <section className="px-6 lg:px-10 py-24">
      <div className="max-w-5xl mx-auto relative rounded-[2rem] glass-strong overflow-hidden p-10 md:p-16 text-center">
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative">
          <p className="text-primary uppercase tracking-[0.3em] text-xs mb-5">
            The Operator's Promise
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto">
            Your business does not need more random content.{" "}
            <span className="text-gradient">It needs a growth system.</span>
          </h2>
          <p className="text-foreground/65 mt-6 max-w-xl mx-auto">
            One 30-minute call. One clear roadmap. Walk away with a system blueprint
            built for your business — whether you work with us or not.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg">
              Book a Growth Strategy Session
              <ArrowRight />
            </Button>
            <Button variant="outline" size="lg">
              See How We Work
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConversionCTA;

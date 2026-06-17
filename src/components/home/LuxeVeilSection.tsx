import { Link } from "react-router-dom";
import { ArrowUpRight, Lock } from "lucide-react";

export const LuxeVeilSection = () => (
  <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-muted to-background py-28" aria-label="Luxe Veil">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(212,175,55,0.5), transparent 50%), radial-gradient(circle at 70% 70%, rgba(220,38,38,0.3), transparent 50%)",
      }}
    />
    <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-50 px-3 py-1">
        <Lock className="h-3 w-3 text-amber-600/80" aria-hidden="true" />
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-700">Invite Only</span>
      </div>
      <h2 className="mt-7 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
        <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent">
          Luxe Veil
        </span>
      </h2>
      <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        A private network for high-level operators. Closed-door briefings,
        unpublished playbooks, and direct introductions across the TrendFlux
        ecosystem. Membership is not advertised.
      </p>
      <Link
        to="/luxe-veil"
        className="mt-9 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-50 px-7 py-3.5 text-sm font-semibold text-amber-800 transition-all hover:border-amber-400/60 hover:bg-amber-100"
      >
        Request Consideration <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </section>
);
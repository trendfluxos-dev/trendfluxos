import { Link } from "react-router-dom";
import {
  Camera,
  Video,
  Mic,
  Sparkles,
  Package,
  Gem,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  ArrowRight,
  Play,
  Lightbulb,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/brandtoki-logo.webp";
import { useSeo } from "@/hooks/useSeo";

const services = [
  { icon: Camera, title: "Photography Studio", desc: "Editorial, portrait & lifestyle photography in a fully equipped studio.", tag: "Editorial" },
  { icon: Video, title: "Videography Production", desc: "Cinematic films, brand reels & high-end commercial video.", tag: "Cinematic" },
  { icon: Mic, title: "Podcast Setup", desc: "Acoustically treated podcast room with multi-cam coverage.", tag: "Audio + Video" },
  { icon: Sparkles, title: "Commercial Brand Shoot", desc: "Full-service campaign production from concept to delivery.", tag: "Campaign" },
  { icon: Package, title: "Product Photography", desc: "E-commerce, premium packaging & lifestyle product imagery.", tag: "Commerce" },
  { icon: Gem, title: "Fashion & Jewellery", desc: "Lookbooks, jewellery macro & couture-grade fashion editorials.", tag: "Luxury" },
  { icon: Users, title: "Creator Content", desc: "Reels, UGC & creator-first short-form content production.", tag: "Creator" },
];

const portfolio = [
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?auto=format&fit=crop&w=900&q=80",
];

const experiences = [
  { icon: MapPin, title: "Gulshan, Dhaka", desc: "Premium central location, easy access for brands & creators." },
  { icon: Lightbulb, title: "Pro Lighting Rigs", desc: "Aputure, Godox & continuous LED — cinema-grade output." },
  { icon: ShieldCheck, title: "Premium Setup", desc: "Cyclorama, dressing area, makeup station & client lounge." },
  { icon: CalendarCheck, title: "Flexible Booking", desc: "Hourly, half-day & full-day rates with creator-friendly pricing." },
];

const testimonials = [
  { name: "Nuzhat A.", role: "Founder, Maison Lumière", quote: "Studio BrandToki delivered a campaign that completely elevated our brand. Cinematic, fast, and incredibly professional." },
  { name: "Rafsan H.", role: "Creator, 480K followers", quote: "The podcast setup is on another level. Plug-and-play, world-class audio, and the team genuinely cares about the craft." },
  { name: "Tahmina R.", role: "Brand Manager, Aurum Jewels", quote: "Our jewellery shoot looked like Vogue. Lighting, retouch, and direction — all premium." },
];

export default function BrandToki() {
  useSeo({
    title: "Studio BrandToki — Premium Production Studio in Gulshan, Dhaka",
    description:
      "Studio BrandToki — Premium photography, videography, podcast & commercial production studio in Gulshan, Dhaka. Editorial shoots, brand campaigns, creator content.",
    siteName: "Studio BrandToki",
    imageAlt: "Studio BrandToki — Premium Production Studio in Gulshan, Dhaka",
  });

  return (
    <div className="min-h-screen bg-white text-[#111111] font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/brandtoki" className="flex items-center gap-3" aria-label="Studio BrandToki home">
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0a0a0a] pl-1.5 pr-3 shadow-[0_4px_14px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
              <span className="h-7 w-7 rounded-full bg-[#0a0a0a] grid place-items-center overflow-hidden">
                <img src={logo} alt="Studio BrandToki" className="h-7 w-7 object-contain" />
              </span>
              <span className="text-white text-[13px] font-semibold tracking-wide">Studio BrandToki</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#4B5563]">
            <a href="#services" className="hover:text-[#111111] transition">Services</a>
            <a href="#portfolio" className="hover:text-[#111111] transition">Portfolio</a>
            <a href="#experience" className="hover:text-[#111111] transition">Studio</a>
            <a href="#testimonials" className="hover:text-[#111111] transition">Reviews</a>
            <Link to="/" className="hover:text-[#111111] transition">Studio BrandToki Home</Link>
          </nav>
          <a
            href="#booking"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-medium px-4 py-2 transition shadow-[0_8px_20px_-8px_rgba(220,38,38,0.6)]"
          >
            Book Studio <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(220,38,38,0.07),transparent_70%),linear-gradient(180deg,#FFFFFF,#F8FAFC)]" />
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FEF2F2] text-[#B91C1C] text-xs font-semibold px-3 py-1 ring-1 ring-[#FECACA]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Now booking · Gulshan, Dhaka
              </span>
              <h1 className="mt-5 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight font-[Space_Grotesk,Inter,sans-serif]">
                Where Creative Production
                <br className="hidden md:block" /> Meets <span className="text-[#DC2626]">Premium Execution</span>.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] md:text-base text-[#4B5563] leading-relaxed">
                Photography • Videography • Podcast • Commercial Production • Creator Shoots — a modern production studio designed for brands, founders and creators who care about craft.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#booking" className="inline-flex items-center gap-2 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-3 text-sm font-medium transition shadow-[0_12px_28px_-10px_rgba(220,38,38,0.55)]">
                  Book Studio <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#portfolio" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] hover:border-[#111111] px-5 py-3 text-sm font-medium text-[#111111] transition">
                  <Play className="h-4 w-4" /> View Portfolio
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-[#4B5563]">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> 200+ shoots delivered</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" /> Cinema-grade lighting</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" /> Studio BrandToki · Premium Production</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-[#FFE4E6] via-white to-[#FFF5F5] blur-2xl opacity-70" />
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-[#E5E7EB] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)]">
                  <img
                    src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80"
                    alt="Studio BrandToki cinematic shoot"
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute left-4 bottom-4 right-4 flex items-center justify-between rounded-2xl bg-white/95 backdrop-blur px-4 py-3 ring-1 ring-black/5 shadow-md">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#4B5563]">Live Set</p>
                      <p className="text-sm font-semibold text-[#111111]">Editorial Campaign · Gulshan</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-semibold px-2.5 py-1 ring-1 ring-[#A7F3D0]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" /> Recording
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-white py-20 md:py-24 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2626]">Services</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">A complete premium production stack.</h2>
            </div>
            <p className="max-w-md text-sm text-[#4B5563]">From single-frame product shots to multi-day campaigns — one studio, one team, end-to-end.</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon: Icon, title, desc, tag }) => (
              <article
                key={title}
                className="group relative rounded-2xl bg-white p-6 ring-1 ring-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-[#DC2626] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#FEF2F2] grid place-items-center ring-1 ring-[#FECACA]">
                    <Icon className="h-5 w-5 text-[#DC2626]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#4B5563]">{tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#111111]">{title}</h3>
                <p className="mt-1.5 text-sm text-[#4B5563] leading-relaxed">{desc}</p>
                <a href="#booking" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#DC2626] hover:text-[#B91C1C]">
                  Enquire <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO / BTS */}
      <section id="portfolio" className="bg-[#F8FAFC] py-20 md:py-24 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2626]">Portfolio · BTS</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">From the floor of the studio.</h2>
            </div>
            <a
              href="https://www.facebook.com/studiobrandtoki/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#111111] hover:text-[#DC2626] transition"
            >
              See all on Facebook <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
            {portfolio.map((src, i) => (
              <div
                key={src}
                className={`group relative overflow-hidden rounded-2xl ring-1 ring-[#E5E7EB] bg-white ${
                  i === 0 ? "row-span-2" : i === 5 ? "col-span-2" : ""
                }`}
              >
                <img
                  src={src}
                  alt={`Studio BrandToki BTS ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO EXPERIENCE */}
      <section id="experience" className="bg-white py-20 md:py-24 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2626]">The Studio</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Built for creators. Trusted by brands.</h2>
            <p className="mt-3 text-[15px] text-[#4B5563]">A premium production environment in the heart of Gulshan — engineered so you can walk in and create.</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {experiences.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 ring-1 ring-[#E5E7EB] bg-white hover:ring-[#111111]/30 transition">
                <div className="h-10 w-10 rounded-xl bg-[#111111] grid place-items-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-[#111111]">{title}</h3>
                <p className="mt-1.5 text-sm text-[#4B5563] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-[#F8FAFC] py-20 md:py-24 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2626]">Reviews</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Loved by founders, creators &amp; brand teams.</h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <figure key={t.name} className="relative rounded-2xl bg-white p-6 ring-1 ring-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div aria-hidden className="absolute left-0 top-6 h-8 w-[3px] bg-[#DC2626] rounded-r" />
                <div className="flex items-center gap-1 text-[#DC2626]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-[15px] leading-relaxed text-[#111111]">"{t.quote}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-[#111111]">{t.name}</span>
                  <span className="text-[#4B5563]"> · {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING / CONTACT */}
      <section id="booking" className="bg-white py-20 md:py-28 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2626]">Booking</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Let's plan your shoot.</h2>
            <p className="mt-3 text-[15px] text-[#4B5563] max-w-md">Tell us a bit about your project — we'll come back within a few hours with a quote and available slots.</p>

            <div className="mt-8 space-y-4 text-sm">
              <a href="tel:+8801700000000" className="flex items-center gap-3 group">
                <span className="h-10 w-10 rounded-xl bg-[#FEF2F2] grid place-items-center ring-1 ring-[#FECACA]"><Phone className="h-4 w-4 text-[#DC2626]" /></span>
                <span className="text-[#111111] group-hover:text-[#DC2626] transition">+880 17XX-XXXXXX</span>
              </a>
              <a href="mailto:hello@studiobrandtoki.com" className="flex items-center gap-3 group">
                <span className="h-10 w-10 rounded-xl bg-[#FEF2F2] grid place-items-center ring-1 ring-[#FECACA]"><Mail className="h-4 w-4 text-[#DC2626]" /></span>
                <span className="text-[#111111] group-hover:text-[#DC2626] transition">hello@studiobrandtoki.com</span>
              </a>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-[#FEF2F2] grid place-items-center ring-1 ring-[#FECACA]"><MapPin className="h-4 w-4 text-[#DC2626]" /></span>
                <span className="text-[#111111]">Gulshan, Dhaka · Bangladesh</span>
              </div>
              <a
                href="https://www.facebook.com/studiobrandtoki/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#DC2626] transition"
              >
                facebook.com/studiobrandtoki <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = "mailto:hello@studiobrandtoki.com"; }}
            className="rounded-3xl bg-white ring-1 ring-[#E5E7EB] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] p-6 md:p-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="block text-[#111111] font-medium mb-1.5">Your name</span>
                <input required className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 focus-visible:border-[#DC2626] transition" />
              </label>
              <label className="text-sm">
                <span className="block text-[#111111] font-medium mb-1.5">Email</span>
                <input type="email" required className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 focus-visible:border-[#DC2626] transition" />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="block text-[#111111] font-medium mb-1.5">Service</span>
                <select className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 focus-visible:border-[#DC2626] transition">
                  {services.map(s => <option key={s.title}>{s.title}</option>)}
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="block text-[#111111] font-medium mb-1.5">Project details</span>
                <textarea rows={4} className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 focus-visible:border-[#DC2626] transition" />
              </label>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white px-6 py-3 text-sm font-medium transition shadow-[0_14px_30px_-12px_rgba(220,38,38,0.6)]"
            >
              Request booking <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-xs text-[#4B5563]">By submitting, you agree to be contacted by Studio BrandToki.</p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/5 pl-1.5 pr-3 ring-1 ring-white/10">
              <img src={logo} alt="Studio BrandToki" className="h-7 w-7 object-contain" />
              <span className="text-white text-[13px] font-semibold tracking-wide">Studio BrandToki</span>
            </span>
            <p className="mt-4 text-sm text-white/60 max-w-xs">Premium production studio · Photography, Videography, Podcast & Commercial production in Gulshan, Dhaka.</p>
          </div>
          <div className="text-sm">
            <p className="text-white/50 uppercase tracking-wider text-xs font-semibold mb-3">Studio</p>
            <ul className="space-y-2 text-white/80">
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href="#portfolio" className="hover:text-white">Portfolio</a></li>
              <li><a href="#experience" className="hover:text-white">The Studio</a></li>
              <li><a href="#booking" className="hover:text-white">Book Now</a></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="text-white/50 uppercase tracking-wider text-xs font-semibold mb-3">Ecosystem</p>
            <ul className="space-y-2 text-white/80">
              <li><Link to="/" className="hover:text-white">Studio BrandToki</Link></li>
              <li><a href="https://www.facebook.com/studiobrandtoki/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
              <li><a href="mailto:hello@studiobrandtoki.com" className="hover:text-white">hello@studiobrandtoki.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <span>© {new Date().getFullYear()} Studio BrandToki. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" /> Studio BrandToki · Production House
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Facebook, Mail, Phone, Linkedin, Heart, Copy, Check, User, Briefcase, FileCheck, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/analytics";
import profile from "@/assets/marriage/profile.webp";
import photo1 from "@/assets/marriage/photo1.webp";
import photo2 from "@/assets/marriage/photo2.webp";
import photo3 from "@/assets/marriage/photo3.webp";
import { caseStudies } from "@/data/caseStudies";
import proofUniversity from "@/assets/proof/university-certificates.webp";
import proofPzswa from "@/assets/proof/pzswa-presidential.webp";
import proofNdfBd from "@/assets/proof/ndf-bd-appointment.webp";
import proofIdentification from "@/assets/proof/official-identification.webp";

type Bi = { en: string; bn: string };
const T = ({ en, bn, bangla }: Bi & { bangla: boolean }) => <>{bangla ? bn : en}</>;

const info: { label: Bi; value: Bi }[] = [
  { label: { en: "Full Name", bn: "পূর্ণ নাম" }, value: { en: "Zahid Hasan Emon", bn: "জাহিদ হাসান ইমন" } },
  { label: { en: "Date of Birth", bn: "জন্ম তারিখ" }, value: { en: "5 May 1998", bn: "৫ মে ১৯৯৮" } },
  { label: { en: "Age", bn: "বয়স" }, value: { en: "27 Years (Approx.)", bn: "প্রায় ২৭ বছর" } },
  { label: { en: "Height", bn: "উচ্চতা" }, value: { en: "5 Feet 5 Inches", bn: "৫ ফুট ৫ ইঞ্চি" } },
  { label: { en: "Weight", bn: "ওজন" }, value: { en: "Approx. 68 KG", bn: "প্রায় ৬৮ কেজি" } },
  { label: { en: "Blood Group", bn: "রক্তের গ্রুপ" }, value: { en: "AB+", bn: "এবি পজিটিভ" } },
  { label: { en: "Religion", bn: "ধর্ম" }, value: { en: "Islam", bn: "ইসলাম" } },
  { label: { en: "Nationality", bn: "জাতীয়তা" }, value: { en: "Bangladeshi", bn: "বাংলাদেশি" } },
  { label: { en: "Present Address", bn: "বর্তমান ঠিকানা" }, value: { en: "Dhaka, Bangladesh", bn: "ঢাকা, বাংলাদেশ" } },
  { label: { en: "Permanent Address", bn: "স্থায়ী ঠিকানা" }, value: { en: "Pabna, Bangladesh", bn: "পাবনা, বাংলাদেশ" } },
];

const family: Bi[] = [
  { en: "Father: Md. Mujahidul Islam — Retired Government Officer, Electro Medical Officer, Civil Surgeon Office.", bn: "পিতা: মো. মুজাহিদুল ইসলাম — অবসরপ্রাপ্ত সরকারি কর্মকর্তা, ইলেক্ট্রো মেডিকেল অফিসার, সিভিল সার্জন অফিস।" },
  { en: "Mother: Sharmin Akter Lucky — Housewife.", bn: "মাতা: শারমিন আক্তার লাকি — গৃহিণী।" },
  { en: "Siblings: 1 Sister.", bn: "ভাই-বোন: ১ বোন।" },
  { en: "Family is well-educated, culturally grounded, and socially respected.", bn: "পরিবার শিক্ষিত, সংস্কৃতিমনা এবং সামাজিকভাবে সম্মানিত।" },
];

const education: Bi[] = [
  { en: "BSc in Information Technology — Jahangirnagar University", bn: "বি.এসসি ইন ইনফরমেশন টেকনোলজি — জাহাঙ্গীরনগর বিশ্ববিদ্যালয়" },
  { en: "HSC — Science, GPA 5.00", bn: "এইচএসসি — বিজ্ঞান বিভাগ, জিপিএ ৫.০০" },
  { en: "SSC — Science, GPA 5.00", bn: "এসএসসি — বিজ্ঞান বিভাগ, জিপিএ ৫.০০" },
];

const attributes: Bi[] = [
  { en: "Responsible, disciplined, and professionally driven", bn: "দায়িত্বশীল, শৃঙ্খলাবদ্ধ এবং পেশাগতভাবে মনোযোগী" },
  { en: "Respectful, honest, and family-focused", bn: "সম্মানশীল, সৎ এবং পরিবারমুখী" },
  { en: "Strong communication and public speaking skills", bn: "ভালো যোগাযোগ দক্ষতা ও পাবলিক স্পিকিং অভিজ্ঞতা" },
  { en: "Growth-oriented mindset with long-term vision", bn: "দীর্ঘমেয়াদি লক্ষ্যসহ উন্নয়নমুখী মানসিকতা" },
  { en: "Maintains balance between career and personal life", bn: "ক্যারিয়ার ও ব্যক্তিগত জীবনের মধ্যে ভারসাম্য বজায় রাখে" },
];

type Reference = {
  nameEn: string;
  nameBn: string;
  role: { en: string; bn: string };
  org?: { en: string; bn: string };
  phoneDisplay: string; // formatted, e.g. "+880 1716-808074"
  phoneE164: string;    // dial-ready, e.g. "+8801716808074"
  facebook?: string;
};

const references: Reference[] = [
  {
    nameEn: "Mr. Md. Abul Bashar Khan Jewel",
    nameBn: "জনাব মোঃ আবুল বাসার খান জুয়েল",
    role: { en: "General Secretary", bn: "সাধারণ সম্পাদক" },
    org: { en: "Pabna Nagorik Committee (PNC)", bn: "পাবনা নাগরিক কমিটি (পিএনসি)" },
    phoneDisplay: "+880 1716-808074",
    phoneE164: "+8801716808074",
    facebook: "https://www.facebook.com/bashar.k.jewel",
  },
  {
    nameEn: "Mominul Islam Muktar",
    nameBn: "মমিনুল ইসলাম মুক্তার",
    role: { en: "Businessman, Social Worker", bn: "ব্যবসায়ী, সমাজসেবাকর্মী" },
    phoneDisplay: "+880 1728-870710",
    phoneE164: "+8801728870710",
    facebook: "https://www.facebook.com/mukter.hossin.172235",
  },
];

const FALLBACK_ANALYTICS_KEY = "marriage_analytics_queue";

const fallbackLog = (data: Record<string, unknown>) => {
  // 1) Always log to console for debugging / manual capture
  try {
     
    console.info("[analytics:fallback]", data);
  } catch { /* noop */ }
  // 2) Persist to localStorage queue (capped at 200 entries) so events survive
  //    page reloads and can be flushed later by another tool.
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(FALLBACK_ANALYTICS_KEY);
    const queue: unknown[] = raw ? JSON.parse(raw) : [];
    queue.push(data);
    while (queue.length > 200) queue.shift();
    localStorage.setItem(FALLBACK_ANALYTICS_KEY, JSON.stringify(queue));
  } catch { /* noop */ }
  // 3) Dispatch a CustomEvent so any listener can hook in without a global.
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("analytics:event", { detail: data }));
    }
  } catch { /* noop */ }
};

const trackReferenceEvent = (
  event: "reference_copy" | "reference_call" | "reference_whatsapp" | "reference_facebook",
  payload: { name: string; field?: "name" | "phone"; value?: string },
) => {
  const data = { event, ...payload, ts: Date.now(), source: "marriage_reference" };
  let dataLayerOk = false;
  let beaconOk = false;
  try {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if (Array.isArray(window.dataLayer) && typeof window.dataLayer.push === "function") {
        window.dataLayer.push(data);
        dataLayerOk = true;
      }
    }
  } catch { /* noop */ }
  try {
    const endpoint = (import.meta as { env?: Record<string, string> }).env?.VITE_ANALYTICS_ENDPOINT;
    if (endpoint && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      beaconOk = navigator.sendBeacon(
        endpoint,
        new Blob([JSON.stringify(data)], { type: "application/json" }),
      );
      // sendBeacon returns false if the browser refused to queue the request
      if (!beaconOk && typeof fetch === "function") {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          keepalive: true,
        }).then(() => { beaconOk = true; }).catch(() => { /* noop */ });
      }
    }
  } catch { /* noop */ }
  // Always run the fallback if neither primary path captured the event.
  if (!dataLayerOk && !beaconOk) {
    fallbackLog(data);
  }
};


const Marriage = () => {
  const [bangla, setBangla] = useState(false);
  useSeo({
    title: "Marriage Profile — Zahid Hasan Emon | Pabna, Bangladesh",
    description:
      "Personal marriage profile of Zahid Hasan Emon — BSc IT (Jahangirnagar University), based in Dhaka. Family, education, values and references.",
    type: "profile",
    noindex: true,
  });
  const location = useLocation();
  type Inquirer = { id?: string; name: string; country_code: string; whatsapp: string; dress_colors?: string[] };
  const stateInquirer = (location.state as { inquirer?: Inquirer } | null)?.inquirer ?? null;
  const [inquirer, setInquirer] = useState<Inquirer | null>(stateInquirer);
  const t = (en: string, bn: string) => (bangla ? bn : en);

  useEffect(() => {
    if (stateInquirer?.id) {
      try { localStorage.setItem("marriage_inquiry_id", stateInquirer.id); } catch { /* ignore */ }
      return;
    }
    if (inquirer) return;
    let cancelled = false;
    const id = (() => { try { return localStorage.getItem("marriage_inquiry_id"); } catch { return null; } })();
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke<{ inquiry: Inquirer | null }>(
        "get-marriage-inquiry",
        { body: { id } },
      );
      if (cancelled) return;
      if (error || !data?.inquiry) {
        try { localStorage.removeItem("marriage_inquiry_id"); } catch { /* ignore */ }
        return;
      }
      setInquirer(data.inquiry);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greetingName = inquirer?.name?.split(" ")[0];
  const inquirerWa = inquirer ? `${inquirer.country_code}${inquirer.whatsapp}` : null;

  // --- UTM attribution -------------------------------------------------
  // WhatsApp's wa.me URL strips unknown query params, so UTMs must travel
  // inside the prefilled `text` body. We also emit them in GA4/Meta events.
  // Inbound campaign tags (?utm_source=fb&...) on /marriage are preserved
  // and override the defaults so external campaigns attribute correctly.
  type Utm = {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term?: string;
  };
  const buildUtm = (placement: string): Utm => {
    const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const inbound = (k: string) => search?.get(k) || undefined;
    return {
      utm_source: inbound("utm_source") ?? "marriage_profile",
      utm_medium: inbound("utm_medium") ?? "whatsapp",
      utm_campaign: inbound("utm_campaign") ?? "marriage_outreach",
      utm_content: inbound("utm_content") ?? placement,
      utm_term: inbound("utm_term") ?? (bangla ? "bn" : "en"),
    };
  };
  const utmQuery = (u: Utm) =>
    Object.entries(u)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");

  // Compose a wa.me URL with prefilled text that carries the UTM tail so
  // the recipient (and any forwarded reply screenshots) preserve attribution.
  const buildWaUrl = (placement: "hero_primary" | "inquirer_banner" | "contact_section", phoneE164: string) => {
    const u = buildUtm(placement);
    const greet = `Assalamu Alaikum${inquirer ? `, ${inquirer.name}` : ""}`;
    const onFile = inquirerWa ? `\nYour contact on file: ${inquirerWa}` : "";
    const body =
      `${greet},\n\nThank you for visiting Zahid Hasan Emon's marriage profile.${onFile}\n\n` +
      `For further discussion, please share:\n• Basic introduction\n• Family background\n• Contact number\n\n` +
      `We will get back to you shortly.\n\n— ref: ${utmQuery(u)}`;
    const phone = phoneE164.replace(/^\+/, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
  };

  // Conversion tracking: every WhatsApp interaction on /marriage funnels through
  // here so GA4/GTM, Meta Pixel (mapped to `Contact`) and the in-app conversion
  // dashboard all receive a unified event.
  const trackWhatsApp = (
    placement: "hero_primary" | "inquirer_banner" | "contact_section" | "copy_number",
    extra: Record<string, string | number | boolean | undefined> = {},
  ) => {
    const u = buildUtm(placement);
    const params = {
      page: "marriage",
      placement,
      number: "+8801410004037",
      personalized: Boolean(inquirer),
      inquirer_id: inquirer?.id,
      inquirer_wa: inquirerWa ?? undefined,
      language: bangla ? "bn" : "en",
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      ...u,
      ...extra,
    };
    // Primary unified conversion event (maps to Meta Pixel "Contact").
    track("whatsapp_open", params);
    // Marriage-specific event for granular funnel reporting.
    track("marriage_whatsapp_click", params);
  };

  return (
    <main
      lang={bangla ? "bn" : "en"}
      data-brand="marriage"
      className="min-h-dvh text-[var(--marriage-ink)]"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(220,38,38,0.22), transparent 45%), radial-gradient(ellipse at bottom, rgba(220,38,38,0.10), transparent 55%), linear-gradient(180deg, var(--marriage-bg-1) 0%, var(--marriage-bg-2) 50%, var(--marriage-bg-3) 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-5xl mx-auto px-5">
        {/* Lang toggle */}
        <div className="sticky top-2 z-20 flex justify-end pt-3">
          <button
            onClick={() => setBangla((b) => !b)}
            className="px-4 py-2 rounded-full border border-red-500/60 text-white bg-black/70 backdrop-blur text-sm font-semibold hover:bg-red-600 hover:border-red-600 transition"
          >
            {bangla ? "English" : "বাংলা"}
          </button>
        </div>

        {/* Personalized welcome */}
        {inquirer && (
          <div className="mt-4 rounded-2xl border border-white/15 bg-gradient-to-r from-black/70 via-[var(--marriage-tint)]/80 to-black/70 px-5 py-4 backdrop-blur shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 via-white to-black flex items-center justify-center text-black font-bold border border-white/30">
                {greetingName?.[0]?.toUpperCase() ?? "♥"}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {t(`Welcome, ${greetingName} 💍`, `স্বাগতম, ${greetingName} 💍`)}
                </p>
                <p className="text-xs text-white/60">
                  {t("WhatsApp on file:", "WhatsApp:")}{" "}
                  <span className="text-red-300 font-medium">{inquirerWa}</span>
                  {inquirer.dress_colors && inquirer.dress_colors.length > 0 && (
                    <>
                      {" · "}
                      {t("Preferred:", "পছন্দ:")}{" "}
                      <span className="text-white/80">{inquirer.dress_colors.join(", ")}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={buildWaUrl("inquirer_banner", inquirerWa ?? "+8801410004037")}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsApp("inquirer_banner", { number: inquirerWa ?? undefined })}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.7)] hover:brightness-110 transition"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t("Chat on WhatsApp", "WhatsApp চ্যাট")}
              </a>
              <button
                type="button"
                onClick={() => {
                  try { localStorage.removeItem("marriage_inquiry_id"); } catch { /* ignore */ }
                  setInquirer(null);
                  if (location.state) {
                    window.history.replaceState({}, "");
                  }
                }}
                className="inline-flex items-center rounded-full border border-white/30 bg-black/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 hover:bg-white hover:text-black transition"
                aria-label={t("Clear saved profile", "সংরক্ষিত প্রোফাইল মুছুন")}
              >
                {t("Clear saved profile", "মুছে ফেলুন")}
              </button>
            </div>
          </div>
        )}

        {/* Availability Banner */}
        <div className="mt-4 rounded-2xl border border-red-500/50 bg-gradient-to-r from-red-600/20 via-white/5 to-red-600/20 px-5 py-4 text-center shadow-[0_8px_30px_rgba(220,38,38,0.25)]">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            {t("Available for Marriage", "বিবাহের জন্য প্রস্তুত")}
          </div>
          <p className="mt-2 text-base md:text-lg font-semibold text-white">
            {t(
              "Currently seeking a sincere, well-mannered & beautiful life partner.",
              "একজন আন্তরিক, সুশীল ও সুন্দরী জীবনসঙ্গী খুঁজছি।"
            )}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {t(
              "Serious proposals from respectful families are warmly welcomed.",
              "সম্মানিত পরিবার থেকে আন্তরিক প্রস্তাব সাদরে আমন্ত্রিত।"
            )}
          </p>
        </div>

        {/* Hero */}
        <section className="text-center pt-8 pb-10">
          <div className="relative mx-auto w-[160px] h-[160px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 via-white to-black blur-md opacity-60" aria-hidden />
            <img
              src={profile}
              alt="Zahid Hasan Emon"
              className="relative w-[150px] h-[150px] rounded-full object-cover mx-auto border-4 border-white shadow-[0_0_40px_rgba(220,38,38,0.55)]"
            />
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-wide bg-gradient-to-r from-white via-red-400 to-white bg-clip-text text-transparent">
            {t("Zahid Hasan Emon", "জাহিদ হাসান ইমন")}
          </h1>
          <p className="mt-3 text-white/80 text-base md:text-lg">
            {t(
              "AI-Powered Digital Growth Specialist | Brand Architect | Growth Systems Operator",
              "এআই-পাওয়ার্ড ডিজিটাল গ্রোথ স্পেশালিস্ট | ব্র্যান্ড আর্কিটেক্ট | গ্রোথ সিস্টেম অপারেটর"
            )}
          </p>
          <p className="mt-2 text-red-300/90 italic">
            {t(
              "Faith • Integrity • Responsibility • Long-term Commitment",
              "বিশ্বাস • সততা • দায়িত্ববোধ • দীর্ঘমেয়াদি অঙ্গীকার"
            )}
          </p>

          <div className="mt-8 mx-auto w-full max-w-md flex flex-col gap-4">
            {/* Primary: WhatsApp */}
            <a
              href={buildWaUrl("hero_primary", "+8801410004037")}
              target="_blank" rel="noreferrer"
              onClick={() => trackWhatsApp("hero_primary", { has_prefill: true })}
              className="group relative w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 rounded-2xl shadow-[0_14px_36px_-12px_rgba(5,150,105,0.55)] transition-all duration-300 active:scale-[0.98]"
              aria-label={t("Message on WhatsApp", "WhatsApp-এ মেসেজ করুন")}
            >
              <span className="flex items-center gap-4">
                <span className="bg-white/20 p-2 rounded-lg">
                  <MessageCircle className="w-6 h-6" />
                </span>
                <span className="font-semibold text-base md:text-lg tracking-wide text-left">
                  {t("Message on WhatsApp", "WhatsApp-এ মেসেজ করুন")}
                </span>
              </span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Secondary row */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://facebook.com/zhemongrowth"
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center bg-white/5 border border-white/15 p-5 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/10 hover:border-[#1877F2]/60 transition-all active:scale-[0.98]"
              >
                <Facebook className="w-7 h-7 text-[#4f9bff] mb-2" />
                <span className="text-white/85 font-medium text-sm">Facebook</span>
              </a>

              <a
                href={`mailto:zhemongrowth@gmail.com?subject=${encodeURIComponent(
                  t("Marriage Profile Inquiry", "বিবাহ প্রোফাইল অনুসন্ধান")
                )}&body=${encodeURIComponent(
                  t(
                    "Assalamu Alaikum,\n\nI am writing regarding your marriage profile. Please share further details.\n\nName:\nFamily background:\nLocation:\n\nJazakAllah khair.",
                    "আসসালামু আলাইকুম,\n\nআপনার বিবাহ প্রোফাইল সম্পর্কে আগ্রহী। অনুগ্রহ করে বিস্তারিত শেয়ার করুন।\n\nনাম:\nপারিবারিক পরিচয়:\nঅবস্থান:\n\nজাযাকাল্লাহ খাইর।"
                  )
                )}`}
                className="flex flex-col items-center justify-center bg-black/70 border border-red-500/40 p-5 rounded-2xl shadow-[0_12px_30px_-12px_rgba(220,38,38,0.5)] hover:bg-black/85 hover:border-red-500/70 transition-all active:scale-[0.98]"
              >
                <div className="mb-2 relative">
                  <Mail className="w-7 h-7 text-amber-300" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
                <span className="text-white font-medium text-sm">
                  {t("Email Gmail", "Gmail ইমেইল")}
                </span>
              </a>
            </div>

            <p className="text-center text-white/50 text-[11px] mt-1 uppercase tracking-[0.22em] font-medium">
              {t("Secured response guaranteed", "নিশ্চিত গোপনীয় উত্তর")}
            </p>
          </div>
        </section>

        {/* Basic Information */}
        <Card title={t("Basic Information", "ব্যক্তিগত তথ্য")}>
          <div className="grid sm:grid-cols-2 gap-x-6">
            {info.map((row, i) => (
              <div key={i} className="py-3 border-b border-white/10">
                <span className="text-red-400 font-semibold">
                  <T en={row.label.en} bn={row.label.bn} bangla={bangla} />:
                </span>{" "}
                <span className="text-white/85">
                  <T en={row.value.en} bn={row.value.bn} bangla={bangla} />
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* About */}
        <Card title={t("About Me", "আমার সম্পর্কে")}>
          <p className="leading-relaxed text-white/85">
            {t(
              "I am a responsible, family-oriented, and growth-focused person. I believe in building a stable, respectful, and meaningful life guided by faith, integrity, and long-term commitment.",
              "আমি একজন দায়িত্বশীল, পরিবারমুখী এবং লক্ষ্যভিত্তিক মানুষ। বিশ্বাস, সততা এবং দীর্ঘমেয়াদি অঙ্গীকারের ভিত্তিতে একটি স্থির, সম্মানজনক ও অর্থবহ জীবন গড়ে তুলতে বিশ্বাস করি।"
            )}
          </p>
        </Card>

        {/* Family */}
        <Card title={t("Family Background", "পারিবারিক তথ্য")}>
          <ul className="space-y-2 list-disc pl-6 marker:text-red-500">
            {family.map((f, i) => (
              <li key={i} className="text-white/85">
                <T en={f.en} bn={f.bn} bangla={bangla} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Education */}
        <Card title={t("Educational Qualification", "শিক্ষাগত যোগ্যতা")}>
          <ul className="space-y-2 list-disc pl-6 marker:text-red-500">
            {education.map((e, i) => (
              <li key={i} className="text-white/85">
                <T en={e.en} bn={e.bn} bangla={bangla} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Professional */}
        <Card title={t("Professional Overview", "পেশাগত পরিচিতি")}>
          <p className="leading-relaxed text-white/85">
            {t(
              "Professionally, I work in AI-powered digital growth systems, brand strategy, automation, funnel architecture, and business transformation. My work focuses on helping businesses create structured and scalable growth systems.",
              "পেশাগতভাবে আমি এআই-পাওয়ার্ড ডিজিটাল গ্রোথ সিস্টেম, ব্র্যান্ড স্ট্র্যাটেজি, অটোমেশন, ফানেল আর্কিটেকচার এবং বিজনেস ট্রান্সফরমেশন নিয়ে কাজ করি। ব্যবসাকে স্ট্রাকচার্ড ও স্কেলেবল গ্রোথ সিস্টেমে রূপান্তর করাই আমার কাজের মূল ফোকাস।"
            )}
          </p>
        </Card>

        {/* Attributes */}
        <Card title={t("Personal Attributes", "ব্যক্তিগত গুণাবলি")}>
          <ul className="space-y-2 list-disc pl-6 marker:text-red-500">
            {attributes.map((a, i) => (
              <li key={i} className="text-white/85">
                <T en={a.en} bn={a.bn} bangla={bangla} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Expectation */}
        <Card title={t("Expectation from Life Partner", "জীবনসঙ্গীর প্রত্যাশা")}>
          <p className="leading-relaxed text-white/85">
            {t(
              "Looking for a well-educated, fair-skinned, and beautiful life partner who carries a modern outlook with cultural grace. She should be open-minded, flexible, emotionally mature, and family-oriented — someone who values honesty, mutual respect, shared growth, and balances tradition with the modern era comfortably.",
              "একজন শিক্ষিত, ফর্সা ও সুন্দরী জীবনসঙ্গী খুঁজছি, যিনি আধুনিক দৃষ্টিভঙ্গির পাশাপাশি সাংস্কৃতিক মার্জিতাও ধারণ করেন। তিনি হবেন উদারমনা, ফ্লেক্সিবল, মানসিকভাবে পরিপক্ব ও পরিবারমুখী — যিনি সততা, পারস্পরিক সম্মান, একসাথে বেড়ে ওঠার মানসিকতা এবং ঐতিহ্য ও আধুনিক যুগের ভারসাম্য সহজভাবে বজায় রাখতে পারেন।"
            )}
          </p>
        </Card>

        {/* Gallery */}
        <Card title={t("Photo Gallery", "ছবি")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[photo1, photo2, photo3].map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Zahid Hasan Emon photo ${i + 1}`}
                className="w-full h-72 object-cover rounded-2xl border border-red-500/30 hover:border-red-500/70 transition"
              />
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card title={t("Contact Information", "যোগাযোগ")}>
          <ul className="space-y-3 text-white/85" id="contact">
            <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Phone className="w-4 h-4 text-red-400 shrink-0" />
              <a
                className="hover:text-red-400 transition whitespace-nowrap"
                href={buildWaUrl("contact_section", "+8801410004037")}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsApp("contact_section")}
              >
                WhatsApp: +880&nbsp;1410-004037
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText("+8801410004037");
                    toast.success(t("WhatsApp number copied", "WhatsApp নম্বর কপি হয়েছে"));
                    trackWhatsApp("copy_number", { action: "copy_success" });
                  } catch {
                    toast.error(t("Could not copy", "কপি করা যায়নি"));
                    trackWhatsApp("copy_number", { action: "copy_failed" });
                  }
                }}
                aria-label={t("Copy WhatsApp number", "WhatsApp নম্বর কপি করুন")}
                className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-white/75 hover:text-white hover:border-red-500/60 hover:bg-red-500/10 transition active:scale-95 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                {t("Copy", "কপি")}
              </button>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-red-400" />
              <a className="hover:text-red-400 transition" href="mailto:zhemongrowth@gmail.com">
                zhemongrowth@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Facebook className="w-4 h-4 text-red-400" />
              <a className="hover:text-red-400 transition" href="https://facebook.com/zhemongrowth" target="_blank" rel="noreferrer">
                facebook.com/zhemongrowth
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Linkedin className="w-4 h-4 text-red-400" />
              <a className="hover:text-red-400 transition" href="https://linkedin.com/in/zhemongrowth" target="_blank" rel="noreferrer">
                linkedin.com/in/zhemongrowth
              </a>
            </li>
          </ul>
        </Card>

        {/* References */}
        <Card title={t("Reference Mention", "রেফারেন্স মেনশন")}>
          <p className="text-sm text-white/60 mb-4">
            {t(
              "You may verify this profile through the following respected references. Tap any name or number to copy.",
              "নিচের সম্মানিত রেফারেন্সদের মাধ্যমে এই প্রোফাইল যাচাই করতে পারেন। নাম বা নম্বরে ক্লিক করে কপি করুন।"
            )}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {references.map((r, i) => {
              const displayName = bangla ? r.nameBn : r.nameEn;
              const dialDigits = r.phoneE164.replace(/\D/g, "");
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-red-500/25 bg-black/40 p-5 hover:border-red-500/60 transition flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-red-600 via-white to-black flex items-center justify-center border border-white/30">
                      <User className="h-4 w-4 text-black" />
                    </div>
                    <div className="min-w-0">
                      <CopyChip
                        value={r.nameEn}
                        label={displayName}
                        bold
                        onCopied={() =>
                          trackReferenceEvent("reference_copy", { name: r.nameEn, field: "name", value: r.nameEn })
                        }
                      />
                      <p className="text-xs text-red-300 mt-1">
                        {bangla ? r.role.bn : r.role.en}
                        {r.org && <span className="text-white/60"> · {bangla ? r.org.bn : r.org.en}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyChip
                      value={r.phoneDisplay}
                      label={r.phoneDisplay}
                      icon={<Phone className="h-3.5 w-3.5" />}
                      onCopied={() =>
                        trackReferenceEvent("reference_copy", { name: r.nameEn, field: "phone", value: r.phoneDisplay })
                      }
                    />
                    <CallButton
                      phoneE164={r.phoneE164}
                      onInvoke={() =>
                        trackReferenceEvent("reference_call", { name: r.nameEn, value: r.phoneE164 })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Verify Further — Founder Portfolio & Legal Documents */}
        <Card title={t("Verify Further", "আরও যাচাই করুন")}>
          <p className="text-sm text-white/60 mb-4">
            {t(
              "For deeper verification, explore the founder's full professional portfolio and original legal documents.",
              "আরও গভীর যাচাইয়ের জন্য, ফাউন্ডারের সম্পূর্ণ পেশাগত পোর্টফোলিও এবং মূল লিগ্যাল ডকুমেন্টগুলো দেখুন।"
            )}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Founder Portfolio — with case preview tiles */}
            <Link
              to="/portfolio"
              onClick={() =>
                track("marriage_verify_link_click", { target: "founder_portfolio", language: bangla ? "bn" : "en" })
              }
              className="group rounded-2xl border border-red-500/25 bg-black/40 p-5 hover:border-red-500/60 hover:bg-red-600/5 transition flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-red-600 via-white to-black flex items-center justify-center border border-white/30">
                  <Briefcase className="h-4 w-4 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-300">
                    {t("Founder Portfolio", "ফাউন্ডার পোর্টফোলিও")}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-white">
                    {t("Zahid Hasan Emon — Full Profile", "জাহিদ হাসান ইমন — সম্পূর্ণ প্রোফাইল")}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {t(
                      "Work, leadership, brands and achievements.",
                      "কাজ, নেতৃত্ব, ব্র্যান্ড এবং অর্জনসমূহ।"
                    )}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-red-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Case preview thumbnails */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                  {t("Featured Case Studies", "নির্বাচিত কেস স্টাডি")}
                </p>
                <div
                  className="grid grid-cols-4 gap-2"
                  style={{ ["--gold" as string]: "0 72% 70%" }}
                >
                  {caseStudies.slice(0, 4).map((cs) => {
                    const Icon = cs.Icon;
                    return (
                      <div
                        key={cs.slug}
                        title={cs.category}
                        className="aspect-square rounded-lg border border-red-500/20 bg-gradient-to-br from-red-600/15 via-black/60 to-black/80 flex items-center justify-center transition group-hover:border-red-500/50 group-hover:from-red-600/25"
                      >
                        <Icon className="h-9 w-9" />
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-white/50">
                  {t(`+${caseStudies.length - 4} more cases`, `+${caseStudies.length - 4}টি আরও কেস`)}
                </p>
              </div>
            </Link>

            {/* Legal Documents — with proof image thumbnails */}
            <Link
              to="/portfolio#proof"
              onClick={() =>
                track("marriage_verify_link_click", { target: "legal_documents", language: bangla ? "bn" : "en" })
              }
              className="group rounded-2xl border border-red-500/25 bg-black/40 p-5 hover:border-red-500/60 hover:bg-red-600/5 transition flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-red-600 via-white to-black flex items-center justify-center border border-white/30">
                  <FileCheck className="h-4 w-4 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-300">
                    {t("Legal Documents", "লিগ্যাল ডকুমেন্ট")}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-white">
                    {t("Verified Proof Vault", "যাচাইকৃত প্রমাণপত্র")}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {t(
                      "Original credentials, identity and leadership proofs.",
                      "মূল সনদপত্র, পরিচয় এবং নেতৃত্বের প্রমাণসমূহ।"
                    )}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-red-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Document preview thumbnails */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                  {t("Document Preview", "ডকুমেন্ট প্রিভিউ")}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { src: proofUniversity, label: t("University", "বিশ্ববিদ্যালয়") },
                    { src: proofPzswa, label: t("Leadership", "নেতৃত্ব") },
                    { src: proofNdfBd, label: t("Appointment", "নিয়োগ") },
                    { src: proofIdentification, label: t("Identity", "পরিচয়") },
                  ].map((d) => (
                    <div
                      key={d.label}
                      title={d.label}
                      className="aspect-square overflow-hidden rounded-lg border border-red-500/20 bg-black/60 transition group-hover:border-red-500/50"
                    >
                      <img
                        src={d.src}
                        alt={d.label}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-white/50">
                  {t("Tap to open the full Proof Vault", "সম্পূর্ণ প্রুফ ভল্ট খুলতে ট্যাপ করুন")}
                </p>
              </div>
            </Link>
          </div>
        </Card>

        <p className="text-center mt-10 mb-4 text-sm text-white/60 italic px-4">
          {t(
            "This profile is shared selectively for respectful family consideration.",
            "এই প্রোফাইলটি সম্মানজনক পারিবারিক বিবেচনার জন্য সীমিতভাবে শেয়ার করা হয়েছে।"
          )}
        </p>

        {/* Premium Footer */}
        <footer className="mb-10 mt-2">
          <div className="marriage-footer-card mx-auto max-w-2xl text-center rounded-3xl px-6 py-8 border border-red-500/40 bg-gradient-to-br from-black/80 via-[var(--marriage-tint)]/90 to-black/80 backdrop-blur-md shadow-[0_30px_80px_-20px_rgba(220,38,38,0.45)]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/50 bg-red-600/10 text-red-300 text-xs font-bold uppercase tracking-[0.2em]">
              <Heart className="h-3.5 w-3.5 fill-current" />
              {t("Privately Curated Profile", "ব্যক্তিগতভাবে নির্বাচিত প্রোফাইল")}
            </div>
            <p className="mt-4 text-base md:text-lg font-semibold text-white">
              {t(
                "Curated by TrendFlux — A Private Experience",
                "TrendFlux এর মাধ্যমে পরিমার্জিত একটি ব্যক্তিগত প্রোফাইল"
              )}
            </p>
            <p className="mt-3 text-white/70 italic text-sm md:text-base">
              {t(
                "“Striving for excellence in every aspect of life, with faith, integrity, and purpose.”",
                "“বিশ্বাস, সততা ও উদ্দেশ্যবোধের সঙ্গে জীবনের প্রতিটি ক্ষেত্রে উৎকর্ষের পথে এগিয়ে চলা।”"
              )}
            </p>
            <a
              href="https://instagram.com/studiobrandtoki"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-xs uppercase tracking-[0.3em] text-red-300/80 hover:text-red-300 transition"
            >
              @studiobrandtoki
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};

const CopyChip = ({
  value,
  label,
  icon,
  bold,
  onCopied,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
  bold?: boolean;
  onCopied?: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const onCopy = async () => {
    if (loading || copied) return;
    setLoading(true);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied", { description: value });
      onCopied?.();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={loading}
      aria-busy={loading}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 disabled:cursor-wait active:scale-[0.97] ${
        bold ? "text-white font-bold text-sm" : "text-white/90 font-semibold"
      } ${
        copied
          ? "border-red-400/70 bg-red-500/20 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
          : "border-white/15 bg-white/5 hover:border-red-500/60 hover:bg-red-600/15 hover:shadow-[0_4px_18px_rgba(239,68,68,0.25)] hover:-translate-y-px"
      }`}
      title={copied ? "Copied!" : "Click to copy"}
    >
      {icon}
      <span className="truncate">{label}</span>
      {loading ? (
        <span className="h-3.5 w-3.5 inline-block rounded-full border-2 border-white/30 border-t-red-300 animate-spin" aria-hidden />
      ) : copied ? (
        <Check className="h-3.5 w-3.5 text-red-300" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-white/50 group-hover:text-red-200 transition-colors" />
      )}
    </button>
  );
};

const CallButton = ({
  phoneE164,
  onInvoke,
}: {
  phoneE164: string;
  onInvoke?: () => void;
}) => {
  const [calling, setCalling] = useState(false);
  const handle = () => {
    if (calling) return;
    setCalling(true);
    onInvoke?.();
    // Brief feedback window — `tel:` handoff is near-instant on mobile,
    // but on desktop nothing visible happens, so the spinner reassures users.
    setTimeout(() => setCalling(false), 1400);
  };
  return (
    <a
      href={`tel:${phoneE164}`}
      onClick={handle}
      aria-busy={calling}
      aria-label={`Call ${phoneE164}`}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 active:scale-[0.97] ${
        calling
          ? "border-red-400/70 bg-red-600 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.2)]"
          : "border-red-500/50 bg-red-600/10 text-red-200 hover:bg-red-600 hover:text-white hover:-translate-y-px hover:shadow-[0_6px_22px_rgba(239,68,68,0.4)]"
      }`}
    >
      {calling ? (
        <>
          <span className="h-3.5 w-3.5 inline-block rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden />
          Calling…
        </>
      ) : (
        <>
          <Phone className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" /> Call
        </>
      )}
    </a>
  );
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="my-6">
    <div className="flex items-center gap-3 mb-3">
      <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-red-600 via-white to-black" aria-hidden />
      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    <div className="rounded-3xl p-6 border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.4)] hover:border-red-500/30 transition">
      {children}
    </div>
  </section>
);

export default Marriage;

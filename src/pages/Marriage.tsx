import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Facebook, Mail, Phone, Linkedin, Heart, Copy, Check, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import profile from "@/assets/marriage/profile.jpg";
import photo1 from "@/assets/marriage/photo1.jpg";
import photo2 from "@/assets/marriage/photo2.jpg";
import photo3 from "@/assets/marriage/photo3.jpg";

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
  name: { en: string; bn: string };
  role: { en: string; bn: string };
  org?: { en: string; bn: string };
  phone: string;
  facebook?: string;
};

const references: Reference[] = [
  {
    name: { en: "Mr. Md. Abul Bashar Khan Jewel", bn: "জনাব মোঃ আবুল বাসার খান জুয়েল" },
    role: { en: "General Secretary", bn: "সাধারণ সম্পাদক" },
    org: { en: "Pabna Nagorik Committee (PNC)", bn: "পাবনা নাগরিক কমিটি (পিএনসি)" },
    phone: "+8801716808074",
    facebook: "https://www.facebook.com/bashar.k.jewel",
  },
  {
    name: { en: "Mominul Islam Muktar", bn: "মমিনুল ইসলাম মুক্তার" },
    role: { en: "Businessman, Social Worker", bn: "ব্যবসায়ী, সমাজসেবাকর্মী" },
    phone: "+8801728870710",
    facebook: "https://www.facebook.com/mukter.hossin.172235",
  },
];

const Marriage = () => {
  const [bangla, setBangla] = useState(false);
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

  const waMsg = encodeURIComponent(
    `Assalamu Alaikum${inquirer ? `, ${inquirer.name}` : ""},\n\nThank you for visiting Zahid Hasan Emon's marriage profile.${inquirerWa ? `\nYour contact on file: ${inquirerWa}` : ""}\n\nFor further discussion, please share:\n• Basic introduction\n• Family background\n• Contact number\n\nWe will get back to you shortly.`
  );

  return (
    <main
      lang={bangla ? "bn" : "en"}
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(220,38,38,0.22), transparent 45%), radial-gradient(ellipse at bottom, rgba(220,38,38,0.10), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #14060a 50%, #000000 100%)",
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
          <div className="mt-4 rounded-2xl border border-white/15 bg-gradient-to-r from-black/70 via-[#1a0507]/80 to-black/70 px-5 py-4 backdrop-blur shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] flex flex-wrap items-center justify-between gap-3">
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
                href={`https://wa.me/${inquirerWa?.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
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

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/8801410004037?text=${waMsg}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white px-5 py-3 rounded-full font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(220,38,38,0.7)] transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href="https://facebook.com/zhemongrowth"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-5 py-3 rounded-full font-bold hover:bg-white hover:text-black transition"
            >
              <Facebook className="w-4 h-4" /> Facebook
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-red-500/60 text-red-300 px-5 py-3 rounded-full font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition"
            >
              <Mail className="w-4 h-4" /> {t("Contact", "যোগাযোগ")}
            </a>
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
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-red-400" />
              <a className="hover:text-red-400 transition" href="https://wa.me/8801410004037" target="_blank" rel="noreferrer">
                WhatsApp: +8801410004037
              </a>
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
            {references.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border border-red-500/25 bg-black/40 p-5 hover:border-red-500/60 transition flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-red-600 via-white to-black flex items-center justify-center border border-white/30">
                    <User className="h-4 w-4 text-black" />
                  </div>
                  <div className="min-w-0">
                    <CopyChip value={bangla ? r.name.bn : r.name.en} label={bangla ? r.name.bn : r.name.en} bold />
                    <p className="text-xs text-red-300 mt-1">
                      {bangla ? r.role.bn : r.role.en}
                      {r.org && <span className="text-white/60"> · {bangla ? r.org.bn : r.org.en}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyChip value={r.phone} label={r.phone} icon={<Phone className="h-3.5 w-3.5" />} />
                  <a
                    href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  {r.facebook && (
                    <a
                      href={r.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-black transition"
                    >
                      <Facebook className="h-3.5 w-3.5" /> Facebook
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Selective sharing notice */}
        <p className="text-center mt-10 mb-4 text-sm text-white/60 italic px-4">
          {t(
            "This profile is shared selectively for respectful family consideration.",
            "এই প্রোফাইলটি সম্মানজনক পারিবারিক বিবেচনার জন্য সীমিতভাবে শেয়ার করা হয়েছে।"
          )}
        </p>

        {/* Premium Footer */}
        <footer className="mb-10 mt-2">
          <div className="marriage-footer-card mx-auto max-w-2xl text-center rounded-3xl px-6 py-8 border border-red-500/40 bg-gradient-to-br from-black/80 via-[#1a0507]/90 to-black/80 backdrop-blur-md shadow-[0_30px_80px_-20px_rgba(220,38,38,0.45)]">
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
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
  bold?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied: ${value}`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs ${bold ? "text-white font-bold text-sm" : "text-white/90 font-semibold"} hover:border-red-500/60 hover:bg-red-600/15 transition max-w-full`}
      title="Click to copy"
    >
      {icon}
      <span className="truncate">{label}</span>
      {copied ? <Check className="h-3.5 w-3.5 text-red-400" /> : <Copy className="h-3.5 w-3.5 text-white/50" />}
    </button>
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

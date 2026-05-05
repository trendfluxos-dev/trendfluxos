import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { MessageCircle, Facebook, Mail, Phone, Linkedin, X, ChevronLeft, ChevronRight, Pencil, Check } from "lucide-react";
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
  { label: { en: "Weight", bn: "ওজন" }, value: { en: "Approx. 60 KG", bn: "প্রায় ৬০ কেজি" } },
  { label: { en: "Blood Group", bn: "রক্তের গ্রুপ" }, value: { en: "B+", bn: "বি পজিটিভ" } },
  { label: { en: "Religion", bn: "ধর্ম" }, value: { en: "Islam", bn: "ইসলাম" } },
  { label: { en: "Nationality", bn: "জাতীয়তা" }, value: { en: "Bangladeshi", bn: "বাংলাদেশি" } },
  { label: { en: "Present Address", bn: "বর্তমান ঠিকানা" }, value: { en: "Dhaka, Bangladesh", bn: "ঢাকা, বাংলাদেশ" } },
  { label: { en: "Permanent Address", bn: "স্থায়ী ঠিকানা" }, value: { en: "Pabna, Bangladesh", bn: "পাবনা, বাংলাদেশ" } },
];

const family: Bi[] = [
  { en: "Father: Md. Mujahedul Islam — Retired Government Officer, Electrical Medical Officer, Civil Surgeon Office.", bn: "পিতা: মো. মুজাহেদুল ইসলাম — অবসরপ্রাপ্ত সরকারি কর্মকর্তা, ইলেকট্রিক্যাল মেডিকেল অফিসার, সিভিল সার্জন অফিস।" },
  { en: "Mother: Sharmin Akter Lucky — Homemaker.", bn: "মাতা: শারমিন আক্তার লাকি — গৃহিণী।" },
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

const gallery = [photo1, photo2, photo3];

const DEFAULT_WA_MSG = `Assalamu Alaikum,

Thank you for visiting Zahid Hasan Emon's marriage profile.

For further discussion, please share:
• Basic introduction
• Family background
• Contact number

We will get back to you shortly.`;

const Marriage = () => {
  const [bangla, setBangla] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const [waMsg, setWaMsg] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_WA_MSG;
    return localStorage.getItem("marriage_wa_msg") || DEFAULT_WA_MSG;
  });
  const [editingMsg, setEditingMsg] = useState(false);
  const [draftMsg, setDraftMsg] = useState(waMsg);

  const t = (en: string, bn: string) => (bangla ? bn : en);
  const waLink = `https://wa.me/8801410004037?text=${encodeURIComponent(waMsg)}`;

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const next = useCallback(() => setLightbox((i) => (i === null ? null : (i + 1) % gallery.length)), []);
  const prev = useCallback(() => setLightbox((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length)), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox, next, prev]);

  const ogUrl = typeof window !== "undefined" ? `${window.location.origin}/marriage-og.jpg` : "/marriage-og.jpg";
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/marriage` : "";
  const seoTitle = "Zahid Hasan Emon — Marriage Profile";
  const seoDesc = "Marriage profile of Zahid Hasan Emon — AI-Powered Digital Growth Specialist, Brand Architect & Growth Systems Operator. Faith • Integrity • Responsibility • Long-term Commitment.";

  return (
    <main className="min-h-screen text-white" style={{
      background: "radial-gradient(circle at top, hsl(var(--gold) / 0.16), transparent 35%), linear-gradient(180deg, #0B1F3A 0%, #07182e 100%)",
    }}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={pageUrl} />
        {/* OpenGraph */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={ogUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Zahid Hasan Emon" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={ogUrl} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-5">
        {/* Lang toggle */}
        <div className="sticky top-2 z-20 flex justify-end pt-3">
          <button
            onClick={() => setBangla((b) => !b)}
            className="px-4 py-2 rounded-full border border-gold/60 text-gold bg-[#07182e]/70 backdrop-blur text-sm font-semibold hover:bg-gold hover:text-[#07182e] transition"
          >
            {bangla ? "English" : "বাংলা"}
          </button>
        </div>

        {/* Hero */}
        <section className="text-center pt-8 pb-10">
          <img
            src={profile}
            alt="Zahid Hasan Emon"
            className="w-[150px] h-[150px] rounded-full object-cover mx-auto border-4 border-gold shadow-2xl"
          />
          <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gold tracking-wide">
            {t("Zahid Hasan Emon", "জাহিদ হাসান ইমন")}
          </h1>
          <p className="mt-3 text-[#d9e2f1] text-base md:text-lg">
            {t(
              "AI-Powered Digital Growth Specialist | Brand Architect | Growth Systems Operator",
              "এআই-পাওয়ার্ড ডিজিটাল গ্রোথ স্পেশালিস্ট | ব্র্যান্ড আর্কিটেক্ট | গ্রোথ সিস্টেম অপারেটর"
            )}
          </p>
          <p className="mt-2 text-[#f4e8bd] italic">
            {t(
              "Faith • Integrity • Responsibility • Long-term Commitment",
              "বিশ্বাস • সততা • দায়িত্ববোধ • দীর্ঘমেয়াদি অঙ্গীকার"
            )}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={waLink}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-gold text-[#07182e] px-5 py-3 rounded-full font-bold hover:opacity-90 transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href="https://facebook.com/zhemongrowth"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 border border-gold text-gold px-5 py-3 rounded-full font-bold hover:bg-gold hover:text-[#07182e] transition"
            >
              <Facebook className="w-4 h-4" /> Facebook
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-gold text-gold px-5 py-3 rounded-full font-bold hover:bg-gold hover:text-[#07182e] transition"
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
                <span className="text-[#f1d98c] font-semibold">
                  <T en={row.label.en} bn={row.label.bn} bangla={bangla} />:
                </span>{" "}
                <span className="text-[#d9e2f1]">
                  <T en={row.value.en} bn={row.value.bn} bangla={bangla} />
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* About */}
        <Card title={t("About Me", "আমার সম্পর্কে")}>
          <p className="leading-relaxed text-[#d9e2f1]">
            {t(
              "I am a responsible, family-oriented, and growth-focused person. I believe in building a stable, respectful, and meaningful life guided by faith, integrity, and long-term commitment.",
              "আমি একজন দায়িত্বশীল, পরিবারমুখী এবং লক্ষ্যভিত্তিক মানুষ। বিশ্বাস, সততা এবং দীর্ঘমেয়াদি অঙ্গীকারের ভিত্তিতে একটি স্থির, সম্মানজনক ও অর্থবহ জীবন গড়ে তুলতে বিশ্বাস করি।"
            )}
          </p>
        </Card>

        {/* Family */}
        <Card title={t("Family Background", "পারিবারিক তথ্য")}>
          <ul className="space-y-2 list-disc pl-6">
            {family.map((f, i) => (
              <li key={i} className="text-[#d9e2f1]">
                <T en={f.en} bn={f.bn} bangla={bangla} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Education */}
        <Card title={t("Educational Qualification", "শিক্ষাগত যোগ্যতা")}>
          <ul className="space-y-2 list-disc pl-6">
            {education.map((e, i) => (
              <li key={i} className="text-[#d9e2f1]">
                <T en={e.en} bn={e.bn} bangla={bangla} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Professional */}
        <Card title={t("Professional Overview", "পেশাগত পরিচিতি")}>
          <p className="leading-relaxed text-[#d9e2f1]">
            {t(
              "Professionally, I work in AI-powered digital growth systems, brand strategy, automation, funnel architecture, and business transformation. My work focuses on helping businesses create structured and scalable growth systems.",
              "পেশাগতভাবে আমি এআই-পাওয়ার্ড ডিজিটাল গ্রোথ সিস্টেম, ব্র্যান্ড স্ট্র্যাটেজি, অটোমেশন, ফানেল আর্কিটেকচার এবং বিজনেস ট্রান্সফরমেশন নিয়ে কাজ করি। ব্যবসাকে স্ট্রাকচার্ড ও স্কেলেবল গ্রোথ সিস্টেমে রূপান্তর করাই আমার কাজের মূল ফোকাস।"
            )}
          </p>
        </Card>

        {/* Attributes */}
        <Card title={t("Personal Attributes", "ব্যক্তিগত গুণাবলি")}>
          <ul className="space-y-2 list-disc pl-6">
            {attributes.map((a, i) => (
              <li key={i} className="text-[#d9e2f1]">
                <T en={a.en} bn={a.bn} bangla={bangla} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Expectation */}
        <Card title={t("Expectation from Life Partner", "জীবনসঙ্গীর প্রত্যাশা")}>
          <p className="leading-relaxed text-[#d9e2f1]">
            {t(
              "Seeking a well-educated, respectful, understanding, and family-oriented life partner who values honesty, moral character, emotional maturity, and mutual growth.",
              "একজন শিক্ষিত, ভদ্র, বুঝদার এবং পরিবারমুখী জীবনসঙ্গী প্রত্যাশা করি, যিনি সততা, ভালো চরিত্র, মানসিক পরিপক্বতা এবং পারস্পরিক উন্নয়নকে গুরুত্ব দেন।"
            )}
          </p>
        </Card>

        {/* Gallery */}
        <Card title={t("Photo Gallery", "ছবি")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gallery.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                className="group relative overflow-hidden rounded-2xl border border-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={`Open photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Zahid Hasan Emon photo ${i + 1}`}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" aria-hidden />
              </button>
            ))}
          </div>
        </Card>

        {/* WhatsApp Auto-Message Editor */}
        <Card title={t("WhatsApp Auto-Message", "হোয়াটসঅ্যাপ অটো-মেসেজ")}>
          <p className="text-sm text-[#d9e2f1]/80 mb-3">
            {t(
              "This message will be prefilled when someone clicks the WhatsApp button. Saved on this device.",
              "কেউ হোয়াটসঅ্যাপ বাটনে ক্লিক করলে এই মেসেজটি স্বয়ংক্রিয়ভাবে যাবে। এই ডিভাইসে সংরক্ষিত।"
            )}
          </p>
          {editingMsg ? (
            <div className="space-y-3">
              <textarea
                value={draftMsg}
                onChange={(e) => setDraftMsg(e.target.value)}
                rows={9}
                className="w-full rounded-xl bg-[#07182e]/60 border border-gold/30 p-4 text-[#d9e2f1] focus:outline-none focus:border-gold"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setWaMsg(draftMsg);
                    localStorage.setItem("marriage_wa_msg", draftMsg);
                    setEditingMsg(false);
                  }}
                  className="inline-flex items-center gap-2 bg-gold text-[#07182e] px-4 py-2 rounded-full font-bold text-sm"
                >
                  <Check className="w-4 h-4" /> {t("Save", "সংরক্ষণ")}
                </button>
                <button
                  onClick={() => { setDraftMsg(waMsg); setEditingMsg(false); }}
                  className="inline-flex items-center gap-2 border border-gold/50 text-gold px-4 py-2 rounded-full font-bold text-sm"
                >
                  {t("Cancel", "বাতিল")}
                </button>
                <button
                  onClick={() => setDraftMsg(DEFAULT_WA_MSG)}
                  className="inline-flex items-center gap-2 border border-white/20 text-[#d9e2f1] px-4 py-2 rounded-full text-sm"
                >
                  {t("Reset to default", "ডিফল্টে ফিরুন")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <pre className="whitespace-pre-wrap font-sans rounded-xl bg-[#07182e]/60 border border-gold/20 p-4 text-[#d9e2f1] text-sm">
                {waMsg}
              </pre>
              <button
                onClick={() => { setDraftMsg(waMsg); setEditingMsg(true); }}
                className="inline-flex items-center gap-2 border border-gold text-gold px-4 py-2 rounded-full font-bold text-sm hover:bg-gold hover:text-[#07182e] transition"
              >
                <Pencil className="w-4 h-4" /> {t("Edit message", "মেসেজ এডিট করুন")}
              </button>
            </div>
          )}
        </Card>

        {/* Contact */}
        <Card title={t("Contact Information", "যোগাযোগ")}>
          <ul className="space-y-3 text-[#d9e2f1]" id="contact">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold" />
              <a className="hover:text-gold" href={waLink} target="_blank" rel="noreferrer">
                WhatsApp: +8801410004037
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold" />
              <a className="hover:text-gold" href="mailto:zhemongrowth@gmail.com">
                zhemongrowth@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Facebook className="w-4 h-4 text-gold" />
              <a className="hover:text-gold" href="https://facebook.com/zhemongrowth" target="_blank" rel="noreferrer">
                facebook.com/zhemongrowth
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Linkedin className="w-4 h-4 text-gold" />
              <a className="hover:text-gold" href="https://linkedin.com/in/zhemongrowth" target="_blank" rel="noreferrer">
                linkedin.com/in/zhemongrowth
              </a>
            </li>
          </ul>
        </Card>

        {/* Footer */}
        <footer className="text-center py-10 text-[#f4e8bd] italic">
          {t(
            "“Striving for excellence in every aspect of life, with faith, integrity, and purpose.”",
            "“বিশ্বাস, সততা ও উদ্দেশ্যবোধের সঙ্গে জীবনের প্রতিটি ক্ষেত্রে উৎকর্ষের পথে এগিয়ে চলা।”"
          )}
        </footer>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Close"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
            className="absolute left-3 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img
            src={gallery[lightbox]}
            alt={`Zahid Hasan Emon photo ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl border border-gold/40 shadow-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
            className="absolute right-3 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[#f4e8bd] text-sm">
            {lightbox + 1} / {gallery.length}
          </div>
        </div>
      )}
    </main>
  );
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="my-6">
    <h2 className="text-gold text-2xl font-bold mb-3">{title}</h2>
    <div className="rounded-3xl p-6 border border-gold/20 bg-white/[0.065] backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
      {children}
    </div>
  </section>
);

export default Marriage;

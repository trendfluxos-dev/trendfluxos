import { useState } from "react";
import { MessageCircle, Facebook, Mail, Phone, Linkedin } from "lucide-react";
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

const Marriage = () => {
  const [bangla, setBangla] = useState(false);
  const t = (en: string, bn: string) => (bangla ? bn : en);

  const waMsg = encodeURIComponent(
    "Assalamu Alaikum,\n\nThank you for visiting Zahid Hasan Emon's marriage profile.\n\nFor further discussion, please share:\n• Basic introduction\n• Family background\n• Contact number\n\nWe will get back to you shortly."
  );

  return (
    <main className="min-h-screen text-white" style={{
      background: "radial-gradient(circle at top, hsl(var(--gold) / 0.16), transparent 35%), linear-gradient(180deg, #0B1F3A 0%, #07182e 100%)",
      backgroundAttachment: "fixed",
    }}>
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

        {/* Availability Banner */}
        <div className="mt-4 rounded-2xl border border-gold/50 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 px-5 py-4 text-center shadow-[0_8px_30px_rgba(200,169,81,0.25)]">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>
            </span>
            {t("Available for Marriage", "বিবাহের জন্য প্রস্তুত")}
          </div>
          <p className="mt-2 text-base md:text-lg font-semibold text-white">
            {t(
              "Currently seeking a sincere, well-mannered & beautiful (shaa-sundori) life partner.",
              "একজন আন্তরিক, সুশীল ও সুন্দরী (সাহা-সুন্দরী) জীবনসঙ্গী খুঁজছি।"
            )}
          </p>
          <p className="mt-1 text-sm text-[#f4e8bd]">
            {t(
              "Serious proposals from respectful families are warmly welcomed.",
              "সম্মানিত পরিবার থেকে আন্তরিক প্রস্তাব সাদরে আমন্ত্রিত।"
            )}
          </p>
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
              href={`https://wa.me/8801410004037?text=${waMsg}`}
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
              "Looking for a well-educated, fair-skinned (forsha), and beautiful life partner who carries a modern outlook with cultural grace. She should be open-minded, flexible, emotionally mature, and family-oriented — someone who values honesty, mutual respect, shared growth, and balances tradition with the modern era comfortably.",
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
                className="w-full h-72 object-cover rounded-2xl border border-gold/30"
              />
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card title={t("Contact Information", "যোগাযোগ")}>
          <ul className="space-y-3 text-[#d9e2f1]" id="contact">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold" />
              <a className="hover:text-gold" href="https://wa.me/8801410004037" target="_blank" rel="noreferrer">
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

        {/* Selective sharing notice */}
        <p className="text-center mt-10 mb-4 text-sm text-[#f4e8bd]/80 italic px-4">
          {t(
            "This profile is shared selectively for respectful family consideration.",
            "এই প্রোফাইলটি সম্মানজনক পারিবারিক বিবেচনার জন্য সীমিতভাবে শেয়ার করা হয়েছে।"
          )}
        </p>

        {/* Premium Footer */}
        <footer className="mb-10 mt-2">
          <div className="marriage-footer-card mx-auto max-w-2xl text-center rounded-3xl px-6 py-8 border border-gold/40 bg-gradient-to-br from-[#0b1f3a]/80 via-[#07182e]/90 to-[#0b1f3a]/80 backdrop-blur-md">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/50 bg-gold/10 text-gold text-xs font-bold uppercase tracking-[0.2em]">
              <span className="text-base leading-none">✔</span>
              {t("Privately Curated Profile", "ব্যক্তিগতভাবে নির্বাচিত প্রোফাইল")}
            </div>
            <p className="mt-4 text-base md:text-lg font-semibold text-white">
              {t(
                "Curated by TrendFlux — A Private Experience",
                "TrendFlux এর মাধ্যমে পরিমার্জিত একটি ব্যক্তিগত প্রোফাইল"
              )}
            </p>
            <p className="mt-3 text-[#f4e8bd] italic text-sm md:text-base">
              {t(
                "“Striving for excellence in every aspect of life, with faith, integrity, and purpose.”",
                "“বিশ্বাস, সততা ও উদ্দেশ্যবোধের সঙ্গে জীবনের প্রতিটি ক্ষেত্রে উৎকর্ষের পথে এগিয়ে চলা।”"
              )}
            </p>
            <a
              href="https://instagram.com/studiobrandtoki"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-xs uppercase tracking-[0.3em] text-gold/80 hover:text-gold transition"
            >
              @studiobrandtoki
            </a>
          </div>
        </footer>
      </div>
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

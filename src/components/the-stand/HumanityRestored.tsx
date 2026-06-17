import belalPortraitAsset from "@/assets/belal-hossen.webp.asset.json";
const belalPortrait = belalPortraitAsset.url;
import zahidPress from "@/assets/zahid-press-moment.jpg";
import { Reveal } from "./Reveal";

const timeline = [
  "নীরবতা",
  "ভয়",
  "বিচ্ছিন্নতা",
  "একটি কথোপকথন",
  "প্রেস কনফারেন্স",
  "প্রকাশ্য সত্য",
  "পুনরুদ্ধার",
];

export function HumanityRestored() {
  return (
    <section
      aria-label="Humanity Restored — The person who helped me speak again"
      className="relative px-6 lg:px-10 py-28 md:py-40"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--stand-bone-soft)) 0%, #f3ede3 45%, #efe6d6 100%)",
      }}
    >
      {/* warm grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.25 0 0 0 0 0.1 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Eyebrow + section title */}
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[#a06b2c]"
          >
            Humanity Restored · A bridge between collapse and rebuilding
          </p>
          <h2
            lang="en"
            className="mt-4 font-display text-3xl md:text-5xl font-semibold leading-tight text-[#1f1a14]"
          >
            The person who helped me speak again.
          </h2>
          <p
            lang="bn"
            className="mt-3 text-base md:text-lg text-[#6b5a40]"
          >
            যখন সবাই নীরব ছিল।
          </p>
        </Reveal>

        {/* FRAME ONE — Belal portrait + quote */}
        <div className="mt-20 grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <Reveal>
            <figure className="relative overflow-hidden rounded-sm shadow-[0_30px_80px_-40px_rgba(60,40,20,0.45)]">
              <img
                src={belalPortrait}
                alt="Belal Hossen — ethical journalist who listened"
                loading="lazy"
                className="w-full h-auto object-cover grayscale-[0.15] contrast-[0.95]"
                style={{ filter: "sepia(0.12) saturate(0.95) brightness(0.98)" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 55%, rgba(40,28,14,0.35) 100%)",
                }}
              />
            </figure>
            <figcaption
              lang="en"
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.35em] text-[#8a6b3a]"
            >
              Belal Hossen · Journalist
            </figcaption>
          </Reveal>

          <Reveal delay={120}>
            <blockquote
              lang="bn"
              className="font-display text-2xl md:text-4xl font-semibold leading-snug text-[#1f1a14]"
            >
              “ন্যায়ের দাবি তোলা এখনো সম্ভব।”
            </blockquote>
            <p
              lang="bn"
              className="mt-8 max-w-md text-base md:text-lg leading-[1.85] text-[#4a3f2e]"
            >
              যখন চারদিক নীরব হয়ে গিয়েছিল, যখন প্রশ্ন করাটাই বিপদ মনে
              হচ্ছিল — তখন একজন মানুষ থামলেন। শুনলেন। বিশ্বাস করলেন।
              কোনো ক্যামেরার আলোর জন্য নয়, কোনো শিরোনামের জন্য নয় — শুধু
              এই বিশ্বাসে যে সত্যের পাশে দাঁড়ানো এখনো জরুরি।
            </p>
          </Reveal>
        </div>

        {/* Dialogue block */}
        <Reveal delay={80}>
          <figure className="mt-28 mx-auto max-w-3xl border-l-2 border-[#c8902f]/60 pl-8 md:pl-12">
            <blockquote
              lang="bn"
              className="font-display text-xl md:text-3xl font-medium leading-[1.55] text-[#1f1a14]"
            >
              “তুমি জানো আমি কেন চাই তুমি বিচার পাও? অন্তত এই ঘটনাটা যেন আর
              অন্য কারো সাথে না হয়। তুমি প্রতিবাদ করেছো। তুমি বিচার পাও বা
              না পাও — তোমার এই দাঁড়িয়ে যাওয়াটা যেন ভবিষ্যতে আরেকজন মানুষকে
              একই অন্যায়ের শিকার হওয়া থেকে বাঁচাতে পারে। আমি শুধু এটা
              নিশ্চিত করতে চাই।”
            </blockquote>
            <figcaption
              lang="en"
              className="mt-6 font-mono text-[11px] uppercase tracking-[0.35em] text-[#a06b2c]"
            >
              — Belal Hossen
            </figcaption>
          </figure>
        </Reveal>

        {/* FRAME TWO — Press conference moment */}
        <div className="mt-28 grid gap-12 md:grid-cols-5 md:gap-16 items-center">
          <Reveal className="md:col-span-3 md:order-2">
            <figure className="relative overflow-hidden rounded-sm shadow-[0_30px_80px_-40px_rgba(60,40,20,0.45)]">
              <img
                src={zahidPress}
                alt="Zahid Hasan Emon speaking publicly after silence"
                loading="lazy"
                className="w-full h-auto object-cover"
                style={{ filter: "sepia(0.15) saturate(0.9) contrast(0.95) brightness(1.02)" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(40,28,14,0.35) 100%)",
                }}
              />
            </figure>
          </Reveal>

          <Reveal delay={120} className="md:col-span-2 md:order-1">
            <p
              lang="en"
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#a06b2c]"
            >
              Frame II · Voice returns
            </p>
            <h3
              lang="bn"
              className="mt-4 font-display text-2xl md:text-3xl font-semibold leading-snug text-[#1f1a14]"
            >
              ভয় → কণ্ঠস্বর। নীরবতা → সত্য। ভেঙে পড়া → পুনরুদ্ধার।
            </h3>
            <p
              lang="bn"
              className="mt-6 text-base leading-[1.85] text-[#4a3f2e]"
            >
              দীর্ঘ নীরবতার পর প্রথমবার প্রকাশ্যে কথা বলা। ক্যামেরার সামনে
              দাঁড়ানোটা সহজ ছিল না — কিন্তু একজন মানুষের নিঃশব্দ সমর্থন
              সেই মুহূর্তটাকে সম্ভব করেছিল।
            </p>
          </Reveal>
        </div>

        {/* Heartbeat line */}
        <Reveal delay={60}>
          <div className="mt-32 md:mt-40 text-center">
            <p
              lang="bn"
              className="mx-auto max-w-4xl font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.2] tracking-tight text-[#1f1a14]"
            >
              আজ আমি আবার নিজের ওপর বিশ্বাস করি।
            </p>
            <div
              aria-hidden
              className="mx-auto mt-10 h-px w-24"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(200,144,47,0.8), transparent)",
              }}
            />
          </div>
        </Reveal>

        {/* What Changed Everything */}
        <div className="mt-28 md:mt-36 mx-auto max-w-2xl">
          <Reveal>
            <p
              lang="en"
              className="text-[10px] uppercase tracking-[0.4em] text-[#a06b2c]"
            >
              What changed everything
            </p>
          </Reveal>
          <ol className="mt-10 space-y-5">
            {timeline.map((step, i) => (
              <Reveal as="li" key={step} delay={i * 70}>
                <div className="flex items-baseline gap-6">
                  <span
                    lang="en"
                    className="font-mono text-[10px] tracking-[0.3em] text-[#a06b2c]/70 w-8"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    lang="bn"
                    className="font-display text-lg md:text-xl text-[#1f1a14]"
                  >
                    {step}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Universal closing */}
        <Reveal delay={80}>
          <p
            lang="bn"
            className="mt-28 md:mt-36 mx-auto max-w-3xl text-center font-display text-lg md:text-2xl leading-[1.7] text-[#4a3f2e] italic"
          >
            প্রতিটি অন্ধকার ব্যবস্থার মধ্যেও কিছু মানুষ থাকে যারা নীরবে
            সত্যের পাশে দাঁড়ায়।
          </p>
        </Reveal>
      </div>
    </section>
  );
}

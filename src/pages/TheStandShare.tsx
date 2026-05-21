import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { ArrowLeft, Download, Quote as QuoteIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THE_STAND } from "@/content/theStand";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

type Ratio = {
  id: "square" | "story" | "landscape";
  label: string;
  use: string;
  w: number;
  h: number;
};

const RATIOS: Ratio[] = [
  { id: "square", label: "1:1 · Instagram / Facebook Post", use: "IG Feed", w: 1080, h: 1080 },
  { id: "story", label: "9:16 · Story / Reel", use: "IG Story · FB Story", w: 1080, h: 1920 },
  { id: "landscape", label: "16:9 · Facebook / X Share", use: "FB · X · LinkedIn", w: 1200, h: 675 },
];

export default function TheStandShare() {
  useSeo({
    title: "Share The Stand — কোট-কার্ড জেনারেটর | TrendFlux",
    description:
      "জাহিদ হাসান ইমনের আইকনিক বাণীগুলো এক ক্লিকে ছড়িয়ে দিন — Facebook, Instagram, Story-ready 1080px কোট কার্ড।",
    type: "article",
    image: "/og-the-stand.jpg",
  });

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [ratio, setRatio] = useState<Ratio>(RATIOS[0]);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const quote = THE_STAND.quotes[quoteIdx];

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: ratio.w / cardRef.current.offsetWidth,
        cacheBust: true,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = `the-stand-${ratio.id}-${quoteIdx + 1}.png`;
      link.href = dataUrl;
      link.click();
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } finally {
      setDownloading(false);
    }
  }, [ratio, quoteIdx]);

  const previewW = 520;
  const previewH = Math.round((ratio.h / ratio.w) * previewW);

  return (
    <main lang="bn" className="min-h-screen bg-background text-foreground">
      <section className="px-6 lg:px-10 pt-20 pb-10">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/the-stand"
            lang="en"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-foreground/50 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to The Stand
          </Link>
          <p className="mt-8 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Share Kit
          </p>
          <h1 className="font-display mt-4 text-3xl md:text-5xl font-bold leading-tight">
            কোট-কার্ড জেনারেটর
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/70">
            একটি বাণী বেছে নিন, ফর্ম্যাট নির্বাচন করুন, এবং সরাসরি ডাউনলোড করে Facebook,
            Instagram, অথবা Story-তে শেয়ার করুন।
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold/80">
                ১. বাণী নির্বাচন
              </h2>
              <div className="space-y-2">
                {THE_STAND.quotes.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuoteIdx(i)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all",
                      quoteIdx === i
                        ? "border-gold/60 bg-gold/[0.06] shadow-gold/20"
                        : "border-border bg-foreground/[0.03] hover:border-gold/30",
                    )}
                  >
                    <p className="font-display text-base md:text-lg font-bold leading-snug">
                      &ldquo;{q.bn}&rdquo;
                    </p>
                    {q.context && (
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-foreground/50">
                        — {q.context}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold/80">
                ২. ফর্ম্যাট
              </h2>
              <div className="grid gap-2">
                {RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRatio(r)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                      ratio.id === r.id
                        ? "border-gold/60 bg-gold/[0.06]"
                        : "border-border bg-foreground/[0.03] hover:border-gold/30",
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold">{r.label}</p>
                      <p lang="en" className="text-[11px] uppercase tracking-wider text-foreground/50">
                        {r.use} · {r.w}×{r.h}
                      </p>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-gold/70">
                      {r.id === ratio.id ? "Selected" : "Pick"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="gold"
              size="lg"
              className="w-full"
            >
              {done ? (
                <>
                  <Check className="h-4 w-4" /> Downloaded
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {downloading ? "Rendering…" : `Download PNG · ${ratio.w}×${ratio.h}`}
                </>
              )}
            </Button>
            <p className="text-[11px] text-foreground/50 leading-relaxed">
              রেন্ডার হয় আপনার ব্রাউজারে — কোনো সার্ভার আপলোড নেই, কোনো ওয়াটারমার্ক নেই।
              ফাইল সরাসরি Facebook / Instagram-এ আপলোড করতে পারেন।
            </p>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-foreground/50">
              Live Preview · {ratio.w}×{ratio.h}
            </p>
            <div
              className="rounded-2xl ring-1 ring-gold/20 shadow-2xl overflow-hidden"
              style={{ width: previewW, maxWidth: "100%" }}
            >
              <div
                ref={cardRef}
                className="relative bg-[#0a0a0a] text-[#f5f0e0]"
                style={{
                  width: previewW,
                  height: previewH,
                  fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0"
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 10%, rgba(201,168,76,0.18), transparent 55%)",
                  }}
                />

                <div className="absolute inset-0 flex flex-col p-8">
                  <div className="flex items-center justify-between">
                    <p
                      lang="en"
                      style={{
                        color: "#c9a84c",
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      The Stand
                    </p>
                    <QuoteIcon style={{ width: 18, height: 18, color: "#c9a84c" }} />
                  </div>

                  <div className="flex-1 flex items-center">
                    <blockquote
                      style={{
                        fontWeight: 700,
                        color: "#f5f0e0",
                        fontSize:
                          ratio.id === "story"
                            ? Math.max(28, Math.round(previewW * 0.075))
                            : Math.max(24, Math.round(previewW * 0.062)),
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      &ldquo;{quote.bn}&rdquo;
                    </blockquote>
                  </div>

                  <div>
                    {quote.context && (
                      <p
                        style={{
                          color: "rgba(201,168,76,0.85)",
                          fontSize: 11,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        — {quote.context}
                      </p>
                    )}
                    <div
                      style={{
                        marginTop: 14,
                        height: 1,
                        width: 56,
                        background: "#c9a84c",
                      }}
                    />
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: "#f5f0e0",
                            fontSize: 14,
                          }}
                        >
                          জাহিদ হাসান ইমন
                        </p>
                        <p
                          style={{
                            color: "rgba(245,240,224,0.55)",
                            fontSize: 11,
                          }}
                        >
                          সত্যের পক্ষে এক অটল অবস্থান
                        </p>
                      </div>
                      <p
                        lang="en"
                        style={{
                          color: "rgba(201,168,76,0.7)",
                          fontSize: 10,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        {BRAND.url.replace(/^https?:\/\//, "")}/the-stand
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

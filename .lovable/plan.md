
# জাহিদ হাসান ইমন — Idol Platform Plan

আপলোড করা ডসিয়ারে যা পেয়েছি: পেশাগত প্রোফাইল, "মায়ের নিষেধ আছে" সততার ঘোষণা, ১৩ আগস্ট ২০২৩-এর টর্চার সেলের পূর্ণ বিবরণ, চরিত্র হনন কৌশল, ২০২৪ গণঅভ্যুত্থানের প্রসঙ্গ, ১৯+ গণমাধ্যম রেফারেন্স। বর্তমান সাইটে এই উপাদানগুলো ছড়ানো — Hero, Story timeline, Press grid — কিন্তু কোনো **কেন্দ্রীয় "ইমন স্টোরি হাব"** নেই। প্ল্যানের মূল লক্ষ্য: ডসিয়ারের narrative arc-কে একটি cinematic, citable, share-friendly ডিজিটাল মনুমেন্টে রূপ দেওয়া।

---

## ১. নতুন রুট: `/the-stand` (Story Hub)

ইমনের সম্পূর্ণ গল্পের জন্য ডেডিকেটেড পেজ — Index.tsx-এর সংক্ষিপ্ত সেকশনগুলোর "Read the full record" destination।

**সেকশন স্ট্রাকচার (ডসিয়ারের ১৪টি অধ্যায় থেকে কিউরেটেড):**

1. **Cinematic Opener** — full-bleed portrait + একক বাক্য: *"মায়ের নিষেধ আছে।"* — scroll-triggered fade
2. **The Man** — প্রোফাইল কার্ড (একাডেমিক, IT দক্ষতা, পারিবারিক মূল্যবোধ) ডসিয়ারের সারণি-১ থেকে
3. **The System He Refused** — JU টর্চার সেল ও চাঁদাবাজির রাজনৈতিক অর্থনীতি (প্রসঙ্গ + ডেটা)
4. **The Refusal** — দেশ রূপান্তর কোট, তিনটি সমাজবৈজ্ঞানিক ব্যাখ্যা (পারিবারিক মূল্যবোধ, hierarchy অস্বীকার, আত্মত্যাগ)
5. **13 August 2023 — Timeline** — ফাঁদ → রড/হাতুড়ি → পিস্তল → মদ ঢালা → ভিডিও ধারণ — vertical timeline, hour-by-hour
6. **The Aftermath** — চরিত্র হনন কৌশল, নিঃসঙ্গতা, প্রশাসনিক নীরবতা
7. **July 2024 Context** — গণঅভ্যুত্থানে তার ভূমিকার সাথে সংযোগ
8. **Public Record** — ১৯টি verified press item (existing data পুনঃব্যবহার)
9. **Why He Matters Now** — whistleblower psychology, future generations
10. **Take a Stand** — share kit, contact, support CTA

---

## ২. Hero সেকশনে "Idol Anchor"

`/` -এর Hero-তে একটি ছোট, premium badge যোগ — **"একজন মানুষের অবস্থান, একটি জাতির বিবেক"** সাব-হেডলাইন এবং `/the-stand`-এ deep CTA। বাকি homepage অপরিবর্তিত।

---

## ৩. Iconic Quote Component (পুরো সাইটে reusable)

`<IconicQuote>` — large-format pull-quote কার্ড (গোল্ড accent, Bengali typography optimized)। ডসিয়ার থেকে ৬টি hero-quote curated:
- "মায়ের নিষেধ আছে।"
- "পেটে নয়, মাথায় গুলি করুন।"
- "আমি চাঁদা নিতাম না। আর কেউ নেয় কিনা সেটা জানি না।"
- ৩টি আরও

হোমে rotating, `/the-stand`-এ section dividers হিসেবে, share-image generation ready।

---

## ৪. Share Kit — "Carry the Stand"

`/the-stand/share` ছোট ইউটিলিটি:
- প্রতিটি iconic quote-এর জন্য pre-rendered OG image (gold/dark, Bengali safe)
- Copy-ready captions (বাংলা + English)
- Twitter/Facebook/LinkedIn direct-share buttons
- "Cite this record" — APA/MLA/journalistic citation generator

লক্ষ্য: সমর্থকরা যেন এক ক্লিকে গল্প ছড়াতে পারে।

---

## ৫. SEO + Schema (Idol discoverability)

- `/the-stand`-এ `Person` + `NewsArticle` JSON-LD (existing `useJsonLd` hook ব্যবহার)
- Title: *"জাহিদ হাসান ইমন — সত্যের পক্ষে এক অটল অবস্থান | TrendFlux"*
- Meta description ডসিয়ারের ভূমিকা থেকে
- Sitemap-এ যোগ + Press detail পেজগুলো থেকে cross-link
- Open Graph image: portrait + iconic quote

---

## ৬. Data layer

ডসিয়ার থেকে structured content দুই জায়গায়:
- **`src/content/theStand.ts`** — সম্পূর্ণ narrative (sections, timeline events, quotes, footnotes) typed object হিসেবে — version control friendly, admin UI প্রয়োজন নেই (এটা historical record, frequently edited নয়)
- **press_items table** — already seeded ১৯টি verified entry (পূর্ববর্তী turn-এ done)

---

## ৭. ছবি ও media

- আপলোড করা DOCX থেকে extracted images (`parsed-documents://.../page_*.jpg`) review করে usable ones `src/assets/the-stand/` -এ কপি — facsimile press scans, document excerpts
- যেখানে quality কম, সেখানে generated dark portrait illustration (premium imagegen)
- Lazy-load + responsive `<picture>` for Bengali-text-heavy mobile audience

---

## ৮. Implementation order

1. `src/content/theStand.ts` — full narrative data (ডসিয়ার থেকে)
2. `src/pages/TheStand.tsx` — full hub page with 10 sections
3. `src/components/IconicQuote.tsx` — reusable quote component
4. `src/lib/routes.ts` + `src/lib/commandPaletteConfig.ts` — register route
5. Hero anchor in `Index.tsx`
6. Share kit utility (`/the-stand/share`)
7. Image assets + OG image generation
8. SEO/JSON-LD + sitemap entry
9. QA: Bengali typography, mobile (902px viewport user is on), Lighthouse

---

## Technical notes

- কোনো ডাটাবেস migration লাগবে না — narrative static content; press_items existing
- design tokens: existing `gold`, `glass`, `font-display` (Bengali safe — Noto Sans Bengali/Hind Siliguri already loaded)
- routing: lazy-loaded in `routes.ts` pattern অনুসরণ
- accessibility: `lang="bn"` proper attribution, prefers-reduced-motion respect
- কোনো নতুন dependency নয়

আপ্রুভ করলে এই অর্ডারে বিল্ড শুরু করব।

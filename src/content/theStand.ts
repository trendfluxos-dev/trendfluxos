// Curated narrative for the dedicated story hub at /the-stand.
// Source: জাহিদ_হাসান_ইমন.docx dossier — পেশাগত ও রাজনৈতিক জীবনবৃত্তান্ত।

export type IconicQuote = { bn: string; en?: string; context?: string };
export type TimelineEvent = { time: string; title: string; body: string };
export type ProfileRow = { label: string; value: string };

export const THE_STAND = {
  hero: {
    eyebrow: "একজন মানুষের অবস্থান, একটি জাতির বিবেক",
    title: "জাহিদ হাসান ইমন",
    subtitle:
      "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ে টর্চার সেল ও চাঁদাবাজির বিরুদ্ধে এক অটুট নৈতিকতার সংগ্রাম।",
    keystone: "মায়ের নিষেধ আছে।",
    keystoneContext:
      "দেশ রূপান্তর পত্রিকায় দেওয়া সাক্ষাৎকারে — চাঁদাবাজির ভাগ প্রত্যাখ্যানের ব্যাখ্যা।",
  },

  profile: [
    { label: "শিক্ষাপ্রতিষ্ঠান", value: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (জাবি)" },
    { label: "আবাসিক হল", value: "মওলানা ভাসানী হল" },
    { label: "পেশাগত পরিচিতি", value: "ব্র্যান্ড আর্কিটেক্ট, গ্রোথ অপারেটর" },
    { label: "প্রতিষ্ঠান", value: "TrendFlux Ecosystem · Studio BrandToki" },
    { label: "চারিত্রিক বৈশিষ্ট্য", value: "অটুট নৈতিকতা, পারিবারিক মূল্যবোধ, হুইসেলব্লোয়ার সাহস" },
    { label: "জাতীয় কভারেজ", value: "১৯+ যাচাইকৃত গণমাধ্যম প্রতিবেদন" },
  ] satisfies ProfileRow[],

  system: {
    title: "যে কাঠামোকে তিনি প্রত্যাখ্যান করেছেন",
    body:
      "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের আবাসিক হলগুলোতে দীর্ঘদিন ধরে চলে আসা একটি কাঠামোগত ব্যাধি হলো রাজনৈতিক ছত্রছায়ায় গড়ে ওঠা 'টর্চার সেল' এবং বলপূর্বক চাঁদাবাজির সংস্কৃতি। হলের ভাইনিং, ক্যান্টিন, উন্নয়ন প্রকল্প এবং স্থানীয় ব্যবসায়ীদের কাছ থেকে নিয়মিত চাঁদা আদায় ছিল এক অলিখিত নিয়ম। মওলানা ভাসানী হলের ১২৬ নম্বর কক্ষ পরিচিতি পেয়েছিল 'টর্চার সেল' হিসেবে — যেখানে শিক্ষার্থীদের ভীতি প্রদর্শন এবং শারীরিক নির্যাতনই ছিল ক্ষমতা বজায় রাখার হাতিয়ার।",
    stats: [
      { value: "১২৬", label: "নম্বর কক্ষ — 'টর্চার সেল'" },
      { value: "১৩ আগস্ট ২০২৩", label: "পূর্বপরিকল্পিত হামলার তারিখ" },
      { value: "১৯+", label: "যাচাইকৃত জাতীয় প্রতিবেদন" },
    ],
  },

  refusal: {
    title: "প্রত্যাখ্যান: 'মায়ের নিষেধ আছে'",
    quote:
      "হলে কোনো চাঁদার ভাগ আমি নিতাম না, সোহেল ভাইকে বলেছি আমার মায়ের নিষেধ আছে।",
    source: "দেশ রূপান্তর — উপাচার্য বরাবর লিখিত ই-মেইল অভিযোগ",
    pillars: [
      {
        title: "পারিবারিক মূল্যবোধের জয়",
        body:
          "দুর্নীতিগ্রস্ত কাঠামোর ভেতরে থেকেও মায়ের শেখানো সততাকে সর্বোচ্চ অগ্রাধিকার — প্রতিষ্ঠানিক সুশাসন না থাকলেও পারিবারিক সুশিক্ষাই যে একজনকে সঠিক পথে রাখে, তার প্রমাণ।",
      },
      {
        title: "ক্ষমতার সুরভেদ অস্বীকার",
        body:
          "দলের সভাপতির মুখোমুখি দাঁড়িয়ে পারিবারিক সততার আদর্শকে বড় করে তোলা — ছাত্র রাজনীতির অলিখিত হ্যারার্কির বিরুদ্ধে অভাবনীয় সাহস।",
      },
      {
        title: "অর্থনৈতিক প্রলোভন প্রত্যাখ্যান",
        body:
          "বিপুল অবৈধ অর্থের প্রবাহ থেকে নিজেকে সরিয়ে রাখা — সততার জন্য অর্থনৈতিক আত্মত্যাগের প্রকৃত দৃষ্টান্ত।",
      },
    ],
  },

  timeline: {
    title: "১৩ আগস্ট ২০২৩ — ঘটনাবলির বিবরণ",
    subtitle: "মওলানা ভাসানী হল, ১২৬ নম্বর কক্ষ। আকস্মিক সংঘাত নয় — সুপরিকল্পিত আক্রমণ।",
    events: [
      {
        time: "পূর্বপ্রস্তুতি",
        title: "ফাঁদ পাতা",
        body: "সাভারের রেডিও কলোনী এলাকার এক তুচ্ছ দ্বন্দ্বকে অজুহাত বানিয়ে আরমান খান যুব ইমনকে টার্গেট করে।",
      },
      {
        time: "মধ্যরাত",
        title: "ফোন কল ও ডেকে আনা",
        body: "মওলানা ভাসানী হলের সামনে আসতে বলা হয়। ইমন সরল বিশ্বাসে পৌঁছালে মোটরসাইকেল বাইরে রেখে সরাসরি ১২৬ নম্বর কক্ষে নিয়ে যাওয়া হয়।",
      },
      {
        time: "প্রথম প্রহর",
        title: "রড ও হাতুড়ির পৈশাচিক প্রয়োগ",
        body: "কক্ষের দরজা বন্ধ। চারজন প্রাপ্তবয়স্কের পরিকল্পিত পাশবিক আক্রমণ একজন নিরস্ত্র শিক্ষার্থীর ওপর — অনবরত রড ও হাতুড়ির ব্যবহার।",
      },
      {
        time: "চরম মুহূর্ত",
        title: "আগ্নেয়াস্ত্র — মৃত্যুর মুখোমুখি",
        body: "অবৈধ পিস্তল বের করে ইমনের পেটে ঠেকানো হয়। ভয়ে কাঁপতে কাঁপতে ইমন বলেছিলেন — পেটে নয়, মাথায় গুলি করুন।",
      },
      {
        time: "চরিত্র হনন",
        title: "জোরপূর্বক মদ ঢালা ও ভিডিও ধারণ",
        body: "শরীরে জোর করে মদ ঢেলে গন্ধ তৈরি করা হয় — পরবর্তীতে মাদকাসক্ত প্রমাণ করার ধূর্ত কৌশল। জোরপূর্বক স্বীকারোক্তির ভিডিও ধারণ করা হয়।",
      },
      {
        time: "পরের দিনগুলো",
        title: "নিঃসঙ্গতা ও প্রশাসনিক নীরবতা",
        body: "হল প্রশাসন, প্রক্টরিয়াল বডি এবং বিশ্ববিদ্যালয় কর্তৃপক্ষের নাকের ডগায় বছরের পর বছর ধরে চলা এই কাঠামোর নীরব অনুমোদন প্রকট হয়ে ওঠে।",
      },
    ] satisfies TimelineEvent[],
  },

  quotes: [
    { bn: "মায়ের নিষেধ আছে।", context: "দেশ রূপান্তর — উপাচার্য বরাবর অভিযোগ" },
    { bn: "পেটে নয়, মাথায় গুলি করুন।", context: "১৩ আগস্ট ২০২৩ — মৃত্যুর মুখোমুখি" },
    {
      bn: "আমি চাঁদা নিতাম না। আর কেউ নেয় কিনা সেটা জানি না।",
      context: "দেশ রূপান্তর — সাক্ষাৎকার",
    },
    { bn: "চুপ থাকা মানে অন্যায়ের সঙ্গে চুক্তি।", context: "হুইসেলব্লোয়িং দর্শন" },
    {
      bn: "সাহস মানে নিরাপদ থাকা নয় — সঠিক পথে দাঁড়িয়ে থাকা।",
      context: "ব্যক্তিগত দর্শন",
    },
    { bn: "ন্যায়ের দাবি তোলা এখনো সম্ভব।", context: "ভবিষ্যৎ প্রজন্মের জন্য বার্তা" },
  ] satisfies IconicQuote[],

  context2024: {
    title: "জুলাই ২০২৪ — গণঅভ্যুত্থানের প্রেক্ষাপট",
    body:
      "২০২৩ সালে একা দাঁড়ানো ইমনের প্রতিবাদ পরবর্তী বছরের ছাত্র গণঅভ্যুত্থানের নৈতিক ভিত্তি গড়ে দিয়েছিল। যে কাঠামোগত নীরবতা ও প্রশ্রয়ের বিরুদ্ধে তিনি প্রথম শব্দ উচ্চারণ করেছিলেন, পরবর্তী প্রজন্মের শিক্ষার্থীরা সেই একই কাঠামোকে চ্যালেঞ্জ করতে রাস্তায় নেমে এসেছিল।",
  },

  belal: {
    eyebrow: "Humanity restored",
    title: "যখন সবাই নীরব ছিল",
    subtitle: "এক অচেনা মানুষের পাশে দাঁড়ানো — collapse থেকে rebuilding-এর সেতু।",
    name: "বেলাল হোসেন",
    role: "সাংবাদিক · যিনি শুনেছিলেন, যিনি থেকেছিলেন",
    quote: "আজ আমি আবার নিজের ওপর বিশ্বাস করি।",
    body:
      "প্রতিটি অন্ধকার ব্যবস্থার মধ্যেও কিছু মানুষ থাকে যারা নীরবে সত্যের পাশে দাঁড়ায়। বেলাল হোসেন সেইসব মানুষদের একজন — উদ্ধারকর্তা নন, নায়ক নন; একজন সাংবাদিক যিনি শুনেছিলেন, যিনি থেকেছিলেন, এবং যিনি সত্যকে পৃষ্ঠতলে আসতে সাহায্য করেছিলেন।",
    arc: [
      { phase: "নীরবতা", body: "ঘটনার পর সপ্তাহের পর সপ্তাহ একা থাকা।" },
      { phase: "ভয়", body: "প্রতিষ্ঠানিক চাপ, সামাজিক বিচ্ছিন্নতা।" },
      { phase: "একটি কথোপকথন", body: "বেলাল হোসেনের সাথে প্রথম সাক্ষাৎ — শোনা, প্রশ্ন, ধৈর্য।" },
      { phase: "প্রকাশ্যে সত্য", body: "প্রেস কনফারেন্স, যাচাইকৃত প্রতিবেদন, পাবলিক রেকর্ড।" },
      { phase: "পুনরুদ্ধার", body: "নিজের কণ্ঠস্বরকে আবার বিশ্বাস করা।" },
    ],
    whyMatters:
      "মানুষ resistance দেখে অনুপ্রাণিত হয়, কিন্তু মানবিকতা দেখে connected হয়। এই section কোনো political alliance নয় — এটা universal human solidarity।",
  },

  whyNow: {
    title: "এই গল্প এখন কেন গুরুত্বপূর্ণ",
    points: [
      "হুইসেলব্লোয়িং একা মানুষের কাজ — কিন্তু তার মূল্য একটি জাতি বহন করে।",
      "পারিবারিক মূল্যবোধ প্রতিষ্ঠানিক ব্যর্থতার শেষ প্রতিরোধ।",
      "ভয়ের সংস্কৃতি ভাঙতে দরকার প্রথম শব্দ — দ্বিতীয় শব্দটা সহজ হয়ে যায়।",
      "ভবিষ্যৎ প্রজন্মের জন্য সততার মানদণ্ড একটি জীবন্ত দলিল হিসেবে সংরক্ষণ করা।",
    ],
  },

  takeStand: {
    title: "এই অবস্থানকে এগিয়ে নিন",
    body: "গল্পটা ছড়িয়ে দিন, যাচাইকৃত প্রতিবেদনগুলো পড়ুন এবং সাহসী সাংবাদিকতাকে সমর্থন করুন। চুপ থাকা মানে অন্যায়ের সঙ্গে চুক্তি।",
  },
};

// ─── THE STAND — cinematic narrative system (added) ───
export type RefusalCard = { id: "money" | "fear" | "silence"; label: string; bn: string; en: string };
export type ReconstructionBeat = { stamp: string; title: string; body: string };
export type EthicalPrinciple = { num: string; title: string; body: string };
export type InfraPillar = { title: string; body: string };

export const STAND_OPENER = {
  bn: "মায়ের নিষেধ আছে।",
  en: "A statement that became larger than fear.",
  scrollCue: "Scroll into evidence",
};

export const STAND_REFUSALS: RefusalCard[] = [
  { id: "money",   label: "01 · Money",   bn: "চাঁদার ভাগ প্রত্যাখ্যান",        en: "He refused the share of extortion." },
  { id: "fear",    label: "02 · Fear",    bn: "পিস্তলের মুখেও নতি স্বীকার নয়", en: "He did not bow, even at gunpoint." },
  { id: "silence", label: "03 · Silence", bn: "ঘটনা চাপা দিতে অস্বীকৃতি",       en: "He refused to let the night be buried." },
];

export const STAND_LISTEN = {
  eyebrow: "Why people started listening",
  body:
    "তিনি কোনো রাজনৈতিক চরিত্র নন। তিনি একজন তরুণ — যিনি প্রযুক্তি, ব্র্যান্ড আর্কিটেকচার আর AI-যুগের নৈতিক প্রশ্ন নিয়ে কাজ করেন। তাঁর কণ্ঠ গুরুত্বপূর্ণ এই কারণে নয় যে তিনি আক্রমণের শিকার হয়েছিলেন — বরং এই কারণে যে আক্রান্ত হয়েও তিনি কাঠামোর সাথে আপস করেননি।",
};

export const STAND_RECONSTRUCTION = {
  eyebrow: "The Reconstruction",
  title: "Room 126 — মওলানা ভাসানী হল",
  subtitle: "১৩ আগস্ট ২০২৩ · একটি রাতের পুনর্গঠন",
  beats: [
    { stamp: "00:00",  title: "মধ্যরাতের ফোন",         body: "একটি ফোন কল। হল-সামনে আসতে বলা হয়। সরল বিশ্বাসে পৌঁছানো।" },
    { stamp: "00:07",  title: "দরজা বন্ধ হয়",          body: "মোটরসাইকেল বাইরে। ১২৬ নম্বর কক্ষে নিয়ে যাওয়া। তালার শব্দ।" },
    { stamp: "00:14",  title: "রড ও হাতুড়ি",            body: "চারজন প্রাপ্তবয়স্ক, একজন নিরস্ত্র শিক্ষার্থী। দীর্ঘ সময়, অনবরত আঘাত।" },
    { stamp: "00:42",  title: "পেটে পিস্তল",            body: "অবৈধ আগ্নেয়াস্ত্র। পেটে চাপ। কণ্ঠে কাঁপুনি, কিন্তু কথা স্পষ্ট — “পেটে নয়, মাথায় গুলি করুন।”" },
    { stamp: "01:05",  title: "জোরপূর্বক ভিডিও",        body: "মদ ঢালা শরীরে। ক্যামেরার সামনে স্বীকারোক্তি আদায়। চরিত্র হননের প্রস্তুতি।" },
    { stamp: "ভোর",     title: "নীরবতা",                 body: "প্রশাসন জানে। প্রক্টরিয়াল বডি জানে। তবু — কোনো রিপোর্ট নয়, কোনো বিবৃতি নয়।" },
    { stamp: "পরে",     title: "সিদ্ধান্ত",              body: "তিনি লিখিত ই-মেইল পাঠান উপাচার্য বরাবর। রেকর্ড তৈরি হয়। চুপ থাকা মানে অন্যায়ের সঙ্গে চুক্তি।" },
  ] satisfies ReconstructionBeat[],
};

export const STAND_ETHICS = {
  eyebrow: "Ethical Leadership Index",
  title: "Principles, not awards.",
  body: "এখানে কোনো ট্রফি নেই, কোনো শংসাপত্র নেই। শুধু অবস্থানের একটি সূচক — যেগুলো প্রমাণিত, যাচাইকৃত, এবং পাবলিক রেকর্ডে আছে।",
  items: [
    { num: "01", title: "Refused extortion money",       body: "চাঁদাবাজি কাঠামোর ভেতর থেকেও ভাগ নিতে অস্বীকৃতি — পারিবারিক মূল্যবোধই সর্বোচ্চ অগ্রাধিকার।" },
    { num: "02", title: "Public whistleblower",           body: "উপাচার্য বরাবর লিখিত অভিযোগ এবং জাতীয় গণমাধ্যমে প্রকাশ্য বিবৃতি।" },
    { num: "03", title: "Survived institutional pressure",body: "প্রতিষ্ঠানিক নীরবতা ও সামাজিক বিচ্ছিন্নতার মুখোমুখি দাঁড়িয়ে অবস্থান অটুট রাখা।" },
    { num: "04", title: "AI-era ethical thinker",         body: "ব্র্যান্ড আর্কিটেকচার, AI-যুগের নৈতিকতা, এবং ডিজিটাল পাবলিক সিস্টেম নিয়ে কাজ।" },
  ] satisfies EthicalPrinciple[],
};

export const STAND_INFRA = {
  eyebrow: "After The Stand",
  headline: "Resistance became infrastructure.",
  sub: "Some experiences do not destroy people. They redefine what they build next.",
  pillars: [
    { title: "AI Governance",          body: "অ্যালগরিদমিক স্বচ্ছতা ও দায়বদ্ধতা — মানুষের অধিকারকে কেন্দ্রে রেখে।" },
    { title: "Youth Empowerment",      body: "তরুণদের জন্য সিভিক, টেক এবং নৈতিক নেতৃত্বের কাঠামো।" },
    { title: "Digital Transparency",   body: "পাবলিক ডেটা, পাবলিক রেকর্ড — যাচাইযোগ্য সত্যের পরিকাঠামো।" },
    { title: "Education Reform",       body: "ক্যাম্পাস সুশাসন ও নিরাপদ শিক্ষা পরিবেশের জন্য কাঠামোগত প্রস্তাবনা।" },
    { title: "Smart Civic Systems",    body: "নাগরিক সেবা, অভিযোগ ও জবাবদিহিতার ডিজিটাল আর্কিটেকচার।" },
    { title: "TrendFlux Ecosystem",    body: "ব্র্যান্ড, কনটেন্ট, AI অটোমেশন ও CRM — নৈতিক ভিতের উপর নির্মিত গ্রোথ সিস্টেম।" },
  ] satisfies InfraPillar[],
};

export const STAND_DOCUMENTARY = {
  eyebrow: "Documentary",
  title: "The 126 Room",
  sub: "A cinematic reconstruction — coming soon.",
  // Set youtubeId once the documentary publishes to swap the placeholder for an embed.
  youtubeId: "" as string,
};

export const STAND_CLOSING = {
  line1: "কিছু মানুষ ক্ষমতা বেছে নেয়।",
  line2: "কিছু মানুষ বিবেক।",
  signature: "TrendFlux Ecosystem",
};

// ─── Editorially adapted English layer (not literal translation) ───
// Surfaces as the "EN" toggle on /the-stand. Tone: cinematic, museum-grade,
// documentary — never machine-translated, never marketing.

export const STAND_OPENER_EN = {
  eyebrow: "The Stand · A preserved moment of conscience",
  headline: "My mother forbade it.",
  body: "A single sentence that became larger than fear — and the night an institution tried to bury it.",
  scrollCue: "Scroll into evidence",
};

export const STAND_OPENER_BN = {
  eyebrow: "The Stand · বিবেকের একটি সংরক্ষিত মুহূর্ত",
  headline: STAND_OPENER.bn,
  body: "একটি বাক্য — যা ভয়ের চেয়ে বড় হয়ে উঠেছিল। আর সেই রাত — যেটি একটি প্রতিষ্ঠান চাপা দিতে চেয়েছিল।",
  scrollCue: "নিচে — প্রমাণের দিকে",
};

export const STAND_LISTEN_EN = {
  eyebrow: "Why this moment matters",
  body:
    "He is not a political figure. He is a young technologist working on brand architecture and the ethical questions of the AI era. His voice carries weight not because he was attacked — but because, after being attacked, he refused to make peace with the structure that allowed it.",
};

export const STAND_LISTEN_BN_TITLE = "কেন এই মুহূর্ত গুরুত্বপূর্ণ";

export const STAND_REFUSAL_INTRO = {
  bn: { eyebrow: "যা প্রত্যাখ্যান করা হয়েছিল", title: "তিনটি প্রত্যাখ্যান। একটি বিবেক।" },
  en: { eyebrow: "What was refused", title: "Three refusals. One conscience." },
};

export const STAND_RECONSTRUCTION_EN = {
  eyebrow: "The Reconstruction",
  title: "Room 126 — Maulana Bhasani Hall",
  subtitle: "13 August 2023 · the reconstruction of a single night",
  beats: [
    { title: "A midnight call", body: "A phone call. Summoned to the front of the hall. He arrived in good faith." },
    { title: "The door closes", body: "Motorcycle left outside. Walked into Room 126. The sound of the lock." },
    { title: "Iron rod & hammer", body: "Four adults, one unarmed student. Long duration. Continuous strikes." },
    { title: "A pistol to the stomach", body: "An illegal firearm pressed to his stomach. Voice trembling, words clear — \"Not the stomach. Shoot me in the head.\"" },
    { title: "A forced confession", body: "Alcohol poured on his body. A confession recorded for the camera. The infrastructure of character assassination." },
    { title: "Silence", body: "Administration knew. The proctorial body knew. No report. No statement." },
    { title: "A decision", body: "He wrote a formal email to the Vice-Chancellor. A record was made. Silence is a contract with injustice." },
  ],
};

export const STAND_PRINCIPLES_EN = {
  eyebrow: "Ethical Leadership Index",
  title: "Principles, not awards.",
  body: "No trophies. No certificates. An index of positions — verified, documented, on the public record.",
  items: [
    { num: "01", title: "Refused extortion money", body: "Inside a culture of extortion, he refused his share. Family values held the highest priority." },
    { num: "02", title: "Public whistleblower", body: "A written complaint to the Vice-Chancellor. A public statement in the national press." },
    { num: "03", title: "Survived institutional pressure", body: "Held his position against administrative silence and social isolation." },
    { num: "04", title: "An ethical voice for the AI era", body: "Working on brand architecture, the ethics of AI, and digital public systems." },
  ],
};

export const STAND_INFRA_EN = {
  eyebrow: "After The Stand",
  headline: "Resistance became infrastructure.",
  body:
    "Some experiences do not destroy a person. They redefine what that person builds next — AI governance, youth leadership, digital transparency, education reform, and civic systems.",
  link: "Enter the TrendFlux Ecosystem →",
};

export const STAND_INFRA_BN = {
  eyebrow: "প্রতিরোধের পরবর্তী অধ্যায়",
  headline: "প্রতিরোধই হয়ে উঠেছিল পরিকাঠামো।",
  body:
    "কিছু অভিজ্ঞতা মানুষকে ধ্বংস করে না — পরবর্তীতে সে কী গড়বে, তা পুনঃসংজ্ঞায়িত করে। AI গভর্নেন্স, তরুণ নেতৃত্ব, ডিজিটাল স্বচ্ছতা, শিক্ষা সংস্কার এবং সিভিক সিস্টেম।",
  link: "TrendFlux Ecosystem-এ প্রবেশ করুন →",
};

export const STAND_MEDIA = {
  bn: {
    eyebrow: "নথিভুক্ত দলিল",
    title: "ঘটনাগুলোর জনসম্মুখে প্রকাশিত রেকর্ড।",
    note: "জাতীয় গণমাধ্যমে স্বাধীনভাবে প্রকাশিত প্রতিবেদনের একটি সংরক্ষিত সংকলন — মতামত নয়, দলিল।",
    countSuffix: "টি দলিলভুক্ত প্রতিবেদন",
    read: "কভারেজ পড়ুন",
    timelineEyebrow: "কভারেজ ধারাবাহিকতা",
    searchPlaceholder: "সোর্স, শিরোনাম বা তারিখ দিয়ে খুঁজুন...",
    noResults: "কোনো ফলাফল পাওয়া যায়নি।",
    timeline: [
      { year: "২০২৩", label: "প্রাথমিক প্রতিবেদন" },
      { year: "২০২৪", label: "জাতীয় কভারেজ" },
      { year: "পরবর্তী", label: "জনপ্রতিক্রিয়া ও বিবৃতি" },
      { year: "চলমান", label: "আর্কাইভ ধারাবাহিকতা" },
    ],
  },
  en: {
    eyebrow: "Documented Public Record",
    title: "A preserved record of what was published.",
    note: "An archival index of independently published national reporting — documentation, not opinion.",
    countSuffix: "documented reports",
    read: "Read coverage",
    timelineEyebrow: "Coverage continuity",
    searchPlaceholder: "Search by source, headline or date...",
    noResults: "No results found.",
    timeline: [
      { year: "2023", label: "Initial reporting" },
      { year: "2024", label: "National coverage" },
      { year: "After", label: "Public reactions & statements" },
      { year: "Ongoing", label: "Archive continuity" },
    ],
  },
};

export const STAND_ARCHIVE_UTILS = {
  bn: {
    eyebrow: "আর্কাইভ সরঞ্জাম",
    body: "চাইলে এই বিবৃতিগুলো নিজস্ব শেয়ার-কার্ডে রূপ দিন।",
    primary: "উদ্ধৃতি জেনারেটর",
    secondary: "শেয়ার কার্ড / OG এক্সপোর্ট",
  },
  en: {
    eyebrow: "Archive utilities",
    body: "Optional. Turn any of these statements into a share card.",
    primary: "Quote generator",
    secondary: "Share card / OG export",
  },
};

export const STAND_DOCUMENTARY_EN = {
  eyebrow: "Documentary",
  title: "The 126 Room",
  sub: "A cinematic reconstruction — in production.",
};

export const STAND_DOCUMENTARY_BN = {
  eyebrow: "তথ্যচিত্র",
  title: "১২৬ নম্বর কক্ষ",
  sub: "একটি সিনেম্যাটিক পুনর্গঠন — নির্মাণাধীন।",
};

export const STAND_CLOSING_EN = {
  line1: "Some people choose power.",
  line2: "Others choose conscience.",
};


// ─── July 2024 — civic memory layer ───
// Treated as public memory, not political branding. Restrained, archival.
export type MemoryBeat = { stamp: string; title: string; body: string };

export const STAND_MEMORY_24_BN = {
  eyebrow: "জুলাই ২০২৪ · নাগরিক স্মৃতির স্তর",
  title: "একা একটি অবস্থান। পরে — একটি প্রজন্মের কণ্ঠস্বর।",
  intro:
    "২০২৪ সালের ঘটনাগুলো শুধু রাজনৈতিক মুহূর্ত নয় — এগুলো ছিল নাগরিক অবস্থান, ভয়, সাহস, এবং জনমতের ডিজিটাল দলিল। এই স্তরটি কোনো প্রচার নয়; এটি একটি স্মৃতি — সংরক্ষিত, যাচাইযোগ্য, এবং নীরব।",
  beats: [
    { stamp: "২০২৩", title: "প্রথম শব্দ", body: "একজন তরুণ, একটি কক্ষ, একটি প্রত্যাখ্যান। কোনো মিছিল নয়, কোনো ব্যানার নয় — শুধু একটি বাক্য যা চাপা পড়েনি।" },
    { stamp: "শীত · ২০২৩–২৪", title: "নীরবতা ভাঙে", body: "জাতীয় গণমাধ্যমে যাচাইকৃত প্রতিবেদন। ক্যাম্পাসের ভেতরের একটি কাঠামো প্রথমবার পাবলিক রেকর্ডে আসে।" },
    { stamp: "জুলাই · ২০২৪", title: "প্রজন্ম রাস্তায়", body: "যে নীরবতার বিরুদ্ধে একজন একা দাঁড়িয়েছিলেন, সেই একই কাঠামোর বিরুদ্ধে নেমে আসে হাজারো শিক্ষার্থী। প্রতিরোধ ব্যক্তি থেকে নাগরিক হয়ে ওঠে।" },
    { stamp: "আগস্ট · ২০২৪", title: "পরিবর্তনের একটি মুহূর্ত", body: "একটি কাঠামোগত মুহূর্ত — যেখানে ভয় ও আনুগত্যের সমীকরণ বদলে যায়। স্মৃতিতে সংরক্ষিত, ইতিহাসে অনিবার্য।" },
    { stamp: "পরে", title: "স্মৃতি, কাঠামো", body: "যা ঘটেছে তা পুনরাবৃত্তি রোধে দলিল হয়ে থাকে। এই আর্কাইভ সেই দলিলের একটি ছোট অধ্যায়।" },
  ] satisfies MemoryBeat[],
  closing:
    "এই স্তর কোনো ‘পক্ষ’ নয়। এটি একটি প্রজন্মের সম্মিলিত কণ্ঠস্বর — যা সংরক্ষণ না করলে হারিয়ে যায়।",
};

export const STAND_MEMORY_24_EN = {
  eyebrow: "July 2024 · A civic memory layer",
  title: "One stand alone. Then — the voice of a generation.",
  intro:
    "The events of 2024 were not only political moments. They were civic positions, fear, courage, and the digital record of public opinion. This layer is not advocacy; it is memory — preserved, verifiable, quiet.",
  beats: [
    { stamp: "2023", title: "The first word", body: "One young man, one room, one refusal. No procession, no banner — only a sentence that did not get buried." },
    { stamp: "Winter · 2023–24", title: "Silence begins to break", body: "Verified reports in the national press. An internal campus structure enters the public record for the first time." },
    { stamp: "July · 2024", title: "A generation in the streets", body: "The same structure that one person had stood against alone now drew out thousands of students. Resistance moved from the individual to the civic." },
    { stamp: "August · 2024", title: "A moment of inflection", body: "A structural moment — when the equations of fear and obedience shifted. Preserved in memory, inevitable in history." },
    { stamp: "Afterward", title: "Memory, structure", body: "What happened becomes a document against repetition. This archive is one small chapter of that document." },
  ] satisfies MemoryBeat[],
  closing:
    "This layer takes no side. It is the collective voice of a generation — which, if not preserved, is lost.",
};

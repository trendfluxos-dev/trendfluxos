// Bilingual source of truth for /quiet-positions.
// Tone rules enforced at write-time:
//   1. No names, no dates, no locations, no identifying detail.
//   2. Civic, reflective register — never romantic confession.
//   3. Reads as something a society would say about how it remembers people.

export type QuietFragment = {
  id: string;
  theme: string;        // english theme label
  bn: string;           // bangla reflection
  en: string;           // english reflection
};

export const fragments: QuietFragment[] = [
  {
    id: "f1",
    theme: "silent support",
    bn: "তারা পাশে ছিল, কিন্তু কখনো দাবি করেনি জায়গাটা তাদের।",
    en: "They stood near, but never claimed the ground as theirs.",
  },
  {
    id: "f2",
    theme: "misunderstood sincerity",
    bn: "যে যত্ন ব্যাখ্যা চায়নি, সেটাই অনেক সময় অপঠিত রয়ে গেছে।",
    en: "The care that asked for no explanation was the care most often misread.",
  },
  {
    id: "f3",
    theme: "one-sided care",
    bn: "কিছু মানুষ পুরো বছরটা ধরে রাখে — অন্য পাশে কেউ জানেই না।",
    en: "Some people carry the whole year quietly. The other side never knows.",
  },
  {
    id: "f4",
    theme: "emotional restraint",
    bn: "অনুভব করা আর উচ্চারণ করা — দুটো এক নয়।",
    en: "To feel a thing and to say a thing are not the same act.",
  },
  {
    id: "f5",
    theme: "dignity in distance",
    bn: "সম্মান কখনও কখনও দূরে সরে দাঁড়ানোর মধ্যেও থাকে।",
    en: "Respect can live, sometimes, in the choice to step back.",
  },
  {
    id: "f6",
    theme: "memory without bitterness",
    bn: "স্মৃতি একটা হিসাব নয়। সেটা একটা শ্রদ্ধাও হতে পারে।",
    en: "Memory is not a ledger. It can also be a form of respect.",
  },
];

export const principles: { n: string; en: string; bn: string }[] = [
  { n: "01", en: "Respect can live in stepping back.",       bn: "সম্মান দূরত্বের মধ্যেও বাঁচে।" },
  { n: "02", en: "Memory is not ownership.",                  bn: "স্মৃতি অধিকার নয়।" },
  { n: "03", en: "Restraint is also a form of presence.",     bn: "সংযম-ও এক ধরনের উপস্থিতি।" },
  { n: "04", en: "The quietest positions run deepest.",       bn: "সবচেয়ে নীরব অবস্থানগুলোই সবচেয়ে গভীর।" },
];

export const copy = {
  cover: {
    bn: "নীরব অবস্থান",
    en: "Quiet Positions",
    eyebrow: "AN EMOTIONAL ARCHIVE",
  },
  threshold: {
    bn: "সব অবস্থান উচ্চারণ করা হয় না।",
    en: "Not every position is spoken aloud.",
  },
  definition: [
    {
      bn: "একটি নীরব অবস্থান কোনো ঘোষণা নয়। এটি এমন এক ভঙ্গি যেখানে কেউ পাশে থাকে, কিন্তু নিজেকে দৃশ্যমান করে না; যত্ন করে, কিন্তু দাবি করে না।",
      en: "A quiet position is not a declaration. It is the posture of standing near without becoming visible, of caring without making a claim.",
    },
    {
      bn: "এটি প্রেমের গল্প নয়। এটি একটি সমাজ কীভাবে তার নীরব মানুষদের মনে রাখে — সেই প্রশ্নের একটি পাঠ।",
      en: "This is not a love story. It is a reading of how a society remembers the people who chose to stay quiet.",
    },
  ],
  texture: {
    bn: "উপাদানের স্মৃতি",
    en: "material memory",
  },
  civic: {
    bn: "এই অধ্যায়টি কোনো ব্যক্তিগত চিঠি নয়। এটি একটি নাগরিক স্মৃতিপত্র — যাতে মনে রাখা যায় যে কিছু মানুষকে দাবি না করেই শ্রদ্ধা করা যায়।",
    en: "This chapter is not a private letter. It is a civic note — a reminder that some people can be honored without being claimed.",
  },
  closing: {
    bn: "কিছু মানুষ স্মৃতিতে থেকে যায়, অধিকার হয়ে নয়।",
    en: "Some people remain in memory — never as a claim.",
  },
};

## লক্ষ্য
`src/pages/MediaReports.tsx`-এ প্রতিটি প্রাইমারি সোর্স সেকশন (০১–০৫) ভাঁজ-খোলা (collapsible) ফরম্যাটে রূপান্তর। ডিফল্ট অবস্থায় সব সেকশন **বন্ধ** — শুধু শিরোনাম + এক লাইন সারাংশ প্রিভিউ দেখা যাবে। ক্লিকে সেকশন খুলে পূর্ণ ফ্যাক্টস/বুলেট/কোট/কার্ড দৃশ্যমান হবে।

## পরিবর্তন

### ১. নতুন `CollapsibleSection` wrapper (একই ফাইলে)
- `useState` দিয়ে open/closed state।
- Header row: সেকশন নম্বর + outlet নাম + এক-লাইন সারাংশ (preview) + chevron আইকন।
- Closed state: শুধু header + এক লাইন গ্রে preview text।
- Open state: header + পুরো content (headline blockquote, bullets, legal note, source links)।
- Smooth height transition (Tailwind `transition-all`, subtle — workspace standard অনুযায়ী)।

### ২. `SourceCard` রিফ্যাক্টর
- নতুন optional prop: `summary: string` (এক লাইনের preview)।
- বাইরের `<section>` র‍্যাপারটি `CollapsibleSection` ব্যবহার করবে।
- পুরো article body (headline + bullets + legal + links) collapsible body-তে যাবে।

### ৩. সেকশন ০৫ (Jugantor allegation cards) collapsible-এ
- একই `CollapsibleSection` দিয়ে wrap।
- Summary: "যুগান্তর প্রতিবেদনের ৩টি স্বতন্ত্র অভিযোগ — কার্ড অনুযায়ী।"
- গ্রিড + কার্ডগুলো collapsible body-তে।

### ৪. প্রতিটি সেকশনের summary লাইন
- ০১ Jugantor: "প্রথম পাতার শিরোনাম — অস্ত্র ও মাদক ব্যবসা নিয়ন্ত্রণ সংক্রান্ত প্রতিবেদন।"
- ০২ NTV: "আওয়ামী লীগের তিন নেতা গ্রেপ্তার — গোয়েন্দা পুলিশের অভিযান।"
- ০৩ BD Pratidin: "আদালতের নির্দেশনায় ডিবির গ্রেপ্তার — হত্যা মামলায় এজাহার
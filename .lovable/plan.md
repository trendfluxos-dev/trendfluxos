## লক্ষ্য
Audit report-এর top offenders থেকে **brand-neutral, user-facing** ফাইলগুলোর হার্ডকোডেড রঙ (`bg-white`, `text-white`, `bg-black`, hex, rgba) design tokens-এ মাইগ্রেট। কোনো UI/behavior পরিবর্তন নয় — শুধু color source-of-truth ঠিক করা।

## Target ফাইল (এই sprint)
Highest-count এবং brand-neutral (sub-brand data-brand pages আলাদা রাখা হবে, কারণ সেগুলোর scoped tokens লাগে):

| # | File | Findings |
|---|------|----------|
| 1 | `src/components/Navbar.tsx` | 173 |
| 2 | `src/components/home/FounderSpotlightBanner.tsx` | 59 |
| 3 | `src/components/home/ArchitecturalHero.tsx` | 52 |
| 4 | `src/components/SelectedExecution.tsx` | 48 |
| 5 | `src/pages/Founder.tsx` | 25 |

মোট ~357 findings — লক্ষ্য এই ৫টি ফাইলে ~90%+ কমানো।

## Deferred (এই sprint-এ নয়)
- **Sub-brand pages** — `Marriage`, `LuxeVeil`, `BrandToki`, `JusticeAppeal`, `MediaReports`, `TheStandCoverSection` (per project memory এগুলো `[data-brand="..."]` scoped tokens ব্যবহার করে; আলাদা sprint দরকার)
- **Admin/internal** — `Dashboard`, `ShareKit`, `Auth` (user-facing polish return কম)
- **Ephemeral pages** — sub-brand dossiers, edtech admin

## মাইগ্রেশন rules
প্রতিটি hardcoded রঙের জন্য mapping:

| Hardcoded | Token |
|-----------|-------|
| `bg-white` | `bg-background` বা `bg-card` (context) |
| `text-white` on colored surface | `text-primary-foreground` / `text-background` |
| `bg-black` / `bg-black/60` overlay | `bg-foreground/60` |
| `text-black` | `text-foreground` |
| Neutral grays `#f5f5f5` `#111` etc. | Nearest `bg-muted`, `bg-card`, `text-muted-foreground` |
| Brand red `#B11226`, `#DC2626` etc. | `bg-primary` / `text-primary` (existing HSL token) |
| Gradient hex stops | `bg-[image:var(--gradient-*)]` অথবা existing token gradient |
| Rare one-off hex not covered by tokens | নতুন semantic token add করবো `src/index.css` global scope-এ, তারপর ব্যবহার |

শর্ত:
- inline `style={{ color: '#...' }}` → equivalent Tailwind token class-এ move; unavoidable হলে `style={{ color: 'hsl(var(--token))' }}`।
- rgba() overlays → `bg-foreground/X` opacity utility।
- কোনো contrast regression যেন না হয় — দৃশ্যত সমান দেখাবে (light/dark উভয়ে)।

## Verification
প্রতিটি ফাইলের পর:
1. `node scripts/audit-tokens.mjs` — এই ৫টি ফাইলের counts আগে/পরে।
2. `bunx vitest run src/test/theme-tokens.test.ts src/test/no-rogue-colors.test.ts src/test/contrast-audit.test.ts` — regression pass।
3. `bun run build` — zero warnings বজায়।
4. `/` route এবং `/founder` route-এ preview visually unchanged।

শেষে একটি before/after summary table দেব।

## Out of scope
- Sub-brand token migration
- নতুন design tokens বৃহৎ পরিমাণে (শুধু genuine gaps হলে)
- Layout / typography / spacing পরিবর্তন
- Component API পরিবর্তন

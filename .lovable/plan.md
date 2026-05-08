# Multi-Brand Social & Contact Integration

Build a centralized config + reusable components so every page automatically renders the correct social/contact channels for its brand (TrendFlux Digital, Zahid Hasan Emon, LUXE VEIL).

## 1. Centralized config

Create `src/config/socialConfig.ts` exporting:

- `BrandKey = "trendflux" | "zahid" | "luxeveil"`
- `BRAND_CONTACTS: Record<BrandKey, BrandContact>` with: `displayName`, `facebook`, `linkedin?`, `whatsapp?`, `telegram?` (`{ username, chatId, displayName, groupName?, groupId? }`), `email?`, and `priority: Channel[]` (e.g. `["whatsapp","linkedin","facebook","email"]` or `["telegram","facebook"]` for Luxe Veil).
- Helper `getBrandForRoute(pathname)` mapping:
  - `/luxe-veil`, `/admin/luxe-veil` → `luxeveil`
  - `/marriage`, `/project-lead`, `/brand-open`, `/trendflux-talent` → `trendflux`
  - everything else → `trendflux` (default)
  - (Optional explicit route for Zahid; expose `zahid` for use inside team/profile cards.)

Values come straight from the brief (FB/LI/WA/email URLs, Luxe Veil Telegram username `luxe_veil`, ID `8794625637`, group `LuxeVeil Lounge` ID `-5154627991`).

## 2. Reusable components

`src/components/social/SocialIcons.tsx`:
- `<SocialIcons brand?={BrandKey} variant="footer" | "floating" | "inline" size? />`
- Auto-resolves brand via `useLocation()` if not passed.
- Renders only channels present for that brand, in the brand's `priority` order.
- Lucide icons for FB/LinkedIn/Mail; inline SVG for WhatsApp + Telegram.
- `target="_blank" rel="noopener noreferrer"`, `aria-label`s, focus ring.
- Tailwind classes for premium hover: `hover:-translate-y-0.5 hover:shadow-[0_6px_22px_hsl(var(--gold)/0.35)] transition` with gold border on dark.

`src/components/social/PrimaryContactCTA.tsx`:
- Picks the brand's first available channel and renders a single hero/CTA button (e.g. "Talk on WhatsApp" / "Speak with Concierge on Telegram").
- Luxe Veil → always Telegram DM `https://t.me/luxe_veil`, label "Speak With Concierge".

`src/components/social/FloatingContact.tsx`:
- Fixed bottom-right pill that expands to show all channels for the active brand. Hidden on `/admin*`.

## 3. Luxe Veil post-action redirect

`src/lib/luxeveil.ts`:
- `LUXE_VEIL_GROUP_URL` (Telegram group invite — uses group name "LuxeVeil Lounge"; since only numeric ID is provided, link to `https://t.me/luxe_veil` as concierge fallback and surface group name in the success toast).
- `redirectToLuxeVeilGroup()` helper used after submit/booking/inquiry on Luxe Veil page.

Wire this into the existing Luxe Veil unlock/inquiry success handler in `src/pages/LuxeVeil.tsx` so successful submissions trigger the redirect (in a new tab) and a toast.

## 4. Wire-up across the app

- `src/components/Footer.tsx` — replace the placeholder `Linkedin/Twitter/Instagram/Mail` row with `<SocialIcons brand="trendflux" variant="footer" />`.
- `src/components/Navbar.tsx` — add compact `<SocialIcons variant="inline" size="sm" />` on desktop right side (auto brand by route).
- `src/components/BrandShell.tsx` (Luxe Veil & funnel pages) — add `<SocialIcons brand="luxeveil" variant="inline" />` in the header strip and a `PrimaryContactCTA` block above the funnel footer.
- `src/pages/Marriage.tsx` — append `<SocialIcons brand="trendflux" />` near existing reference cards (no WhatsApp/Facebook on individual reference cards — those stay as-is per prior memory).
- `src/pages/ProjectLead.tsx`, `BrandOpen.tsx`, `TrendfluxTalent.tsx` — drop in `<SocialIcons />` in the page footer area.
- `src/App.tsx` — mount `<FloatingContact />` inside `<BrowserRouter>` so it auto-detects route/brand.

## 5. Design tokens

Reuse existing `--gold`, `--background`, glass utilities. No new colors needed; ensure all classes use semantic tokens (`text-gold`, `border-gold/40`, `bg-background/40`). Add `animate-fade-in` on icon mount.

## 6. Out of scope

- No backend/DB/edge function changes.
- No new auth, no new routes.
- Existing Telegram submit edge function untouched.
- Reference cards on `/marriage` keep their current Call/Copy-only design.

## Technical notes

- All links open in new tab with `rel="noopener noreferrer"`.
- `getBrandForRoute` is pure; components call it via `useLocation().pathname` so SSR/lazy routes are fine.
- Telegram group ID `-5154627991` is stored in config for future deep-link use; UI link uses `https://t.me/luxe_veil` until an invite link is provided.
- Accessibility: every icon button has `aria-label`, 40px min touch target on mobile (`h-10 w-10`).

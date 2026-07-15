## লক্ষ্য
প্রোডাকশন বিল্ড (`bun run build`) চালিয়ে সমস্ত build-time warnings চিহ্নিত ও শূন্যে নামিয়ে আনা।

## ধাপ

1. **Baseline capture** — `bun run build` চালিয়ে পুরো output `/tmp/build.log`-এ সংরক্ষণ। Warnings/notices আলাদা করে তালিকা করি (Vite, Rollup, TypeScript, PostCSS/Tailwind, plugin warnings)।

2. **Categorize warnings** — সাধারণত যা আসতে পারে:
   - Chunk size > 500 kB (Rollup `chunkSizeWarningLimit`)
   - Dynamic + static import mixed for same module
   - `/* @vite-ignore */` / unresolved dynamic imports
   - Unused CSS/`@apply` unknown utility
   - Source map / eval warnings
   - Duplicate React / peer dep mismatch
   - Circular dependency notices

3. **Fix per category** (কোনো UI/behavior পরিবর্তন ছাড়া):
   - **Chunk size** → `vite.config.ts`-এ `build.rollupOptions.output.manualChunks` দিয়ে vendor split (react, radix, supabase, charts, motion), এবং প্রয়োজনে `chunkSizeWarningLimit` টিউন — তবে limit বাড়ানোর আগে splitting চেষ্টা।
   - **Mixed static+dynamic import** → হয় সব জায়গায় dynamic, নয়তো সব static (রুট lazy-load pattern অনুযায়ী সিদ্ধান্ত)।
   - **Unknown Tailwind class / @apply** → token/utility সঠিক নামে বদল।
   - **Circular deps** → import পুনর্বিন্যাস, barrel থেকে সরাসরি path-এ move।
   - **Duplicate deps** → `bun pm ls` দিয়ে দেখে দরকার হলে resolutions।

4. **Re-run & verify** — প্রতিটি ফিক্সের পর `bun run build` পুনরায়; log-এ "warning" / "⚠" grep করে শূন্য নিশ্চিত।

5. **Report** — চূড়ান্ত build output-এর summary (bundle sizes, chunk map, warning count = 0)।

## Out of scope
- Behavior/UI পরিবর্তন
- Dependency major upgrade
- Runtime perf tuning (শুধু build warnings)
- Lint/type-check warning (আলাদা কাজ — শুধু যদি build fail/warn করায়)

## Technical notes
- `vite.config.ts` অগ্রাধিকার; `tsconfig` পরিবর্তন এড়াবো।
- `manualChunks` conservative — শুধু বড় বা reusable vendor libs।
- কোনো warning suppress করবো না; মূল কারণ ফিক্স করবো। শুধু যদি upstream lib থেকে unavoidable notice আসে (e.g. sourcemap missing in external pkg), সেটা documented exception হিসেবে থাকবে।

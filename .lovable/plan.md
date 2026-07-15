## লক্ষ্য
Hardcoded রঙের regression রোধ করতে `scripts/audit-tokens.mjs` কে **fail-fast CI check** হিসেবে যুক্ত। বর্তমানে ৮০১ pre-existing findings আছে — তাই "any finding = fail" ভাঙা রাস্তা। **ratchet-baseline** পদ্ধতি: per-file baseline সংরক্ষিত থাকবে, কোনো file-এ count বাড়লে বা নতুন file যোগ হলে fail।

## পরিবর্তন

1. **`scripts/audit-tokens.mjs` upgrade**
   - নতুন CLI flags:
     - `--baseline` — বর্তমান findings-এর snapshot লিখবে `.audit-tokens-baseline.json`-এ (JSON: `{ [file]: count }`)।
     - `--check` — findings-কে baseline-এর সাথে তুলনা:
       - কোনো file-এ count > baseline → fail (regression)
       - baseline-এ নেই এমন file-এ finding > 0 → fail (new offender)
       - কোনো file-এর count কমেছে বা baseline-এ = 0 → OK
     - flag ছাড়া chalak → বর্তমান behavior (report-only, exit 0)
   - `--check` mode-এ exit code 1 on violations; clear diff output (file, old, new, delta)।
   - baseline update-এর guide message: "Run `npm run audit:tokens:baseline` after intentional cleanup"।

2. **`.audit-tokens-baseline.json` তৈরি**
   - প্রথম run-এর সময় বর্তমান state capture (৫৪টি file, ৮০১ findings)।
   - git-tracked, কারণ CI-তে দরকার।

3. **`package.json` scripts যোগ**
   ```json
   "audit:tokens": "node scripts/audit-tokens.mjs",
   "audit:tokens:check": "node scripts/audit-tokens.mjs --check",
   "audit:tokens:baseline": "node scripts/audit-tokens.mjs --baseline"
   ```

4. **`.github/workflows/audit-tokens.yml` নতুন workflow**
   - Trigger: `pull_request` (paths: `src/**/*.{ts,tsx,css}`, `tailwind.config.ts`, `scripts/audit-tokens.mjs`, `.audit-tokens-baseline.json`) + `push` to `main`
   - Steps: checkout → setup-node (v20) → `npm ci` (or bun) → `node scripts/audit-tokens.mjs --check`
   - Concise output; non-zero exit fails the check।

5. **`docs/DESIGN_SYSTEM.md` update**
   - Section যোগ: "Token audit — CI enforcement"
   - Baseline কীভাবে update হয়, PR-এ কী দেখতে পাবে, intentional additions-এর workflow।

## Verification
- Local: `npm run audit:tokens:baseline` → baseline file তৈরি → `npm run audit:tokens:check` → pass (0)।
- Simulate regression: ফাইলে ১টি `bg-white` যোগ → `--check` fail with clear diff → revert → pass।
- Simulate new file with findings → fail।
- Simulate improvement (finding কমানো) → pass (baseline unchanged but count < baseline, OK; new baseline লাগবে না — শুধু ratchet নিশ্চিত)।

## Technical notes
- Baseline format: pretty-printed JSON, key-sorted (deterministic diff)।
- Path-relative to repo root (POSIX separator) — Windows-safe।
- Existing report format অক্ষত (--check ছাড়া)।
- Bun ব্যবহার করে workflow-এ (project standard); node.js-ই enough কারণ script pure node।

## Out of scope
- 801 pre-existing findings কমানো (আলাদা sprint)
- Pre-commit hook (`.husky` নেই — যোগ করব না এখন)
- Delta ratchet auto-update (manual baseline update ইচ্ছাকৃত রাখা হচ্ছে)
- Per-hex allow-list (`no-rogue-colors.test.ts` ইতিমধ্যে করে)

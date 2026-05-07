## Goal
Type `window.dataLayer` globally so analytics code can use it without casts or `@ts-expect-error`.

## Changes

**1. `src/vite-env.d.ts`** — append a global declaration:

```ts
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
export {};
```

**2. Refactor existing call sites** to use `window.dataLayer` directly (remove the `(window as unknown as ...)` casts added previously):
- `src/components/ResumeButton.tsx` (around line 22)
- `src/components/SocialShare.tsx` (around line 21)
- `src/pages/Marriage.tsx` (around line 112)

Each becomes simply:
```ts
window.dataLayer = window.dataLayer || [];
window.dataLayer.push(payload);
```

No `@ts-expect-error` directives currently remain (they were already replaced), so this PR is purely a typing cleanup + cast removal. No runtime behavior changes.
## Problem

The published site `https://trendfluxdigital-bd.lovable.app` renders a blank white page. The publish settings are correct (public, published) — the issue is a runtime JavaScript error in the production bundle:

```
TypeError: Cannot read properties of undefined (reading 'forwardRef')
    at assets/radix-DphWDIxd.js
```

This means the Radix UI chunk is evaluating before the React chunk has finished initializing, so `React.forwardRef` is undefined when Radix tries to call it. The site never mounts.

## Root cause

`vite.config.ts` uses a custom `manualChunks` splitter that puts every `@radix-ui/*` package into its own `radix` chunk, separated from the `react` chunk. With ~30+ Radix packages all depending on `react`, this split creates a chunk-evaluation order problem at module init time and produces the undefined-React error in production.

The chunk split is an optimization, not a requirement. Letting Vite/Rollup auto-split vendors (or keeping React + Radix together) is safe and fixes the crash.

## Fix

Edit `vite.config.ts` to merge the `radix` chunk into the `react` chunk so React is guaranteed to be initialized before any Radix module evaluates. Keep the other splits (`recharts`, `icons`, `sentry`, `vendor`) — those don't depend on React's module-init order in the same way.

### Technical detail

In `manualChunks(id)`:
- Change `if (id.includes("@radix-ui/")) return "radix";` to return `"react"` instead (so Radix ships in the same chunk as React).
- Leave the rest unchanged.

This guarantees `React.forwardRef` is defined at the moment any Radix component module evaluates, eliminating the runtime crash.

## Verify

1. After the edit, publish the project.
2. Load `https://trendfluxdigital-bd.lovable.app` in the browser and confirm the homepage renders (no white screen, no `forwardRef` error in console).

## Out of scope

- No content, SEO, routing, or backend changes.
- No changes to publish visibility (already public) or custom domain setup.

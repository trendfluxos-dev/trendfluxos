## Goal
The error banner itself already has solid ARIA (`role="alert"`, `aria-live="assertive"`, auto-focus on Retry). Close the remaining gaps so screen-reader and keyboard users get clear, consistent send-failure feedback across both forms (`EntryPopup` and `ContactForm`).

## Gaps to fix in `src/pages/LuxeVeil.tsx`

1. **Inline validation errors aren't announced.** Lines 524 and 614 render `{err && <p>…</p>}` with no live region. `SrLive` exists but is unused.
2. **Submit button isn't linked to the error.** Screen readers should know which control the error refers to.
3. **Success state isn't announced** ("Message Sent" appears silently).
4. **Focus isn't returned after the banner is dismissed** (successful retry leaves focus nowhere predictable).
5. **`SrLive` re-announces only on text change** — when the same error happens twice in a row, it stays silent.

## Plan

### 1. Inline validation (`err`)
Replace the plain `<p>` in both forms with a `role="alert"` element (assertive, atomic). This is the standard pattern for form-level inline errors and re-announces on each new value.

```tsx
{err && (
  <p role="alert" aria-live="assertive" aria-atomic="true"
     className="text-[11px] text-red-300">
    {err}
  </p>
)}
```

### 2. Wire the banner to the submit button
- Give each `ErrorBanner` a stable `id` (e.g. `entry-send-error`, `contact-send-error`).
- Add `aria-describedby={sendErr ? "<id>" : undefined}` and `aria-invalid={!!sendErr}` to the submit `<button>` so AT users hear the error context when the button is focused.

### 3. Announce success
Add a polite live region to the "done" / "sent" UI:
```tsx
<p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  Your message was sent successfully.
</p>
```
Also auto-focus the visible "Send another" button (or the success heading via `tabIndex={-1}`) on mount so keyboard users land on the next action.

### 4. Focus return after recovery
In `ErrorBanner`, capture `document.activeElement` at mount. If the banner unmounts (error cleared) while focus is still inside it, return focus to the previously focused element if it's still in the DOM, otherwise fall back to the submit button via a new optional `returnFocusRef` prop passed by each form.

### 5. Make `SrLive` re-announce identical errors
Append an invisible counter/zero-width token tied to a render key so identical error strings still trigger announcement:
```tsx
<SrLive message={`${sendErr}`} key={errorNonce} />
```
Each call to `setSendErr` bumps `errorNonce` (a `useState<number>` incremented in `doSend`).

### 6. Minor polish
- Add `aria-busy={sending}` to the `<form>` element while a send is in flight.
- Ensure the banner has `tabIndex={-1}` (already present) and that the focus ring on the container is visible only via `:focus-visible`.

## Out of scope
- No visual redesign of the banner or forms.
- No changes to Telegram send logic, validation rules, or copy beyond the new SR-only success line.
- No theme/token changes.

## Files touched
- `src/pages/LuxeVeil.tsx` only.
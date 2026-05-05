## Fix Marriage page background

In `src/pages/Marriage.tsx`, add `backgroundAttachment: "fixed"` to the `<main>` element's inline style. This keeps the navy + gold radial gradient anchored to the viewport during scroll, so the dark `body` color never peeks through at the bottom.

Single-line change inside the existing style object — no other files touched.
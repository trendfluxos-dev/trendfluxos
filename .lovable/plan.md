## লক্ষ্য
`src/components/design-system/`-এর ৫টি wrapper কম্পোনেন্টের জন্য basic unit tests যোগ — কোনো নতুন test infra লাগবে না (vitest + RTL ইতিমধ্যে configured)।

## Test files (একটি করে, co-located)
`src/components/design-system/__tests__/`

1. **TfxButton.test.tsx**
   - default render — text visible, `<button>` element
   - variant prop → applies expected class token (e.g. `primary` → contains primary bg token class)
   - size prop → applies size class
   - `asChild` → renders as `<a>` when child is anchor
   - `disabled` → button disabled + aria
   - custom `className` merged (not overridden)

2. **TfxCard.test.tsx**
   - default render + children
   - variant prop → correct class
   - `as` polymorphism (if supported) OR renders `<div>` with role
   - custom className merged

3. **TfxSection.test.tsx**
   - renders `<section>` with children
   - `container` + `padding` + `background` variants apply classes
   - custom className merged

4. **TfxHeading.test.tsx**
   - default `<h2>`; `as="h1"` → renders `<h1>`
   - `level`/variant → typography class present
   - children rendered
   - custom className merged

5. **TfxProse.test.tsx**
   - `TfxProse` renders children with prose class
   - `TfxEyebrow` renders with eyebrow class + children
   - custom className merged

## Test strategy
- RTL `render` + `screen.getByRole`/`getByText` for structural assertions।
- Class assertions use `toHaveClass` on token/utility strings actually present in CVA definitions (test reads variant output, not brittle full class list) — check one distinctive class per variant।
- কোনো visual/snapshot নয় (আলাদা visual regression suite আছে)।
- Test file পড়ে actual API (props, elements) confirm করে assertion লিখব — assume নয়।

## Verification
`bun run test src/components/design-system` — সব pass, existing suite অক্ষত।

## Out of scope
- Storybook / visual regression
- Full CVA matrix (variant × size combinatorial)
- Integration tests with routing/theme provider
- Sub-brand token switching tests

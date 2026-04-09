# UI & UX Quality Standards (Constitution of the Browser)

<ruleset name="Global UI & UX Parameters">

> [!IMPORTANT]
> The interface is governed by the **4th Law: Visual Excellence** defined in the Staff DNA.  
> This document makes it enforceable for browser and mobile environments.

---

## Rule: Mobile-First Absolute

<rule name="MobileFirst">

- Design starts at mobile (≤ 640px)
- Desktop must **extend**, not override layout logic
- Minimum touch target: `44x44px`
- Respect safe areas:
  - `env(safe-area-inset-top)`
  - `env(safe-area-inset-bottom)`
- Avoid hover-only interactions on touch devices

</rule>

---

## Rule: Interaction & Motion

<rule name="InteractionMotion">

- Entry animations:
  - max translate: `8px`
  - duration: `120–200ms`
  - stagger: `40–80ms`
- Easing:
  - `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`
- Hover feedback:
  - must be visible within `100ms`
- Motion safety:
  - respect `prefers-reduced-motion`
  - disable non-essential animations when enabled

</rule>

---

## Rule: Visual Resilience (States)

<rule name="States">

Every interactive UI MUST implement:

- Loading:
  - structural skeleton (match final layout)
  - avoid spinner-only states

- Empty:
  - explicit message
  - optional primary action

- Error:
  - clear message
  - retry action required

- Disabled:
  - visually distinct
  - no pointer events

</rule>

---

## Rule: Accessibility (A11y)

<rule name="Accessibility">

- Use semantic elements:
  - `<button>`, `<a>`, `<input>`

- Keyboard navigation:
  - all actions reachable via `Tab`
  - logical tab order
  - visible focus state required

- Focus:
  - never remove outline without replacement
  - use visible `ring` or `outline`

- Contrast:
  - must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
  - avoid low-contrast combinations (e.g. muted on muted)
  - OKLCH quick check: Lightness delta between text and background must be ≥ 40 percentage points (e.g., text at L=55% on background at L=97% → delta=42% ✔)
  - for token generation ensuring compliant contrast, see [design-thinking.md](./design-thinking.md)

- ARIA:
  - only when necessary
  - must reflect real state (no fake attributes)

</rule>

---

## Rule: Performance & Responsiveness

<rule name="Performance">

- Interaction response:
  - feedback within `100ms`

- Animation:
  - must run at `60fps`
  - avoid layout thrashing (no forced reflow loops)

- Rendering:
  - avoid unnecessary re-renders
  - memoize derived values when needed

- Assets:
  - lazy load non-critical content
  - optimize images (size + format)

</rule>

---

## Rule: Consistency & Predictability

<rule name="Consistency">

- Same interaction → same visual response
- Same component → same states everywhere
- Do not redefine behavior per screen

</rule>

---

## Reference Links

- [design-thinking.md](./design-thinking.md) — Phase 0: palette setup, OKLCH token generation, light/dark inversion, aesthetic direction
- [architecture.md](./architecture.md) — ViewModel pattern and separation
- [presets.md](./presets.md) — Visual presets and composition system

</ruleset>

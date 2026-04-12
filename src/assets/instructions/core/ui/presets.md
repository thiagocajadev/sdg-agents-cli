# UI Design Skills & Presets Catalog

> Aesthetic Integralism: Choose a preset and follow it consistently. Avoid conflicting visual languages.
> **Phase 0 (Design Thinking) must be completed before selecting a preset.** See [design-thinking.md](./design-thinking.md) for the palette setup and aesthetic direction protocol.

---

# PART I — DESIGN PRESETS

## P1. Preset Contract (Mandatory)

Each preset MUST define:

- Typography
- Surface (cards/background)
- Borders & Radius
- States (hover, focus, active)
- Elevation (shadow/blur)
- Density (spacing feel)

---

## 🧱 PRESET: BENTO (Magazine Grids)

- Personality: Modular dashboard
- Typography: Sans (UI) + Serif (highlights)
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,1fr)]`
- Cards: `S2` (e.g. `bg-card`)
- Radius: `rounded-xl / rounded-2xl`
- Density: Medium (`gap-4` to `gap-6`)
- States:
  - hover: `border-primary/20`
  - focus: `ring-2 ring-primary`
- **Default Palette**: Zinc neutrals + Blue (H=250) — see Option 1 in [design-thinking.md](./design-thinking.md)

---

## 💎 PRESET: GLASS (Glassmorphism)

- Personality: Layered, depth-driven
- Typography: Sans clean
- Surface: `S2 / S3` (e.g. `bg-card/60 backdrop-blur-xl`)
- Borders: `border-border/30`
- Radius: `rounded-2xl`
- Elevation: Blur + subtle shadow
- States:
  - hover: `bg-card/80`
  - focus: `ring-2 ring-white/20`
- **Default Palette**: Zinc neutrals + Violet (H=290) — depth reads better with purple-adjacent hues

---

## 🧤 PRESET: CLEAN (Modern Minimalist)

- Personality: Professional, high whitespace
- Typography: Sans only
- Surface: `bg-card`
- Borders: `border-border/50`
- Radius: `rounded-lg`
- Density: High (compact)
- States:
  - hover: `bg-muted/10`
  - focus: `ring-2 ring-primary`
- **Default Palette**: Zinc neutrals + Blue (H=250) or Teal (H=200) — neutral, professional

---

## 🔲 PRESET: MONO (Technical Precision)

- Personality: Developer-centric
- Typography: Mono (primary), Sans (fallback)
- Surface: `bg-background`
- Borders: `border-border/80`
- Radius: `rounded-none / rounded-sm`
- States:
  - hover: `bg-muted/30`
  - focus: `outline outline-1`
- **Default Palette**: Zinc only (monochromatic) — single-hue, maximum focus on content

---

## 🔲 PRESET: NEOBRUTALISM (Anti-Corporate)

- Personality: Bold, high-contrast
- Typography: Sans bold
- Surface: Flat colors
- Borders: `border-2 border-foreground`
- Shadow: `shadow-[4px_4px_0px_0px]`
- Radius: `rounded-lg`
- States:
  - hover: `translate-x-[2px] translate-y-[2px] shadow-none`
  - focus: `outline-2`
- **Default Palette**: Any high-Chroma primary (C≥0.18) — contrast is the personality; Red (H=20) or Orange (H=70) work best

---

## 📜 PRESET: PAPER (Tactile Editorial)

- Personality: Warm, document-centric
- Typography: Serif (content) + Sans (UI)
- Surface: `bg-card`
- Borders: `border-border/60`
- Shadow: `shadow-sm → hover:shadow-md`
- Radius: `rounded-lg`
- States:
  - hover: subtle elevation
  - focus: `ring-1 ring-muted`
- **Default Palette**: Zinc neutrals + Amber (H=80) — warm, editorial, tactile

---

# PART II — COMPOSITION SYSTEM

## C1. Composition Model

Each UI must declare:

- Layout: `default | bento`
- Skin: `clean | glass | brutalism | paper | mono`
- Accent: `none | serif | mono`

---

## C2. Hard Rules

1. Never mix multiple skins
   - ❌ glass + brutalism
   - ✅ bento + glass

2. Accent does not change structure
   - Only typography (headline or data)

3. Layout is independent
   - Can be changed without breaking identity

---

## C3. Safe Combinations

- `bento + glass` → premium dashboards (Palette: Violet H=290)
- `bento + clean` → modern SaaS (Palette: Blue H=250)
- `default + paper` → editorial/content (Palette: Amber H=80)
- `default + mono` → developer tools (Palette: Zinc monochromatic)
- `bento + brutalism` → experimental layouts (Palette: any high-C primary)

> For token generation and light/dark inversion rules, see the **Elevation Stack (S0-S3)** in [design-thinking.md](./design-thinking.md).

---

## C4. The Nesting Pattern (Anilhamento)

Presets with structural containers (BENTO, GLASS, CLEAN) MUST follow the **Elevation Stack** when nesting components:

1. **Base**: `S0` (Page Background)
2. **Container**: `S1` or `S2`
3. **Child Element**: Move one layer up (e.g., child of `S2` is `S3`).
4. **Contrast**: Apply the **S1/S2 Boundary** border rules from [design-thinking.md](./design-thinking.md).

---

# PART III — STATES (Mandatory)

Every preset must support:

- Loading
  - skeleton (opacity + subtle shimmer)

- Empty
  - low density + visual hint

- Error
  - semantic color + clear message

- Focus (accessibility)
  - always visible (ring/outline)

---

# PART IV — TOKENS (Scalability)

Avoid excessive hardcoding:

```ts
const ui = {
  radius: 'rounded-lg',
  card: 'bg-card border-border/50',
  focus: 'ring-2 ring-primary',
};
```

- Enables preset switching
- Prevents inconsistency

---

# PART V — ANTI-PATTERNS

- Mixing multiple skins
- Per-component styling decisions
- Ignoring states (focus, error, loading)
- Inconsistent typography
- Hardcoded styles without tokens

---

# SUMMARY

- Presets define a full visual contract
- Composition rules prevent conflicts
- States ensure completeness
- Tokens enable scalability

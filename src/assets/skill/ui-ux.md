# UI/UX — Design Thinking, Architecture, Presets & Writing Soul

<ruleset name="UI/UX">

> [!NOTE]
> Unified UI/UX skill: Phase 0 design contract, component architecture, preset catalog, quality standards, and writing voice.
> Load in **Phase CODE** when building UI surfaces, choosing design presets, writing UI copy, or producing perennial artifacts (README, docs, changelogs).

---

## Part 1 — Design Thinking (Phase 0, Mandatory)

> [!IMPORTANT]
> **Phase 0 is not optional.** An agent that skips Design Thinking will produce technically correct but aesthetically incoherent UI. The phases below are a decision protocol, not a creativity exercise.

### Phase 0.1 — Palette Setup (First-Time Rule)

<rule name="PaletteSetup">

**On the first UI task in a project** (no `--color-primary-*` tokens found in `globals.css` or equivalent), the agent MUST pause and offer the following choice to the developer:

```
🎨 Palette Setup Required

No color palette found. Choose one:

  [1] Use Default Palette (recommended)
      → Zinc neutrals + Blue primary (industry standard)
      → Compatible with shadcn/ui out of the box
      → Just confirm and proceed

  [2] Custom Palette
      → I'll guide you through choosing Primary and Secondary Hues
      → Uses OKLCH for perceptual consistency

Which do you prefer? (1 or 2)
```

> If no response or ambiguous → **default to [1]**. Never block work on color indecision.

#### Option 1 — Default Palette (Zinc + Blue)

The canonical default. Matches shadcn/ui's built-in token model. Use without modification:

```css
@import 'tailwindcss';

@theme {
  /* Primary — Blue (H=250) */
  --color-primary-50: oklch(97% 0.02 250);
  --color-primary-100: oklch(93% 0.05 250);
  --color-primary-200: oklch(87% 0.08 250);
  --color-primary-300: oklch(79% 0.11 250);
  --color-primary-400: oklch(68% 0.13 250);
  --color-primary-500: oklch(58% 0.15 250); /* ← action: buttons, links, highlights */
  --color-primary-600: oklch(48% 0.14 250); /* ← light hover */
  --color-primary-700: oklch(38% 0.12 250);
  --color-primary-800: oklch(29% 0.09 250);
  --color-primary-900: oklch(21% 0.06 250);

  /* Secondary — Violet (H=290) — accent only */
  --color-secondary-500: oklch(60% 0.18 290);
  --color-secondary-400: oklch(70% 0.18 290); /* ← dark hover */
  --color-secondary-600: oklch(50% 0.16 290); /* ← light hover */
}
```

> Shadcn tokens (`--background`, `--foreground`, `--card`, `--muted`, etc.) remain untouched.
> `--color-primary-*` is a brand extension layer, not a replacement.

#### Option 2 — Custom Palette (OKLCH Guided)

The agent MUST ask exactly two questions:

```
1. Primary color? Choose a Hue (H value) or a color name:
   Red=20  Orange=70  Yellow=95  Green=180  Teal=200  Blue=250  Violet=290  Pink=320

2. Secondary/accent color? (press Enter to use the recommended Split-Complementary,
   or choose a Hue manually — must differ from primary by ≥ 60 Hue units)
```

##### Color Harmony — Picking the Secondary Hue

Use the Color Wheel relationships below. **Default: Split-Complementary** — clear contrast without visual tension.

| Relationship               | Formula         | Result                        | UI Guidance                                                                                |
| :------------------------- | :-------------- | :---------------------------- | :----------------------------------------------------------------------------------------- |
| **Split-Complementary** ✅ | Primary H ± 150 | Contrast without tension      | **Default choice.** Works in all presets.                                                  |
| **Complementary**          | Primary H + 180 | Maximum contrast, high energy | Use **only** as accent at 10%. Never as secondary background.                              |
| **Analogous**              | Primary H ± 30  | Harmonious, very cohesive     | Avoid for primary/secondary pair — colors look too similar; reserve for gradient layering. |
| **Triadic**                | Primary H + 120 | Vibrant, multi-color          | ❌ Avoid in UI — 3 competing hues require a strong design hand. Agent should not use this. |

> **Decision rule:** If the developer did not specify a secondary hue → compute `Primary H + 150`, round to the nearest reference Hue in the table below, and proceed without prompting again.

###### Reference Hues (rounded to nearest named color)

| Primary (H)  | Split-Complementary (H+150) | Nearest named color |
| :----------: | :-------------------------: | :------------------ |
|   20 (Red)   |             170             | Teal-Green          |
| 70 (Orange)  |             220             | Sky Blue            |
| 95 (Yellow)  |             245             | Blue                |
| 180 (Green)  |             330             | Pink                |
|  200 (Teal)  |             350             | Rose                |
|  250 (Blue)  |             40              | Yellow-Orange       |
| 290 (Violet) |             80              | Amber               |
|  320 (Pink)  |             110             | Lime                |

##### Harmony Anti-Patterns (Self-Check)

- Secondary Hue within 30H of primary → **too analogous** → colors look like the same color at different brightness → increase distance
- Secondary used as background color → **complementary tension at scale** → reduce to badge/notification use only (10%)
- Three or more distinct hues visible on the same surface → **triadic chaos** → eliminate the weakest one

Then generate the full scale using the **OKLCH Progression Formula**:

| Step | L (Lightness) | C (Chroma) | Notes                               |
| ---: | :------------ | :--------- | :---------------------------------- |
|   50 | `98%`         | `0.01`     | Near-white background tint          |
|  100 | `96%`         | `0.03`     | Very light surface tint             |
|  200 | `90%`         | `0.06`     | Light border / subtle dividers      |
|  300 | `82%`         | `0.09`     | Soft accent                         |
|  400 | `72%`         | `0.12`     | Light mode hover state              |
|  500 | `60%`         | `0.15`     | **Primary action** (buttons, links) |
|  600 | `50%`         | `0.14`     | Light mode hover on primary-500     |
|  700 | `40%`         | `0.12`     | Strong accent                       |
|  800 | `25%`         | `0.09`     | Dark surface tint                   |
|  900 | `15%`         | `0.05`     | Near-black background tint          |

> **Vibe Control**: For a **Vibrant** look, keep Chroma (C) at `0.15` for steps 400-600. For a **Muted** look, reduce C to `0.08` across the entire scale. Default to **Muted** for Premium SaaS.

</rule>

### Phase 0.2 — The Elevation Stack (Deep Theme Balance)

<rule name="ElevationStack">

> [!IMPORTANT]
> **Avoid "Floating Darkness".** Dark mode surface logic must reflect physical elevation: as an object gets closer to the light source (user), it gets **lighter**, not darker.

#### Surface Mapping

| Layer          | Role               | Light Mode (Zinc)     | Dark Mode (Zinc) |
| :------------- | :----------------- | :-------------------- | :--------------- |
| **S0** (Base)  | Page Background    | `50` or `White`       | `950` or `Black` |
| **S1** (Inner) | Sidebars, Sections | `100`                 | `900`            |
| **S2** (Card)  | Floating Elements  | `White` + Shadow      | `800`            |
| **S3** (Pop)   | Modals, Tooltips   | `White` + Deep Shadow | `700`            |

#### The Hover Law (Inversion)

| Context    | Base | Action | Direction  | Value Delta |
| :--------- | :--- | :----- | :--------- | :---------- |
| Light mode | `S2` | `S1`   | Go Darker  | L-5%        |
| Dark mode  | `S2` | `S3`   | Go Lighter | L+10%       |

```html
<!-- Correct — Dark mode "elevates" on hover by getting lighter -->
<div class="bg-zinc-800 hover:bg-zinc-700 transition-colors">Card</div>
```

</rule>

### Phase 0.3 — Color Distribution (60-30-10 Rule)

<rule name="ColorDistribution">

Every UI surface must follow the **60-30-10 distribution**. Violations cause visual noise.

| Proportion | Role                                 | Tailwind tokens                                        |
| :--------- | :----------------------------------- | :----------------------------------------------------- |
| **60%**    | Neutral (backgrounds, text, borders) | `zinc-*`, shadcn `bg-background`, `bg-muted`           |
| **30%**    | Primary (structural emphasis)        | `primary-500` on interactive elements, section accents |
| **10%**    | Secondary/Accent (highlights only)   | `secondary-500`, badges, notifications                 |

Violations to catch at Self-Check:

- Secondary color used on more than 10% of the surface → reduce
- Primary color used on backgrounds (not just interactive elements) → replace with neutral
- No secondary visible at all → add a subtle accent point

</rule>

### Phase 0.4 — Aesthetic Direction (Tone + Preset)

<rule name="AestheticDirection">

Before choosing a preset (see Part 3), define the **tone** in one sentence:

> _"This interface is [adjective] for [audience] who need [outcome]."_

Examples:

- "This interface is precise and minimal for developers who need fast data access." → `MONO` or `CLEAN`
- "This interface is layered and premium for teams who need a polished dashboard." → `GLASS` or `BENTO + GLASS`
- "This interface is warm and editorial for readers who need focused content." → `PAPER`
- "This interface is bold and expressive for users who need to take action fast." → `NEOBRUTALISM`

Then commit to **one preset** and do not mix skins. See valid combinations in Part 3.

#### Differentiator (What makes it memorable)

Name one thing the user will remember after closing the tab:

- A distinctive typographic pairing (display + body)
- An unexpected layout break (grid-breaking element, asymmetry)
- A specific micro-interaction (hover reveal, stagger entry)
- A color moment (single high-chroma accent on monochrome surface)

This decision constrains the implementation — it is not a stretch goal.

</rule>

### Phase 0.5 — Typography Commitment

<rule name="TypographyCommitment">

#### The 2-Font Rule

Every interface uses **exactly 2 font families** — one Display, one Body. No exceptions within a project.

| Role        | Used for                                      | Size range |
| :---------- | :-------------------------------------------- | :--------- |
| **Display** | Headings (`h1`–`h3`), hero text, large labels | ≥ 20px     |
| **Body**    | Paragraphs, UI labels, captions, metadata     | ≤ 16px     |

> **Exception — Code blocks only:** A third font (`JetBrains Mono` or `Fira Code`) is permitted exclusively inside `<code>` and `<pre>` elements. It does not count as a visual family because it never competes with Display or Body in layout flow.

> Fonts below are all available on **Google Fonts** unless noted. Prefer Google Fonts for zero-config reliability. Never use `Arial`, `Roboto`, or `system-ui` as a Display font — they carry no personality.

#### Pairing Table

| Tone                | Display font          | Body font | Preset fit          | Why this works                                                                                                                                              |
| :------------------ | :-------------------- | :-------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Precision/Dev**   | `JetBrains Mono`      | `Inter`   | MONO, CLEAN         | Mono as display creates "terminal" authority. Inter is invisible at body size — intentionally neutral.                                                      |
| **Premium/SaaS**    | `Bricolage Grotesque` | `Inter`   | GLASS, BENTO        | Variable-width, Modern, distinctive without being quirky. Strong contrast against Inter body.                                                               |
| **Editorial**       | `Playfair Display`    | `Lora`    | PAPER               | Classic high-contrast serif pair. Playfair carries editorial gravity; Lora stays legible at body density.                                                   |
| **Bold/Expressive** | `Syne`                | `DM Sans` | NEOBRUTALISM, BENTO | Syne is geometric and idiosyncratic — feels designed. DM Sans provides clean contrast without competing.                                                    |
| **Corporate**       | `Plus Jakarta Sans`   | `Inter`   | CLEAN, BENTO        | Jakarta has personality at h1 sizes; Inter disappears into the grid at body — correct hierarchy.                                                            |
| **Startup/Modern**  | `Outfit`              | `Geist`   | BENTO, CLEAN        | Outfit is geometric and friendly. Geist is the font of the Next.js/Vercel ecosystem — instantly modern. `Geist` via `next/font/google` in Next.js projects. |
| **Luxury/Refined**  | `Cormorant Garamond`  | `Jost`    | GLASS, PAPER        | Cormorant is ultra-refined at large sizes — zero horizontal weight. Jost is geometric and neutral enough to disappear as body text.                         |

#### How to apply in Tailwind

```css
/* globals.css — import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&family=Inter:wght@400;500&display=swap');

@theme {
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

```html
<!-- Display: headings only -->
<h1 class="font-display text-3xl font-semibold">Título</h1>

<!-- Body: all UI text -->
<p class="font-body text-sm text-muted-foreground">Descrição</p>

<!-- Code exception: third font, scoped to code blocks only -->
<code class="font-mono text-sm">console.log()</code>
```

#### Typography Anti-Patterns

- Two serif fonts together (e.g., `Playfair` + `Source Serif`) → density at body scale → **replace body with a sans**
- Two humanist sans at similar weights (e.g., `Jakarta` + `DM Sans`) → no hierarchy → **increase weight contrast or swap one**
- Display font at body size (< 16px) → breaks readability → **Display is h1–h3 only**
- More than 2 families in layout flow → visual noise → **remove the third; code blocks are the only exception**
- `Cal Sans` — not on Google Fonts, requires manual hosting → **use `Bricolage Grotesque` instead**

</rule>

### Phase 0.6 — Component Nesting (Concentricity)

<rule name="Nesting">

Nested elements (cards inside sections, inputs inside cards) must maintain visual logic.

#### 1. The Concentric Radius Rule

Outer container and inner child must share a common center.
`Inner Radius = Outer Radius - Padding`.

- Outer: `rounded-2xl` (16px) | Padding: `p-4` (16px) → Inner: `rounded-none` (0px)
- Outer: `rounded-2xl` (16px) | Padding: `p-2` (8px) → Inner: `rounded-lg` (8px)

#### 2. Border Hierarchy

To prevent "Wireframe Look", adjust border visibility based on depth.

- **S1/S2 Boundary**: `border-border/40` (subtle)
- **S2/Action Boundary**: `border-primary/20` (contextual)

</rule>

### Agent Self-Declaration (Required Output)

Before writing any UI code, the agent MUST declare:

```
🎨 Design Contract
─────────────────────────────────
Palette:      [Default Zinc+Blue | Custom H=___ + H=___]
Preset:       [BENTO | GLASS | CLEAN | MONO | NEOBRUTALISM | PAPER]
Tone:         "[adjective] for [audience] who need [outcome]"
Differentiator: [the one memorable element]
Typography:   [Display font] + [Body font]
─────────────────────────────────
Proceeding to Phase 1: Wireframe
```

> [!WARNING]
> If the agent cannot fill the Palette and Preset fields, it MUST ask before generating any code. Proceeding without the contract is a violation.

---

## Part 2 — Component Architecture (ViewModel DNA)

> Aesthetic base: Bento Grid + Glassmorphism + Precision.
> Styling: Utility-First CSS (Tailwind v4) + shadcn/ui.
> Role: Create predictable, scalable, and clean UI systems.

### The ViewModel Law

<rule name="ViewModelLaw">

1. Keep components **declarative** (render only).
2. Move UI state, mapping, and conditional logic to a ViewModel (hook).
3. Pure transformations MUST live outside components.
4. Business/domain logic MUST NOT live in the ViewModel.
5. Exception: trivial components (< ~10 lines, no logic) do not need ViewModel.

#### Pattern: ViewModel & Orchestration

```tsx
type Props = {
  user: User;
  isHighlighted?: boolean;
  isLoading?: boolean;
  error?: string | null;
};

export function UserCard(props: Props) {
  const vm = useUserCardVM(props);

  if (vm.isLoading) return <Skeleton />;
  if (vm.error) return <ErrorState message={vm.error} />;
  if (vm.isEmpty) return <EmptyState />;

  return (
    <Card className={vm.cardStyles}>
      <Avatar src={vm.avatarUrl} border={vm.statusColor} />
      <Title>{vm.title}</Title>
      <Timestamp>{vm.formattedDate}</Timestamp>
    </Card>
  );
}

function useUserCardVM({ user, isHighlighted, isLoading, error }: Props) {
  // UI STATE
  const isEmpty = !user;

  // DERIVED STATE
  const statusColor = user?.isActive ? 'border-chart-1' : 'border-muted';

  // TRANSFORMATIONS (pure)
  const formattedDate = user ? formatDate(user.createdAt) : null;

  return {
    isLoading,
    error,
    isEmpty,
    title: user?.name ?? '',
    avatarUrl: user ? resolveAvatar(user) : '',
    statusColor,
    formattedDate,
    cardStyles: cn('group transition-all', isHighlighted && 'ring-2'),
  };
}
```

#### Logic Separation (Critical)

- **ViewModel**
  - UI state (loading, empty, error)
  - derived state (isActive → color)
  - mapping (API → UI)

- **Domain (services)**
  - business rules
  - validations
  - calculations

- **Utils**
  - formatting (date, currency, string)

#### File & Export Convention

- Prefer **named exports**
- Step-down order:
  1. Main component
  2. ViewModel (hook)
  3. Private helpers

#### Anti-Patterns (Avoid)

- API calls inside components
- ViewModel as dumping ground
- Passing raw backend data directly to UI
- Inline ternaries with business meaning
- Styling logic scattered across JSX

#### Heuristic (Use or Not)

**Use ViewModel if:**

- There is conditional UI
- There is transformation
- There is reuse potential

**Avoid if:**

- Component is trivial
- Only displays props

</rule>

### State Management Strategy

<rule name="StateManagement">

Choose the right mechanism for the right scope. Never over-engineer state.

| State type           | Mechanism               | When to use                                                                             |
| :------------------- | :---------------------- | :-------------------------------------------------------------------------------------- |
| UI-only, isolated    | `useState` / hook local | Modals, toggles, form dirty state, accordion — not shared outside the component         |
| Shared UI state      | React Context           | Cross-component UI state with no business logic (e.g., theme, sidebar open)             |
| Server / remote data | React Query or SWR      | All data fetched from an API — handles caching, revalidation, loading, and error states |
| Global app state     | Zustand                 | App-wide state with frequent writes; avoid Redux unless the project already uses it     |

#### Rules

- **Never call APIs directly in components.** Always use a hook or React Query — components are consumers, not fetchers.
- **Avoid Context for server data.** React Query/SWR is the correct tool; Context causes stale data and manual invalidation.
- **Avoid Zustand for server data.** Use it only for client-side global state (e.g., authenticated user session, UI preferences).
- **Prop drilling up to 2 levels is acceptable.** Reach for Context or Zustand only when drilling exceeds 2 levels or the state is shared across unrelated subtrees.

</rule>

### Spacing System (L1–L4)

<rule name="SpacingHierarchy">

| Level | Category | Example     | Usage                        |
| ----: | -------- | ----------- | ---------------------------- |
|    L1 | Internal | p-1, gap-2  | Button padding, icon spacing |
|    L2 | Siblings | p-4, gap-4  | Elements inside cards        |
|    L3 | Sections | p-8, gap-12 | Blocks, grid spacing         |
|    L4 | Page     | py-24, px-6 | Page breathing space         |

</rule>

### Architecture Checklist

#### Code Integrity

- [ ] Component is declarative (no heavy logic in JSX)
- [ ] ViewModel encapsulates UI logic and mapping
- [ ] No business logic in ViewModel
- [ ] Named exports used
- [ ] Helpers are below main component

#### Visual Integrity

- [ ] Spacing follows L1–L4 hierarchy
- [ ] Mobile-first respected
- [ ] Loading / Empty / Error states handled

---

## Part 3 — Presets & Composition

> Aesthetic Integralism: Choose a preset and follow it consistently. Avoid conflicting visual languages.
> **Phase 0 (Part 1) must be completed before selecting a preset.**

### Preset Contract (Mandatory)

Each preset MUST define: Typography, Surface (cards/background), Borders & Radius, States (hover/focus/active), Elevation (shadow/blur), Density (spacing feel).

### 🧱 PRESET: BENTO (Magazine Grids)

- Personality: Modular dashboard
- Typography: Sans (UI) + Serif (highlights)
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,1fr)]`
- Cards: `S2` (e.g. `bg-card`)
- Radius: `rounded-xl / rounded-2xl`
- Density: Medium (`gap-4` to `gap-6`)
- States: hover `border-primary/20` · focus `ring-2 ring-primary`
- **Default Palette**: Zinc neutrals + Blue (H=250) — see Option 1 in Part 1

### 💎 PRESET: GLASS (Glassmorphism)

- Personality: Layered, depth-driven
- Typography: Sans clean
- Surface: `S2 / S3` (e.g. `bg-card/60 backdrop-blur-xl`)
- Borders: `border-border/30`
- Radius: `rounded-2xl`
- Elevation: Blur + subtle shadow
- States: hover `bg-card/80` · focus `ring-2 ring-white/20`
- **Default Palette**: Zinc neutrals + Violet (H=290) — depth reads better with purple-adjacent hues

### 🧤 PRESET: CLEAN (Modern Minimalist)

- Personality: Professional, high whitespace
- Typography: Sans only
- Surface: `bg-card`
- Borders: `border-border/50`
- Radius: `rounded-lg`
- Density: High (compact)
- States: hover `bg-muted/10` · focus `ring-2 ring-primary`
- **Default Palette**: Zinc neutrals + Blue (H=250) or Teal (H=200) — neutral, professional

### 🔲 PRESET: MONO (Technical Precision)

- Personality: Developer-centric
- Typography: Mono (primary), Sans (fallback)
- Surface: `bg-background`
- Borders: `border-border/80`
- Radius: `rounded-none / rounded-sm`
- States: hover `bg-muted/30` · focus `outline outline-1`
- **Default Palette**: Zinc only (monochromatic) — single-hue, maximum focus on content

### 🔲 PRESET: NEOBRUTALISM (Anti-Corporate)

- Personality: Bold, high-contrast
- Typography: Sans bold
- Surface: Flat colors
- Borders: `border-2 border-foreground`
- Shadow: `shadow-[4px_4px_0px_0px]`
- Radius: `rounded-lg`
- States: hover `translate-x-[2px] translate-y-[2px] shadow-none` · focus `outline-2`
- **Default Palette**: Any high-Chroma primary (C≥0.18) — contrast is the personality; Red (H=20) or Orange (H=70) work best

### 📜 PRESET: PAPER (Tactile Editorial)

- Personality: Warm, document-centric
- Typography: Serif (content) + Sans (UI)
- Surface: `bg-card`
- Borders: `border-border/60`
- Shadow: `shadow-sm → hover:shadow-md`
- Radius: `rounded-lg`
- States: hover subtle elevation · focus `ring-1 ring-muted`
- **Default Palette**: Zinc neutrals + Amber (H=80) — warm, editorial, tactile

### Composition Model

<rule name="CompositionModel">

Each UI must declare:

- Layout: `default | bento`
- Skin: `clean | glass | brutalism | paper | mono`
- Accent: `none | serif | mono`

#### Hard Rules

1. Never mix multiple skins
   - ❌ glass + brutalism
   - ✅ bento + glass
2. Accent does not change structure — only typography (headline or data)
3. Layout is independent — can be changed without breaking identity

#### Safe Combinations

- `bento + glass` → premium dashboards (Palette: Violet H=290)
- `bento + clean` → modern SaaS (Palette: Blue H=250)
- `default + paper` → editorial/content (Palette: Amber H=80)
- `default + mono` → developer tools (Palette: Zinc monochromatic)
- `bento + brutalism` → experimental layouts (Palette: any high-C primary)

#### The Nesting Pattern (Anilhamento)

Presets with structural containers (BENTO, GLASS, CLEAN) MUST follow the **Elevation Stack** (Part 1, Phase 0.2) when nesting components:

1. **Base**: `S0` (Page Background)
2. **Container**: `S1` or `S2`
3. **Child Element**: Move one layer up (e.g., child of `S2` is `S3`).
4. **Contrast**: Apply the **S1/S2 Boundary** border rules from Part 1.

</rule>

### Tokens (Scalability)

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

### Preset Anti-Patterns

- Mixing multiple skins
- Per-component styling decisions
- Ignoring states (focus, error, loading)
- Inconsistent typography
- Hardcoded styles without tokens

---

## Part 4 — UX Quality Standards (Constitution of the Browser)

> [!IMPORTANT]
> The interface is governed by the **4th Law: Visual Excellence** defined in `.ai/skill/staff-dna.md`. This part makes it enforceable for browser and mobile environments.

### Rule: Mobile-First Absolute

<rule name="MobileFirst">

- Design starts at mobile (≤ 640px)
- Desktop must **extend**, not override layout logic
- Minimum touch target: `44x44px`
- Respect safe areas: `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`
- Avoid hover-only interactions on touch devices

</rule>

### Rule: Interaction & Motion

<rule name="InteractionMotion">

- Entry animations: max translate `8px`, duration `120–200ms`, stagger `40–80ms`
- Easing: `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`
- Hover feedback: visible within `100ms`
- Motion safety: respect `prefers-reduced-motion`; disable non-essential animations when enabled

</rule>

### Rule: Visual Resilience (States)

<rule name="States">

Every interactive UI MUST implement:

- **Loading**: structural skeleton (match final layout); avoid spinner-only states
- **Empty**: explicit message; optional primary action
- **Error**: clear message; retry action required
- **Disabled**: visually distinct; no pointer events

</rule>

### Rule: Accessibility (A11y)

<rule name="Accessibility">

- Use semantic elements: `<button>`, `<a>`, `<input>`
- Keyboard navigation: all actions reachable via `Tab`; logical tab order; visible focus state required
- Focus: never remove outline without replacement; use visible `ring` or `outline`
- Contrast: must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
  - Avoid low-contrast combinations (e.g. muted on muted)
  - OKLCH quick check: Lightness delta between text and background must be ≥ 40 percentage points (e.g., text at L=55% on background at L=97% → delta=42% ✔)
  - **Contextual Contrast**: Secondary text (muted) on `S1/S2` surfaces should maintain a Lightness delta of ≥ 25% (e.g. text L=70% on surface L=95%)
  - For token generation ensuring compliant contrast, see Part 1 (Phase 0.1)
- ARIA: only when necessary; must reflect real state (no fake attributes)

</rule>

### Rule: Performance & Responsiveness

<rule name="Performance">

- Interaction response: feedback within `100ms`
- Animation: must run at `60fps`; avoid layout thrashing (no forced reflow loops)
- Rendering: avoid unnecessary re-renders; memoize derived values when needed
- Assets: lazy load non-critical content; optimize images (size + format)

</rule>

### Rule: Consistency & Predictability

<rule name="Consistency">

- Same interaction → same visual response
- Same component → same states everywhere
- Do not redefine behavior per screen

</rule>

### Rule: Density & Spacing (L1–L4)

<rule name="Density">

Spacing must follow a consistent hierarchy to avoid visual noise.

| Level  | Role                     | Gap/Padding | Value (Tailwind)        |
| :----- | :----------------------- | :---------- | :---------------------- |
| **L1** | Internal (Button/Icon)   | `4–8px`     | `gap-1`, `gap-2`, `p-2` |
| **L2** | Siblings (Items in Card) | `16–20px`   | `gap-4`, `p-4`, `p-5`   |
| **L3** | Sections (Card in Grid)  | `24–40px`   | `gap-6`, `gap-10`       |
| **L4** | Global (Page containers) | `64px+`     | `py-16`, `px-6`         |

</rule>

---

## Part 5 — Writing Soul (UI Copy & Perennial Artifacts)

Good technical writing starts with the realization that there is a person on both sides of the screen. Software documentation is a shared conversation, and maintaining a sense of mind behind the words is essential for effective communication. Sterile or voiceless text feels like a missed opportunity to connect and share real engineering wisdom. These standards apply to all non-code writing tasks: READMEs, guides, changelogs, UI content, commit messages, and chat interactions with the developer.

### Pedagogical Tone (Default)

The default tone is **pedagogical, calm, and inviting**. The goal is not to simplify, but to make complexity accessible.

When using technical terms or acronyms, keep the term in English (when it is the field standard) and add a short contextual explanation in parentheses immediately after. The explanation must describe **what it does**, not just what the acronym expands to.

**Pattern**: `<term> (<brief contextual explanation>)`

| ✅ Do                                                                                               | ❌ Don't                                                   |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `CI/CD (pipeline that automates build, test, and deploy on every commit) is configured.`            | `CI/CD (Continuous Integration/Deployment) is configured.` |
| `The ORM (layer that maps code objects to database tables, eliminating manual SQL) runs the query.` | `The ORM runs the query.`                                  |
| `The SSOT (single source of truth — one file governs what all other files consume) is context.md.`  | `The SSOT is context.md.`                                  |

The tone stays **tranquil and inviting**, not promotional and not condescending. Peer-level respect: explain as you would to a smart colleague who hasn't seen this specific term before.

### Cultivating Personality

Effective writing reflects the natural rhythms of how we think and solve problems. Bring a clear perspective to the facts you present. Mix brief observations with longer, more detailed explanations to keep the reader engaged.

Authenticity comes from acknowledging that engineering is complex. Professionals navigate uncertainty and hold nuanced views, and reflecting those feelings makes writing more reliable. A well-placed aside or brief tangent creates the pulse that makes a technical guide feel alive.

### Seeking Authenticity

Maintaining a professional and grounded tone means recognizing patterns that cloud clarity. Focus on direct observations rather than stylistic crutches.

#### Natural Expression

True authority speaks for itself. Avoid significance inflation: state facts and their direct consequences, letting the quality of the work be the focus. Phrases like "testament to" or "pivotal moment" add unnecessary weight where a simple description of the impact works better.

#### Active Clarity

Direct communication is the most helpful for the reader. Break complex ideas into clear, active clauses. Choose active verbs so the reader understands the exact flow of information or logic. Present participle phrases ending in "-ing" often obscure the relationship between actions.

#### Professional Peerage

A calm, peer-to-level approach builds trust more effectively than promotional adjectives like "vibrant" or "groundbreaking." A professional and direct response carries more weight than conversational fillers or overly decorative enthusiasm.

### Mouth vs Soul (The Duality)

Token Discipline demands a clear distinction between interaction and delivery. The context determines which mode applies.

| Context                                             | Mode                  | Rule                                                                                              |
| --------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| **Chat with dev (default)**                         | Pedagogical           | Technical terms + contextual explanation in parentheses. Calm and inviting tone.                  |
| **Chat with Caveman active**                        | Caveman (dense/terse) | No pedagogy. Apply Soul only if dev asks "explain" or "why".                                      |
| **Source code**                                     | Project standards     | Soul does **not** govern code. Follow project linting and conventions.                            |
| **Code comments**                                   | Semi-pedagogical      | Explain acronyms for public APIs or complex functions. No throat-clearing. Stop-Slop rules apply. |
| **Perennial artifacts** (README, CHANGELOG, Guides) | Soul + Stop-Slop full | Apply all rules below. Active voice, no banned phrases, no false agency.                          |

- **The Mouth (Interaction)**: Follow Caveman Full. Absolute technical terseness. No articles or politeness. Speed and economy.
- **The Soul (Delivery)**: Apply this guide (Pedagogical) in project artifacts and any chat interaction where the dev expects explanation. Maintain pulse and humanity where the text is perennial.

### Language and Style Practices

Simple and direct verbs keep the focus on the content. Words like "is," "are," and "has" are often more effective than complex alternatives.

#### Visual Serenity

Structure and rhythm guide the reader naturally. Avoid em dashes: their removal requires earning each pause through careful sentence composition. Use bold formatting exclusively for technical emphasis — specific terms, commands, or key constraints.

Headings follow sentence case for a serene and professional appearance. Use emojis only when they carry semantic meaning for pattern signaling (marking successful or unsuccessful examples in a technical guide). This keeps the visual environment focused on the information.

### Anti-Patterns Reference (Stop-Slop)

These patterns signal AI-generated prose. Remove them before delivering any artifact.

#### Banned Phrases

**Throat-clearing openers** — Cut these and state the point directly:

- "Here's the thing:" / "Here's what [X]" / "Here's why [X]"
- "The uncomfortable truth is" / "The truth is," / "The real [X] is"
- "Let me be clear" / "I'll say it again:" / "I'm going to be honest"
- "Let me walk you through..." / "In this section, we'll..." / "As we'll see..."

**Emphasis crutches** — Add no meaning, delete them:

- "Full stop." / "Period." / "Let that sink in."
- "This matters because" / "Make no mistake" / "Here's why that matters"

**Business jargon** — Replace with plain language:

| Avoid                 | Use instead            |
| --------------------- | ---------------------- |
| Navigate (challenges) | Handle, address        |
| Unpack (analysis)     | Explain, examine       |
| Deep dive             | Analysis, examination  |
| Game-changer          | Significant, important |
| Moving forward        | Next, from now         |
| Circle back           | Return to, revisit     |
| Landscape (context)   | Situation, field       |

**Adverbs** — Kill all adverbs in delivery artifacts. Avoid: really, just, literally, genuinely, honestly, simply, actually, deeply, truly, fundamentally, inherently, inevitably, importantly, crucially.

Also cut: "At its core", "It's worth noting", "At the end of the day", "When it comes to", "The reality is".

**Vague declaratives** — If a sentence says something is important without showing the specific thing, replace it with the specific thing:

- ❌ "The implications are significant." → ✅ Name the specific implication.
- ❌ "The reasons are structural." → ✅ Name the specific structure.
- ❌ "The stakes are high." → ✅ Name what breaks if this goes wrong.

#### Structural Anti-Patterns

**Binary contrasts** — State Y directly. Drop the negation:

- ❌ "Not because X. Because Y." / "The answer isn't X, it's Y." / "Not X. But Y."
- ✅ "Y is the reason." / "Y is the answer."

**False agency** — Inanimate things don't perform human actions. Name the actor:

- ❌ "The decision emerges." / "The culture shifts." / "The data tells us." / "The system decides."
- ✅ "The team decided." / "Engineers changed their workflow." / "Reading the data, we concluded."

**Narrator-from-a-distance** — Put the reader in the room, not floating above the scene:

- ❌ "Nobody designed this." / "People tend to..." / "This happens because..."
- ✅ "You don't sit down one day and decide to..." / Address the reader directly.

**Passive voice** — Every sentence needs a subject doing something:

- ❌ "X was created." / "Mistakes were made." / "It is believed that..."
- ✅ Name who created it, who made the mistakes, who believes it.

**Dramatic fragmentation** — Sentence fragments for emphasis manufacture profundity:

- ❌ "[Noun]. That's it. That's the [thing]." / "X. And Y. And Z."
- ✅ Complete sentences. Trust content over presentation.

#### Quick Checks Before Delivering Artifacts

- Any adverbs? Kill them.
- Any passive voice? Find the actor, make them the subject.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Sentence starts with a Wh- word? Restructure it.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Any "not X, it's Y" contrasts? State Y directly.
- Three consecutive sentences match length? Break one.
- Em-dash anywhere? Remove it.
- Vague declarative ("The implications are significant")? Name the specific thing.
- Narrator-from-a-distance? Put the reader in the scene.

### The Refinement Process

Before sharing work, reflect briefly to ensure content matches intention. Look for familiar patterns that feel like general summaries rather than specific observations. Replace them with active, direct language. Add a unique insight or vary sentence length to make the text feel genuinely yours.

For perennial artifacts, run the Quick Checks above before delivery.

</ruleset>

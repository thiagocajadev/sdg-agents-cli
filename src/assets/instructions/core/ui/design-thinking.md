# Design Thinking — Phase 0 (Mandatory Before Any UI Work)

> **This phase runs before wireframe, before code, before any visual decision.**
> It produces the aesthetic contract that all subsequent phases execute against.
> Linked from: [frontend.md](../../competencies/frontend.md) | [presets.md](./presets.md)

<ruleset name="DesignThinking">

> [!IMPORTANT]
> **Phase 0 is not optional.** An agent that skips Design Thinking will produce technically correct but aesthetically incoherent UI. The four phases below are a decision protocol, not a creativity exercise.

---

## Phase 0.1 — Palette Setup (First-Time Rule)

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

### Option 1 — Default Palette (Zinc + Blue)

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

### Option 2 — Custom Palette (OKLCH Guided)

The agent MUST ask exactly two questions:

```
1. Primary color? Choose a Hue (H value) or a color name:
   Red=20  Orange=70  Yellow=95  Green=180  Teal=200  Blue=250  Violet=290  Pink=320

2. Secondary/accent color? (press Enter to use the recommended Split-Complementary,
   or choose a Hue manually — must differ from primary by ≥ 60 Hue units)
```

#### Color Harmony — Picking the Secondary Hue

Use the Color Wheel relationships below to choose the secondary. The **recommended default is Split-Complementary** — it provides clear contrast without visual tension, which is the hardest balance to achieve manually.

| Relationship               | Formula         | Result                        | UI Guidance                                                                                |
| :------------------------- | :-------------- | :---------------------------- | :----------------------------------------------------------------------------------------- |
| **Split-Complementary** ✅ | Primary H ± 150 | Contrast without tension      | **Default choice.** Works in all presets.                                                  |
| **Complementary**          | Primary H + 180 | Maximum contrast, high energy | Use **only** as accent at 10%. Never as secondary background.                              |
| **Analogous**              | Primary H ± 30  | Harmonious, very cohesive     | Avoid for primary/secondary pair — colors look too similar; reserve for gradient layering. |
| **Triadic**                | Primary H + 120 | Vibrant, multi-color          | ❌ Avoid in UI — 3 competing hues require a strong design hand. Agent should not use this. |

> **Decision rule:** If the developer did not specify a secondary hue → compute `Primary H + 150`, round to the nearest reference Hue in the table below, and proceed without prompting again.

##### Reference Hues (rounded to nearest named color)

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

#### Harmony Anti-Patterns (Self-Check)

- Secondary Hue within 30H of primary → **too analogous** → colors look like the same color at different brightness → increase distance
- Secondary used as background color → **complementary tension at scale** → reduce to badge/notification use only (10%)
- Three or more distinct hues visible on the same surface → **triadic chaos** → eliminate the weakest one

Then generate the full scale using the **OKLCH Progression Formula**:

| Step | L (Lightness) | C (Chroma) | Notes                               |
| ---: | :------------ | :--------- | :---------------------------------- |
|   50 | `97%`         | `0.02`     | Near-white background tint          |
|  100 | `93%`         | `0.05`     | Very light surface tint             |
|  200 | `87%`         | `0.08`     | Light border / subtle dividers      |
|  300 | `79%`         | `0.11`     | Soft accent                         |
|  400 | `68%`         | `0.13`     | Light mode hover state              |
|  500 | `58%`         | `0.15`     | **Primary action** (buttons, links) |
|  600 | `48%`         | `0.14`     | Light mode hover on primary-500     |
|  700 | `38%`         | `0.12`     | Strong accent                       |
|  800 | `29%`         | `0.09`     | Dark surface tint                   |
|  900 | `21%`         | `0.06`     | Near-black background tint          |

> The Hue (H) is **fixed** across the entire scale. Only L and C change.
> To switch the brand color: **change only H**.

</rule>

---

## Phase 0.2 — Light / Dark Token Inversion

<rule name="LightDarkInversion">

> [!IMPORTANT]
> **The most common agent failure: applying light-mode hover logic to dark mode.**

Dark mode inverts the Lightness axis. The same token value that reads as "lighter" in light mode reads as "wrong direction" in dark mode.

### The Inversion Law

| Context    | Base  | Action (hover/active) | Direction  |
| :--------- | :---- | :-------------------- | :--------- |
| Light mode | `500` | `600`                 | Go darker  |
| Dark mode  | `500` | `400`                 | Go lighter |

```html
<!-- Correct — both themes use the right direction -->
<button class="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400">Ação</button>
```

```html
<!-- ❌ Wrong — dark hover goes darker, feels invisible -->
<button class="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-600">Ação</button>
```

### Why this happens (mental model)

In light mode, the page background is near-white → `primary-500` sits on a light plane → hover must move toward the dark end to create contrast.

In dark mode, the page background is near-black → `primary-500` sits on a dark plane → hover must move toward the light end to surface.

The OKLCH Lightness axis makes this mechanical:

- **Light hover** = lower L → `600` (L=48%)
- **Dark hover** = higher L → `400` (L=68%)

</rule>

---

## Phase 0.3 — Color Distribution (60-30-10 Rule)

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

---

## Phase 0.4 — Aesthetic Direction (Tone + Preset)

<rule name="AestheticDirection">

Before choosing a preset from [presets.md](./presets.md), define the **tone** in one sentence:

> _"This interface is [adjective] for [audience] who need [outcome]."_

Examples:

- "This interface is precise and minimal for developers who need fast data access." → `MONO` or `CLEAN`
- "This interface is layered and premium for teams who need a polished dashboard." → `GLASS` or `BENTO + GLASS`
- "This interface is warm and editorial for readers who need focused content." → `PAPER`
- "This interface is bold and expressive for users who need to take action fast." → `NEOBRUTALISM`

Then commit to **one preset** and do not mix skins. See valid combinations in [presets.md](./presets.md#C3).

### Differentiator (What makes it memorable)

Name one thing the user will remember after closing the tab:

- A distinctive typographic pairing (display + body)
- An unexpected layout break (grid-breaking element, asymmetry)
- A specific micro-interaction (hover reveal, stagger entry)
- A color moment (single high-chroma accent on monochrome surface)

This decision constrains the implementation — it is not a stretch goal.

</rule>

---

## Phase 0.5 — Typography Commitment

<rule name="TypographyCommitment">

### The 2-Font Rule

Every interface uses **exactly 2 font families** — one Display, one Body. No exceptions within a project.

| Role        | Used for                                      | Size range |
| :---------- | :-------------------------------------------- | :--------- |
| **Display** | Headings (`h1`–`h3`), hero text, large labels | ≥ 20px     |
| **Body**    | Paragraphs, UI labels, captions, metadata     | ≤ 16px     |

> **Exception — Code blocks only:** A third font (`JetBrains Mono` or `Fira Code`) is permitted exclusively inside `<code>` and `<pre>` elements. It does not count as a visual family because it never competes with Display or Body in layout flow.

> Fonts below are all available on **Google Fonts** unless noted. Prefer Google Fonts for zero-config reliability. Never use `Arial`, `Roboto`, or `system-ui` as a Display font — they carry no personality.

---

### Pairing Table

| Tone                | Display font          | Body font | Preset fit          | Why this works                                                                                                                                              |
| :------------------ | :-------------------- | :-------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Precision/Dev**   | `JetBrains Mono`      | `Inter`   | MONO, CLEAN         | Mono as display creates "terminal" authority. Inter is invisible at body size — intentionally neutral.                                                      |
| **Premium/SaaS**    | `Bricolage Grotesque` | `Inter`   | GLASS, BENTO        | Variable-width, Modern, distinctive without being quirky. Strong contrast against Inter body.                                                               |
| **Editorial**       | `Playfair Display`    | `Lora`    | PAPER               | Classic high-contrast serif pair. Playfair carries editorial gravity; Lora stays legible at body density.                                                   |
| **Bold/Expressive** | `Syne`                | `DM Sans` | NEOBRUTALISM, BENTO | Syne is geometric and idiosyncratic — feels designed. DM Sans provides clean contrast without competing.                                                    |
| **Corporate**       | `Plus Jakarta Sans`   | `Inter`   | CLEAN, BENTO        | Jakarta has personality at h1 sizes; Inter disappears into the grid at body — correct hierarchy.                                                            |
| **Startup/Modern**  | `Outfit`              | `Geist`   | BENTO, CLEAN        | Outfit is geometric and friendly. Geist is the font of the Next.js/Vercel ecosystem — instantly modern. `Geist` via `next/font/google` in Next.js projects. |
| **Luxury/Refined**  | `Cormorant Garamond`  | `Jost`    | GLASS, PAPER        | Cormorant is ultra-refined at large sizes — zero horizontal weight. Jost is geometric and neutral enough to disappear as body text.                         |

---

### How to apply in Tailwind

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

---

### Anti-Patterns

- Two serif fonts together (e.g., `Playfair` + `Source Serif`) → density at body scale → **replace body with a sans**
- Two humanist sans at similar weights (e.g., `Jakarta` + `DM Sans`) → no hierarchy → **increase weight contrast or swap one**
- Display font at body size (< 16px) → breaks readability → **Display is h1–h3 only**
- More than 2 families in layout flow → visual noise → **remove the third; code blocks are the only exception**
- `Cal Sans` — not on Google Fonts, requires manual hosting → **use `Bricolage Grotesque` instead**

</rule>

---

## Agent Self-Declaration (Required Output)

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

</ruleset>

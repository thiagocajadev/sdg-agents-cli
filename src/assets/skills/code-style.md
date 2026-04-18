# Code Style — Naming, Scansion, Narrative & Tactical Quality

<ruleset name="CodeStyleAndQuality">

> Load in **Phase CODE** alongside `staff-dna`. For SQL aesthetics, see `sql-style.md`.

### Rule: Language & Purity

- **English-only source**; user copy follows Writing Soul.
- **Small Functions**: one responsibility; name needs "and" → split.
- **Immutability default**: `const`/readonly; mutation crosses boundaries explicitly.
- **CQS**: function mutates (command) OR reads (query, pure) — never both.
- **Explicit Dependencies**: inject via params/factory; no hidden globals.
- **Async I/O**: `async/await`; never block the event loop.

---

## Part 1 — Naming Discipline

### Rule: Domain First

<rule name="DomainFirst">

Name by business intent, not implementation/storage detail.

- `processOrder` / `fetchUserProfile` / `isNonInteractiveMode` / `flagsThatConsumeNextArg`
- NOT: `callStripe` / `getUserFromDB` / `hasFlags` / `flagsWithValues`

Reader must understand domain role without tracing origin. Name requires a comment → naming failure.

</rule>

### Rule: SDG Taboos (Banned Names)

<rule name="SDGTaboos">

**Banned verbs:** `handle...` (use process/validate/persist/submit/dispatch), `do/run/execute/perform` without domain subject, `get` for computations (use compute/calculate).

**Banned nouns:** `data`, `info`, `obj`, `item`, `thing` — use domain name. No single-letter vars even in loops.

**Banned abbreviations:** `idx`, `prev`, `arr`, `val`, `tmp`, `res`, `cb`, `fn`, `mgr`, `ctrl`, `svc`. Framework params included: `req`→`request`, `res`→`response`, `ctx`→`context`.

</rule>

### Rule: Expressive Booleans

<rule name="ExpressiveBooleans">

Every boolean carries a semantic prefix. Bare nouns (`loading`, `error`, `active`) are banned.

| Prefix     | Meaning                  | Example                         |
| :--------- | :----------------------- | :------------------------------ |
| `is`       | Current state            | `isLoading`, `isValid`          |
| `has`      | Presence                 | `hasContent`, `hasError`        |
| `can`      | Dynamic capability       | `canSubmit`, `canDelete`        |
| `should`   | Behavioral directive     | `shouldRedirect`, `shouldRetry` |
| `did`      | Past action completed    | `didFetch`, `didMount`          |
| `needs`    | Unsatisfied dependency   | `needsConfirmation`             |
| `supports` | External capability      | `supportsTouch`, `supportsWebP` |
| `allows`   | Policy/config permission | `allowsMultiSelect`             |

`can` = dynamic ability. `allows` = static policy. Negation: define both forms only when both improve readability (`isSuccess`/`isFailure` for guard clauses). Never negative-only: `isNotReady` → use `!isReady` or `isPending`.

</rule>

### Rule: Verb Taxonomy

<rule name="VerbTaxonomy">

| Intent            | Preferred                                 | Avoid              |
| :---------------- | :---------------------------------------- | :----------------- |
| Read from storage | `fetch`, `load`, `find`, `get`            | `retrieve`, `pull` |
| Write/persist     | `save`, `persist`, `create`, `insert`     | `put`, `push`      |
| Compute/derive    | `compute`, `calculate`, `derive`, `build` | `get`, `do`        |
| Transform/map     | `map`, `transform`, `convert`, `format`   | `process`, `parse` |
| Validate          | `validate`, `check`, `assert`, `verify`   | `handle`, `test`   |
| Send/notify       | `send`, `dispatch`, `notify`, `emit`      | `fire`, `trigger`  |
| Remove            | `delete`, `remove`, `purge`, `clear`      | `destroy`, `kill`  |

**UI-specific:** `load` (mount fetch), `refresh` (user-triggered reload), `submit` (form mutation), `handle` (DOM event handler ONLY — not in business logic).

</rule>

### Rule: File & Module Naming

<rule name="FileModuleNaming">

Pattern: `domain.operation.ext` — `order.compute.js`, `currency.normalize.js`, `user.validate.ts`.

**Shared utilities** require all 3: (1) truly domain-agnostic, (2) reused in >=2 unrelated contexts, (3) named by intent.

**Never create:** `helpers.js`, `utils.js`, `common.js`, `shared.js`, `misc.js`.

</rule>

---

## Part 2 — Visual Aesthetics & Scansion

### Rule: Vertical Scansion

<rule name="VerticalScansion">

Code optimized for vertical reading. Horizontal scrolling is failure.

- One instruction per line. No chaining multiple operations.
- Indent parameters, conditions, list items vertically.
- **Paragraphs of Intent**: group lines by semantic step — 0 blank lines within a group, exactly 1 blank line between groups. Never 2+ consecutive blank lines.
- A wall of tight code with no paragraph breaks = scansion failure. A file with double blank lines = noise failure. Both are equal violations.
- **≤3 parameters per line**: inline signature only when ≤3 args; otherwise one arg per line vertically.
- Each block must be scannable in one pass — if it requires backtracking, extract or regroup.

**Pattern:** Extract multi-condition `if` into a named boolean:

```typescript
const canDelete = user.isActive && user.hasRole('ADMIN') && user.permissions.includes('DELETE');

if (canDelete) {
  deleteRecord(id);
}
```

</rule>

### Rule: String Density

<rule name="StringDensity">

Long inline strings (Tailwind class lists, template literals, query strings) degrade scansion. Split by semantic concern.

**Tailwind class strings — split by group, not by token:**

```tsx
// bad — monolithic wall
<div className="flex flex-col gap-4 p-6 rounded-xl border border-border/40 bg-card text-foreground text-sm font-medium hover:bg-card/80 transition-colors disabled:opacity-50 disabled:pointer-events-none" />;

// good — one group per concern
const base = 'flex flex-col gap-4 p-6';
const surface = 'rounded-xl border border-border/40 bg-card';
const typography = 'text-foreground text-sm font-medium';
const states =
  'hover:bg-card/80 transition-colors disabled:opacity-50 disabled:pointer-events-none';

<div className={[base, surface, typography, states].join(' ')} />;
```

**`cva` — composition layer, not string storage:**

```tsx
// bad — cva as a dump for one giant string
const button = cva(
  'flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90'
);

// good — cva as semantic composition
const button = cva(
  [
    'flex items-center justify-center',
    'rounded-lg px-4 py-2',
    'text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'bg-transparent hover:bg-muted',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
      },
    },
  }
);
```

**Rules:**

- Each group represents exactly one concern: layout, surface, typography, state, interaction.
- Never split into single-token lines — that is over-fragmentation, not clarity.
- Prefer `cva` for components with variants. Prefer named `const` array + `.join(' ')` for one-off compositions.
- Raw class strings >5 tokens inline = violation. Extract before committing.

</rule>

---

## Part 3 — Code Anatomy (Narrative Cascade)

### Rule: Narrative Cascade

<rule name="NarrativeCascade">

- **Stepdown Rule**: High-level functions at top, helpers at bottom.
- **Guard Clauses**: Early returns over nested conditionals. Kill "Arrow Antipattern".
- **Explaining Returns**: named `const` before every **meaningful** return; no logic/ternary/anonymous object on the return line; returned variable **symmetric with entry intent**. Exemption: void-terminator form — a function whose last statement is a side-effect call returning `undefined` (e.g. `console.log(msg);`) ends with that bare statement and an implicit return. Wrapping void calls into `const X = sideEffect(); return X;` is **ceremonial** and forbidden.
- **Narrative Siblings**: One-use helper defined as non-exported sibling after its caller.
- **Strategy over Switch**: Replace large switch/if-else with Strategy Maps (lookup objects).

**Strategy Map pattern:**

```typescript
const STATUS_LABELS = {
  active: 'User is Active',
  pending: 'Waiting Approval',
  banned: 'Access Denied',
};
const label = STATUS_LABELS[status] ?? 'Unknown';
```

**Dedent rule:** Large template literals → `const` + `dedent` utility.

</rule>

### Rule: SLA (Single Level of Abstraction)

<rule name="NarrativeSLA">

Each function body either **orchestrates** (calls named functions) or **implements** (computes/transforms) — never both.

- Top-down file structure: highest-level function first.
- Any expression at wrong abstraction level → extract to named function.
- **Code as Documentation**: expressive names replace comments. `// why:` permitted **only** for hidden constraints (invariants, workarounds). No what-comments. Comment restating code = naming failure.

**Pattern:** Orchestrator calls named steps. Each step is a sibling that handles one level.

```js
function buildOrderSummary(order) {
  const header = buildHeader(order);
  const lineItems = buildLineItems(order);
  const extras = buildExtrasSection(order);

  const sections = [header, lineItems, extras].filter((section) => section !== null);
  const summary = sections.join('\n\n');
  return summary;
}
// buildHeader, buildLineItems, buildExtrasSection as siblings below
```

</rule>

---

## Part 4 — Tactical Clean Code

### Rule: Clean Code Essentials

<rule name="CleanCodeTactical">

**Balance is the Key.** Write what the problem requires — neither under-engineered nor over-abstracted.

- **Rule of Three**: Abstract ONLY after pattern repeats 3 times.
- **Guard Clauses**: Mandatory. No Arrow Antipattern.
- **Functional Pipeline**: Accumulate as typed arrays. Compose with filter + join. No string mutation across branches.
- **for...of over reduce**: Loops with explaining variables for accumulation. `map` for 1-to-1 transforms.
- **Immediate Context**: Comments precede code (zero blank lines between).
- **No Alignment Padding**: No extra spaces for `=` or `:`.
- **Parameter Contract**: Rich Object Flow (domain objects) OR Primitive Flow (IDs at boundaries). No mixing.
- **Data vs Presentation**: Compute pure data, then format. Never fuse.
- **Shallow Boundaries**: Max 3 levels property traversal. Slice into named `const`.
- **No God Modules**: Name by domain + operation.
- **Explaining Returns**: Named `const` before every meaningful `return`. Void-terminator exemption — a single side-effect call (e.g. `console.log(msg);`) is the canonical form; never wrap it into `const X = sideEffect(); return X;`.

#### Interface Design

- Extract interface ONLY when second implementation appears.
- Use for: Strategy, Boundary (I/O), Testing substitutes.
- Never interface: pure functions, internal helpers, single-implementation classes.
- Core (pure) = never needed. Presentation = candidate for 2+ formats. Boundary (I/O, DB, API) = almost always.

#### Linter

Mandatory: `no-multi-spaces`, `no-unused-vars`, `prettier`.

</rule>

### Rule: Operational Resilience

<rule name="OperationalResilience">

- Idempotency via UUID keys for side-effects.
- Error Boundaries and defensive checks for UI.
- Typed Error/Result objects over magic strings.
- Fail-fast on missing binary dependencies.

</rule>

### Rule: Result Pattern & HTTP Envelope

<rule name="ResultPatternAndEnvelope">

- **Result\<T\>**: Domain flow. `ok` (data) or `fail` (error code). Never both.
- **Boundary Rule**: Adapter converts `Result<T>` → HTTP Envelope at controller edge.
- **Envelope SSOT**: defined in `.ai/instructions/competencies/backend.md` (shape, meta fields, error codes).

</rule>

### Rule: Abstract Configuration

- **SSOT**: env/secret rules in `security.md` `OperationalAppSec`. Do not redefine.
- **Builder/Options**: fluent builder (`.useX().withY()`) or options pattern per config domain; secrets resolved once at boundary.

### Rule: Version Control

<rule name="StaffGradeVCS">

- **Conventional Commits**: `type(scope): message`. Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.
- **Narrative Subject**: Imperative, lowercase, describes WHAT not HOW.
- **Atomic Commits**: One logical change per commit.
- **No WIP on shared branches**: Squash before merging.
- **Branch naming**: `feat/`/`fix/`/`chore/` + kebab-case.

</rule>

### Rule: Definition of Done

<rule name="DefinitionOfDone">

Code follows conventions. Tests: happy path + edge case + expected failure. Structured logs. No TODOs in critical paths. No raw entities in responses (DTO applied). Narrative Cascade met. Security skill passed.

</rule>

### Rule: Pre-Start Gate (Supreme Block — Recited Before First Write)

<rule name="PreStartGate">

> Load and **recite** this checklist at Phase CODE entry, BEFORE the first `Edit`/`Write`/`NotebookEdit`. This is the supreme block that overrides training-default prose instincts (dense walls, no whitespace, summarize-and-move-on). Items are binary — recite each with `[x]` only after reading the current task against it.

- [ ] **Mental Reset recorded** — agent has named which training defaults are being suspended
- [ ] **Stepdown Rule** — orchestrator at top, helpers below
- [ ] **SLA** — every function either orchestrates OR implements, never both
- [ ] **Explaining Returns** — named `const` above every meaningful `return`, no logic/ternary on return line; void-terminator form (bare `console.log(msg);` etc.) is exempt and never ceremonialized
- [ ] **Small Functions** — one responsibility; any "and" in the name splits the function
- [ ] **Guard Clauses** — early returns over nested conditionals; zero arrow antipattern
- [ ] **Expressive Booleans** — `is`/`has`/`can`/`should`/`did`/`needs`/`supports`/`allows` prefix on every boolean
- [ ] **No SDG Taboos** — no `handle/do/run/get`-for-compute verbs, no `data/info/obj/item/thing` nouns, no `req`/`res`/`ctx` abbreviations
- [ ] **Paragraphs of Intent (Visual Density)** — a blank line separates logical groups; NO blank lines within a group; never 2+ consecutive blank lines. Code wall = failure. Double blank lines = failure.
- [ ] **String Density** — no inline class strings >5 Tailwind tokens; split by semantic concern (layout / surface / typography / state); `cva` used as composition layer, not string dump
- [ ] **Vertical Signature** — ≤3 parameters inline; 4+ breaks to one-per-line
- [ ] **No Explanatory Comments** — `// why:` only for hidden constraints; no what-comments
- [ ] **No Section Banners** — no `// --- Section ---` dividers
- [ ] **Immutability Default** — `const`/readonly unless mutation is the explicit contract
- [ ] **CQS** — command OR query, never both in one function
- [ ] **Pure Entry Point** — `run()` is a headline caller; single-statement form or canonical 2-statement `const X = call(); return X;`
- [ ] **File Naming** — `domain.operation.ext`; never `helpers/utils/common/shared/misc`
- [ ] **Target Files Scoped** — agent lists files from approved Plan; no drift

Any `[ ]` unchecked at the moment of a write-tool call is a Law 1 violation. If the task touches an item the agent is uncertain about, agent re-reads the relevant skill section first; heuristics are not allowed to substitute.

**Twin gate**: `EnforcementChecklist` below runs at Phase TEST (Pre-Finish). This gate runs at Phase CODE entry (Pre-Start). Both must pass.

</rule>

### Rule: Enforcement Checklist (Pre-Finish Gate)

<rule name="EnforcementChecklist">

Binary pass/fail — no partial credit:

- [ ] Stepdown Rule: entry point first after imports/constants
- [ ] SLA: every function orchestrates OR implements
- [ ] Narrative Siblings: one-use helpers as local siblings
- [ ] Explaining Returns: named `const` above every meaningful `return`; void-terminator form exempt (no `const X = console.log(...); return X;`)
- [ ] No framework abbreviations (`req`→`request`, `res`→`response`)
- [ ] Vertical Density: exactly 1 blank between groups, 0 within, never 2+
- [ ] Revealing Module Pattern: named export at footer
- [ ] Shallow Boundaries: max 3 levels (prefer 2)
- [ ] Destructuring inside function body, not in parameters
- [ ] Boolean prefix: `is`, `has`, `can`, `should`, etc.
- [ ] No explanatory comments: only `// why:` for non-obvious
- [ ] No section banners (`// --- Section ---`)
- [ ] Pure entry point: `run()` as headline caller only
- [ ] Reads like a short story (Narrative Cascade)

</rule>

</ruleset>

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
- Single blank lines between logical "paragraphs". No blanks within groups.
- **≤3 parameters per line**: inline signature only when ≤3 args; otherwise one arg per line vertically.

**Pattern:** Extract multi-condition `if` into a named boolean:

```typescript
// named boolean → vertical scansion
const canDelete = user.isActive && user.hasRole('ADMIN') && user.permissions.includes('DELETE');

if (canDelete) {
  deleteRecord(id);
}
```

</rule>

---

## Part 3 — Code Anatomy (Narrative Cascade)

### Rule: Narrative Cascade

<rule name="NarrativeCascade">

- **Stepdown Rule**: High-level functions at top, helpers at bottom.
- **Guard Clauses**: Early returns over nested conditionals. Kill "Arrow Antipattern".
- **Explaining Returns**: named `const` before every return; **no bare `return;`**, no logic/ternary/anonymous object on the return line; returned variable **symmetric with entry intent**.
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
- **Explaining Returns**: Named `const` before every `return`.

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

### Rule: Enforcement Checklist (Pre-Finish Gate)

<rule name="EnforcementChecklist">

Binary pass/fail — no partial credit:

- [ ] Stepdown Rule: entry point first after imports/constants
- [ ] SLA: every function orchestrates OR implements
- [ ] Narrative Siblings: one-use helpers as local siblings
- [ ] Explaining Returns: named `const` above every `return`
- [ ] No framework abbreviations (`req`→`request`, `res`→`response`)
- [ ] Vertical Density: grouped by "Paragraphs of Intent"
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

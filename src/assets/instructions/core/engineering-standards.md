# Engineering Quality Standards — Resilience, Clean Code & DoD

<ruleset name="GlobalEngineeringTactical">

> [!NOTE]
> Advanced topics for Staff-level Agent operations. This ruleset defines the **tactical execution** of Clean Code, Reliability, and Delivery.

## Rule: Clean Code Essentials (The Art of Simplicity)

<rule name="CleanCodeTactical">

> [!IMPORTANT]
> **Simplicity is the goal. Balance is the discipline.** Write only what the problem requires — neither under-engineered nor over-abstracted. Code must be readable, stack-agnostic, and proportional to its purpose.

#### Core Discipline (Named Expectations)

- **Rule of Three**: Abstract ONLY after pattern repeats 3 times.
- **Guard Clauses**: Mandatory. Elimination of "Arrow Antipattern".
- **Functional Pipeline**: Accumulate parts as typed arrays. Compose with filter + join. No string mutation across branches.
- **for...of over reduce**: Use loops with explaining variables for accumulation. `map` valid for 1-to-1 transforms.
- **Vertical Density**: One blank line between logical "paragraphs". No blank lines within groups.
- **Immediate Context**: Comments immediately precede code (zero blank lines).
- **No Alignment Padding**: No extra spaces for `=` or `:`.
- **Parameter Contract**: Choose **Rich Object Flow** (domain objects) or **Primitive Flow** (IDs at boundaries). No mixing in same flow.
- **Data vs Presentation**: Decouple logic from formatting. Compute pure data, then format.
- **Shallow Boundaries**: Max 3 levels property traversal. Slice into named `const` first.
- **Lexical Scoping**: One-off helpers nested in parent. No `export default`.
- **No God Modules**: No `helpers.js`, `utils.js`, `common.js`. Name by domain + operation.
- **Explaining Returns**: Assign result to named `const` before returning (mandatory).
- **Narrative Logic**: Apply Narrative Cascade (SLA + Stepdown).

#### Interface Design

- **Start Concrete**: Extract interface ONLY if second implementation appears.
- **Variation Points**: Use for Strategy, Boundary (I/O), or Testing substitutes.
- **Never interface**: Pure functions, internal helpers, or single-implementation classes.
- **DIP**: Inject interface. Keep caller ignorant of implementation.

| Layer                   | Interface Strategy       |
| :---------------------- | :----------------------- |
| Core (compute)          | Never needed (pure)      |
| Presentation (format)   | Candidate for 2+ formats |
| Boundary (I/O, DB, API) | Almost always required   |

---

#### Linter Strategy

Mandatório: `no-multi-spaces` (eslint), `no-unused-vars` (eslint), `prettier`.

--- closes the gap Prettier does not cover — multiple spaces used for visual column alignment inside declarations.
</rule>

## Rule: Narrative Cascade — SLA Enforcement

<rule name="NarrativeSLA">

> [!IMPORTANT]
> **Single Level of Abstraction is the hardest rule to follow and the most valuable.** For visual patterns and examples, see [Code Style Guide](.ai/instructions/core/code-style.md).

- **SLA (Single Level of Abstraction):** Each function body either **orchestrates** (calls other named functions) or **implements** (computes, transforms, formats) — never both in the same body. A function that loops AND formats AND queries a DB is three functions pretending to be one.
- **Top-Down File Structure:** The highest-level function is defined first. Readers should never scroll down to understand what a file does.
- **No Orphan Logic:** Any expression that doesn't fit the current abstraction level must be extracted to a named function — either lexically (nested inside its parent) or as a sibling if reused.
- **Comments explain "why", never "what".** If naming is right, comments about what the code does should disappear. A comment that restates the code is a naming failure.

````carousel
```js
// ❌ THE ANTI-PATTERN — "The Sprawling Procedural"
// Violations: Logic-in-Formatting, Mixed Altitudes (SLA), Deep Navigation, Mutation Accumulation
function buildOrderSummary(order) {
  let result = `ORDER #${order.id} — ${order.customer.name}\n\n`; // mutation + formatting fused

  result += order.items.map((i) => `  ${i.name}  ×${i.qty}  $${i.price}`).join('\n'); // SLA: map inside orchestrator

  if (order.discount) {
    result += `\n\nDISCOUNT  ${order.discount.code}  –$${order.discount.amount}`; // Logic-in-Formatting
  }

  if (order.shipping.method !== 'pickup') {
    result += `\n\nSHIP TO: ${order.shipping.address}`; // deep navigation + mutation
  }

  return result; // anonymous mutation returned
}
```
<!-- slide -->
```js
// ✅ THE STAFF PATTERN — "The Narrative Cascade"
// Stepdown Rule: Orchestrator sits at top. Lexical Scoping: helpers nested inside their parent.
// Shallow Boundaries: max 2 levels. Data-first, Presentation-later (SLA).
function buildOrderSummary(order) {
  const header = buildHeader(order);
  const lineItems = buildLineItems(order);
  const extras = buildExtrasSection(order);

  const sections = [header, lineItems, extras].filter((section) => section !== null);
  const summary = sections.join('\n\n');
  return summary;

  function buildHeader(order) {
    const { id } = order;
    const { name } = order.customer; // Shallow Boundary: level 2

    const headerLine = `ORDER #${id} — ${name}`;
    return headerLine;
  }

  function buildLineItems(order) {
    const lines = order.items.map((item) => `  ${item.name}  ×${item.qty}  $${item.price}`);
    const lineItemsBlock = lines.join('\n');
    return lineItemsBlock;
  }

  function buildExtrasSection(order) {
    const extraData = computeExtras(order); // Decision Layer — pure data
    if (extraData.length === 0) return null;

    const extrasBlock = formatExtras(extraData); // Presentation Layer — pure formatting
    return extrasBlock;

    function computeExtras(order) {
      const { discount, shipping } = order; // Shallow Boundaries: destructure inside body
      const discountItem = discount ? [{ code: discount.code, amount: discount.amount }] : [];
      const shippingItem = shipping.method !== 'pickup' ? [{ address: shipping.address }] : [];
      const extraData = [...discountItem, ...shippingItem];
      return extraData;
    }
> **Single Level of Abstraction is the hardest rule to follow and the most valuable.**

- **SLA (Single Level of Abstraction):** Each function body either **orchestrates** (calls other named functions) or **implements** (computes, transforms, formats) — never both in the same body.
- **Top-Down File Structure:** The highest-level function is defined first.
- **No Orphan Logic:** Any expression that doesn't fit the current abstraction level must be extracted to a named function.
- **Comments explain "why", never "what".**

</rule>

## Rule: Operational Resilience

<rule name="OperationalResilience">

- **Idempotency**: Use UUID keys for side-effects.
- **Graceful Degradation**: Guard UI with Error Boundaries and defensive checks.
- **Failure Narrative**: Prefer typed Error/Result objects over magic strings.
- **Toolchain Discovery**: Fail-fast on missing binary dependencies. No interactively-set $PATH assumptions.

</rule>

## Rule: Result Pattern & HTTP Envelope

<rule name="ResultPatternAndEnvelope">

- **Result<T>**: Domain flow only. `ok` (has data) or `fail` (has error code). Never both.
- **Envelope**: API contract discriminator. `success` (bool), `error` (code/msg or null), `meta` (optional actions/traces), `data` (payload).
- **Meta**: Context only (action, traceId, requestId, pagination). No business data.
- **Boundary Rule**: Adapter converts `Result<T>` to HTTP Envelope at control layer edge.

| ❌ Result                        | ❌ Envelope                                 | ❌ Architecture                               |
| -------------------------------- | ------------------------------------------- | --------------------------------------------- |
| `boolean` instead of `Result<T>` | `action` at envelope root instead of `meta` | Returning `Result` directly from controller   |
| `ok` + `error` both set          | `meta` as data dump                         | Exception as normal control flow              |
| Storing `isFailure` as a field   | Empty fields sent (`"data": undefined`)     | God Result with HTTP concerns inside          |
| Raw string error without code    | `errors[]` array instead of `error` object  | Branching on HTTP status instead of `success` |

</rule>

## Rule: Abstract Configuration

<rule name="AbstractConfig">

- **Contract over Template**: Define required keys in SPEC. No `.env.example`.
- **Fail-Fast Validation**: Implementing check at boot for all REQUIRED_VARS.

</rule>

## Rule: Staff-grade Version Control

<rule name="StaffGradeVCS">

- **Conventional Commits**: `type(scope): imperative descriptive message`.
- **Atomic**: One logical change per commit. No WIP commits on shared branches.

</rule>

## Rule: Definition of Done (DoD)

<rule name="DefinitionOfDone">
- Tests cover Happy Path + Edge Case + Expected Failure.
- No raw entities leaked — DTO/OutputFilter applied.
- Clean Code standards (Narrative Cascade) met.
</rule>

## Rule: Enforcement Checklist (Pre-Finish Gate)

<rule name="EnforcementChecklist">

> [!IMPORTANT]
> Before finishing any file, verify every item. Binary pass/fail — no partial credit.

- [ ] Entry point is the **first function** after imports/constants (Stepdown Rule)
- [ ] **SLA applied**: every function either orchestrates or implements — never both
- [ ] **Lexical Scoping**: every helper used by only one function is declared _inside_ that function
- [ ] **Explaining Returns**: no bare `return ok(...)`, `return fail(...)`, or `response.status(...).json(...)` — named `const` above every return
- [ ] **No framework abbreviations**: `req` → `request`, `res` → `response`; No Abbreviations rule has no framework exception
- [ ] **Vertical Density applied**: logical parts grouped by "Paragraphs of Intent" (single blank line between groups, none within)
- [ ] **Revealing Module Pattern**: public contract defined via named object + named export at file footer
- [ ] **Shallow Boundaries**: no property chain deeper than 3 levels — slice into a named `const` first
- [ ] Destructuring happens inside the function body, not in the parameter signature
- [ ] No `helpers.js`, `utils.js`, or `common.js` — files named by domain + operation
- [ ] Every name reveals its role without needing a comment
- [ ] No explanatory comments — only `// why:` for non-obvious constraints or deliberate trade-offs
- [ ] A new reader understands the module's purpose without scrolling past the first screen
- [ ] **Boolean names carry a prefix**: no bare `loading`, `error`, `active` — use `isLoading`, `hasError`, `isActive`
- [ ] No raw entities in responses — OutputFilter (DTO) applied at every API boundary
- [ ] **Config Contract defined**: all environment variables listed in the SPEC with abstract naming
- [ ] **No config templates**: confirmed no `.env.example` or similar committed to the repository

</rule>

## Rule: Abstract Configuration Management (The Hardened Setup)

<rule name="AbstractConfig">

> [!IMPORTANT]
> **Configuration is a contract, not a template.** We prohibit `.env.example` to reduce information disclosure.

1. **Phase (SPEC)**: Mandatory definition of the "Configuration Contract". List keys and their purpose (e.g., `PAYMENT_SECRET`).
2. **Abstract Naming**: Use keys that hide the specific vendor or internal infrastructure details.
3. **Runtime Validation**: Regardless of the language, implement a validation step at boot (Fail-Fast) that checks for required variables. Canonical pattern:

```ts
// config.ts — called once at application boot
const REQUIRED_VARS = ['PAYMENT_SECRET', 'AUTH_PROVIDER_SECRET', 'DB_URL'] as const;

function validateConfig() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const missingList = missing.join(', ');
    throw new Error(`Missing required environment variables: ${missingList}`);
  }
}

validateConfig();
```

```js
// config.mjs — JavaScript equivalent (ESM)
const REQUIRED_VARS = ['PAYMENT_SECRET', 'AUTH_PROVIDER_SECRET', 'DB_URL'];

function validateConfig() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const missingList = missing.join(', ');
    throw new Error(`Missing required environment variables: ${missingList}`);
  }
}

validateConfig();
```

4. **Setup Guide**: Instead of committed templates, provide an initialization command or a "Setup" section in the SPEC that guides the developer on which values to obtain.

</rule>

## Rule: Staff-grade Version Control

<rule name="StaffGradeVCS">

- **Conventional Commits:** Mandatory `type(scope): message`. Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.
- **Narrative Subject:** Imperative, lowercase, describes WHAT the commit achieves — not HOW. `feat(order): add idempotency key to checkout` ✅ — `fix: changed the if condition` ❌.
- **Atomic Commits:** One logical change per commit. A commit that adds a feature AND fixes an unrelated bug is two commits.
- **No WIP commits on shared branches:** Squash or rebase before merging. `fix: typo` stacked on `fix: another typo` must be squashed.
- **Branch naming:** `feat/`, `fix/`, `chore/` prefix + kebab-case description. e.g. `feat/order-idempotency`, `fix/cart-total-rounding`.

</rule>

## Rule: Definition of Done (DoD)

<rule name="DefinitionOfDone">
- Code follows project conventions.
- Tests cover main flows and error scenarios.
- Logs are meaningful and structured.
- No TODOs in critical paths.
- No raw entities in responses — OutputFilter (Response DTO) applied at every endpoint.
- [Security Strategy](.ai/instructions/core/security.md) rules passed.
</rule>

</ruleset>
````

# Engineering Quality Standards — Resilience, Clean Code & DoD

<ruleset name="GlobalEngineeringTactical">

> [!NOTE]
> Advanced topics for Staff-level Agent operations. This ruleset defines the **tactical execution** of Clean Code, Reliability, and Delivery.

## Rule: Clean Code Essentials (The Art of Simplicity)

<rule name="CleanCodeTactical">

> [!IMPORTANT]
> **Simplicity is the goal. Balance is the discipline.** Write only what the problem requires — neither under-engineered nor over-abstracted. Code must be readable, stack-agnostic, and proportional to its purpose.

#### Complexity Management

- **Rule of Three:** Abstract ONLY after the pattern repeats 3 times.
- **Guard Clauses:** Kill the "Arrow Antipattern". Early returns and guard clauses are mandatory.
- **Functional Pipeline (Array Composition over String Mutation):** When building composite output, accumulate parts as typed arrays and compose with an explicit filter + join. Never mutate a string variable across conditional branches. `const parts = [a, b, c].filter(section => section !== null); const result = parts.join('\n');` is always clearer than `let s = ''; if (a) s += a; if (b) s += b;`. Avoid `.filter(Boolean)` — it silently removes `0`, `''`, and `false`, which may be legitimate values. Filter only what you intend to exclude.
- **Prefer `for...of` over `reduce` for accumulation; `map` is valid for 1-to-1 transforms:** For loops that accumulate a result (sum, total, count), `for...of` with named intermediate variables (Explaining Variables) is clearer, debuggable, more performant, and portable across languages. `map` is valid for **pure 1-to-1 transformation** of collections where no complex logic or multi-step filtering is involved. `reduce` should be avoided as its accumulator pattern obscures intent and hinders step-by-step debugging. While the `for...of` loop is more verbose, it is the default choice for Staff Engineers when accumulation or complex logic is required. When in doubt, prefer the form that reads closest to plain English:
  - ❌ `const total = items.reduce((acc, item) => acc + item.qty * item.price, 0);`
  - ✅ `let total = 0; for (const item of items) { const lineAmount = item.qty * item.price; total += lineAmount; }`
  - ✅ `const labels = items.map(i => i.name); // valid 1-to-1 transform`
- **Conditional Array Expansion:** When a block of items is conditionally included in a pipeline, produce an empty array instead of nothing: `const refs = hasBackend ? [...backendItems] : [];`. This keeps the spread composition uniform — no special-casing required at the join site.
- **Vertical Density (Para-Logical Grouping):** Use exactly one blank line to separate logical blocks (e.g., State/Hooks -> Styles/Classes -> Rendered JSX parts). This reduces cognitive load by creating visual "paragraphes" of intent.
  - **Cohesion within Groups:** No blank lines are permitted _within_ a block. All variables that belong together stay together.
  - **UI & Styling (Tailwind + cn):**
    - **Named `cn` constant:** MANDATORY for elements with **10 or more** Tailwind classes. Do not use raw `className` in JSX for complex styling.
    - **Line-Breaking:** Break lines within `cn` arguments every **10 classes** (or per responsibility group: Layout, Typography, Visuals, States) to eliminate horizontal scrolling.
- **Immediate Context:** Comments must be placed on the line immediately preceding the code they describe (zero blank lines between comment and code).
- **No Alignment Padding:** Never add extra spaces to align `=` or `:` across adjacent declarations. `const x = foo` is correct; `const x    = foo` to match a longer neighbor is not. It creates noisy diffs and breaks the moment any name changes length. Prettier enforces this automatically — never fight it.
- **Inconsistent Parameter Contract:** Choose one strategy per flow and stick to it. **Rich Object Flow** — pass the full domain object (`buildUser(user)`, `validateUser(user)`, `formatUser(user)`); destructure inside if needed. **Primitive Flow** — pass only the scalar value (`fetchUserById(userId)`, `deleteUserById(userId)`); prefer this at boundaries (DB, API, cache). Rule of thumb: domain → object, boundary (I/O) → primitive. Naming convention enforces the contract: functions receiving objects use the entity name (`user`), functions receiving IDs append `ById` (`fetchUserById`). Mixing both strategies across sibling functions in the same flow is the anti-pattern — it forces callers to know which extraction to perform at each call site.
- **Separation of Concerns — Data First, Presentation Later:** Never couple business logic with formatting inside the same expression. Anti-pattern name: **Logic-in-Formatting**. The pattern: `const data = computeX(input); const formatted = formatX(data);` — compute step produces pure data structures, format step produces strings. A ternary that returns a template literal (`order.discount ? \`DISCOUNT ${order.discount.code}\` : ''`) is the canonical violation — rule and presentation are fused and neither can be tested independently.
- **Shallow Boundaries (No Deep Navigation Hell):** Maximum 3 levels of property traversal per expression. `order.customer.address.city` (3 levels) is the limit. `order.customer.address.location.city` (4+ levels) is a violation — extract a named slice first: `const address = order.customer.address; const city = address.city;`. Destructure **inside** the function body, never in the parameter signature (exception: very small, stable utility functions). This prevents coupling your logic to the deep shape of objects you don't own.
- **Encapsulate Until It Hurts, Extract When Proven:** Functions start nested (Lexical Scoping). Promote to module level or a separate file only when at least one is true: (1) used in 2+ unrelated call sites, (2) exceeds ~15 lines, (3) carries a strong intent name (`normalize`, `validate`, `mapToDto`), or (4) needs isolated testing. Maximum 2 nesting levels inside a file — a third level signals the parent has grown beyond its responsibility and the inner function should move to a sibling module (`order.compute.js`).
- **No God Utility Modules:** Never create `helpers.js`, `utils.js`, or `common.js`. These names carry no responsibility and evolve into dumping grounds. When extraction is needed, name files by domain and operation: `order.compute.js`, `order.format.js`, `order.normalize.js`. Shared utilities are only valid when (1) truly domain-agnostic, (2) reused in ≥2 real contexts, and (3) named by intent — `currency.normalize.js`, `string.format.js`. Test: _"Does this function make sense without knowing what an `order` is?"_ Yes → it can be shared. No → it stays in the domain module.
- **Explaining Returns at Boundaries:** Never return the result of a complex computation, pattern call, or framework send directly. Always assign to a named `const` first — the variable name provides declarative meaning to the output. This rule has no framework exception:
  - ❌ `return ok(orderResponse);` → ✅ `const creationResult = ok(orderResponse); return creationResult;`
  - ❌ `return fail('ORDER_EMPTY');` → ✅ `const validationFailure = fail('ORDER_EMPTY'); return validationFailure;`
  - ❌ `res.status(201).json(envelope);` → ✅ `const httpResponse = response.status(201).json(envelope); return httpResponse;`
- **Narrative Logic:** Mandatory for all languages — see [Code Style Guide](.ai/instructions/core/code-style.md) for Narrative Cascade principles and examples.

#### Interface Design (Interfaces at Boundaries)

> **Rule:** Start concrete. Extract an interface when the second implementation appears — not before.

Interfaces are **variation points**, not a default pattern. Ask before creating one: _"Will I need to swap this without breaking the caller?"_ No → stay concrete. Yes → interface.

**Use interface when you have:**

- **Strategy** — multiple behaviors for the same contract (`DiscountPolicy`: `NoDiscount`, `SeasonalDiscount`)
- **Boundary** — infra, DB, external API (`OrderRepository`: `SqlOrderRepository`, `MemoryOrderRepository`)
- **Output variation** — multiple formats or targets (`OrderFormatter`: `TextFormatter`, `HtmlFormatter`)
- **Testing** — a `FakeOrderRepository` that replaces the real one in tests

```ts
// Canonical examples — each has multiple real implementations
interface PaymentPolicy {
  calculate(order: Order): PaymentResult;
} // Strategy: Pix, Installment, Subscription
interface OrderFormatter {
  format(data: SummaryData): string;
} // Variation: Text, HTML, MDX
interface OrderExporter {
  export(data: SummaryData): FileResult;
} // Boundary: PDF, XLS, JSON
```

**Never use interface for:**

- Pure functions (`computeOrderSummary`, `formatExtras`) — they have no variation point
- Internal helpers scoped to a single parent — Lexical Scoping already encapsulates them
- A class with a single implementation that will never be swapped

**Natural evolution — never jump to step 3 directly:**

```ts
// Step 1: start concrete
function formatOrderSummary(data: SummaryData): string { ... }

// Step 2: a second format appears — now extract the interface
interface OrderFormatter {
  format(data: SummaryData): string;
}
class TextOrderFormatter implements OrderFormatter { ... }
class HtmlOrderFormatter implements OrderFormatter { ... }

// ❌ premature: interface with a single DefaultOrderFormatter is pure ceremony
```

**DIP in practice — inject the interface, keep the caller ignorant:**

```ts
function buildOrderSummary(order: Order, formatter: OrderFormatter): string {
  const data = computeOrderSummary(order); // Core: pure, no interface needed
  const output = formatter.format(data); // Presentation: pluggable via interface
  return output;
}
// Caller swaps formatter without touching buildOrderSummary — that is the point.
```

> **DIP does not require interfaces — it requires low coupling.** Separating `computeOrderSummary` from `formatOrderSummary` already satisfies DIP for 70% of cases. An interface only enters when the _format step itself_ needs to vary across callers.

**Three-layer heuristic:**

```
Core (compute)        → never needs interface — pure, deterministic, no dependencies
Presentation (format) → candidate when a second format appears
Boundary (repo, exporter, payment) → interface almost always required
```

#### Linter Configuration (when setting up ESLint for a project)

Always include these rules — they enforce the structural standards above at tooling level:

```js
// eslint.config.mjs — minimum required rules for SDG projects
rules: {
  'no-multi-spaces': 'error',      // No Alignment Padding — collapses const x    = foo
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'prettier/prettier': 'error',    // Delegates whitespace, quotes, trailing commas to Prettier
}
```

Prettier (`eslint-plugin-prettier/recommended`) already handles line length, indentation, and quote style. `no-multi-spaces` closes the gap Prettier does not cover — multiple spaces used for visual column alignment inside declarations.
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

    function formatExtras(items) {
      const lines = items.map((item) =>
        item.code ? `DISCOUNT  ${item.code}  –$${item.amount}` : `SHIP TO: ${item.address}`
      );
      const formatted = lines.join('\n');
      return formatted;
    }
  }
}
```
````

</rule>

## Rule: Reliability Protocols

<rule name="OperationalResilience">

> [!IMPORTANT]
> **Defensive dominance.** Software must withstand failure and repetition. Tactical implementation of **Law 2 (Resilience)**.

#### Instructions

- **Idempotency:** Operations involving money, state changes, or side-effects must use **Idempotency Keys (UUIDs)**.
- **Graceful Degradation:** Use **Error Boundaries** and defensive type checking (`data?.user?.name`) to prevent UI collapses.
- **Failure Narrative:** Prefer typed error objects (or Result objects when they clarify the happy/failure path) over magic strings or raw exceptions. Do not force the pattern where idiomatic error handling is already clear.
- **Toolchain Discoverability & Boot Sanity:** Non-interactive processes (hooks, CI, agents) must explicitly verify or discover their dependencies instead of assuming a pre-configured interactive `$PATH`. Any script that relies on a specific binary (Node, Go, Python, etc.) should fail-fast with a clear diagnostic message if the binary is missing, or attempt to locate it in common installation paths.
  </rule>

## Rule: Result Pattern & HTTP Envelope

<rule name="ResultPatternAndEnvelope">

> [!IMPORTANT]
> **Result organizes the flow. Envelope organizes the response. Adapter connects the two.**
> Never mix domain Result with HTTP concerns.

#### Result\<T\> — Domain Flow

```ts
type Result<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  readonly isSuccess: boolean;
  readonly isFailure: boolean;
};

function ok<T>(data: T): Result<T> {
  const result = {
    ok: true,
    data,
    get isSuccess() {
      return this.ok;
    },
    get isFailure() {
      return !this.ok;
    },
  };
  return result;
}

function fail<T = never>(error: string): Result<T> {
  const result = {
    ok: false,
    error,
    get isSuccess() {
      return this.ok;
    },
    get isFailure() {
      return !this.ok;
    },
  };
  return result;
}
```

**Rules:**

- `ok` is the single source of truth — `isSuccess`/`isFailure` are derived getters, never stored
- Success → has `data`. Failure → has `error`. Never both
- Always return via named variable (Explaining Returns): `const result = ok(data); return result;`
- Result stays in the domain — no HTTP status, no meta, no envelope inside it

#### HTTP Envelope — API Contract

`success` is the discriminator — consumers branch on it, never on HTTP status alone.

```json
// Success — single resource
{ "success": true, "error": null, "data": { } }

// Success — with BFF action directive
{ "success": true, "error": null, "meta": { "action": "SHOW_TOAST" }, "data": { } }

// Success — collection with pagination
{ "success": true, "error": null, "meta": { "nextCursor": "abc", "hasMore": true }, "data": [] }

// Failure
{ "success": false, "error": { "code": "ORDER_EMPTY", "message": "Pedido sem itens" }, "data": null }

// Failure with BFF action directive
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Session expired" }, "meta": { "action": "REDIRECT_TO_LOGIN" }, "data": null }
```

**Rules:**

- `success` always present — the single discriminator
- `error` always present — `null` on success, `{ code, message }` on failure
- `meta` optional — carries `action`, pagination, and observability context
- `meta.action` optional — BFF directive when server must guide the client (`REDIRECT_TO_LOGIN`, `SHOW_TOAST`, `SILENT_RETRY`, `REFRESH_TOKEN`)
- `data` always last — it is the payload; envelope headers are read first

#### Meta — Context, Not Content

```ts
type Meta = {
  action?: string; // BFF directive — guides client behavior (REDIRECT_TO_LOGIN, SHOW_TOAST, SILENT_RETRY, REFRESH_TOKEN)
  traceId?: string; // distributed trace ID — correlates request across services
  requestId?: string; // per-request unique ID — correlates logs within this service
  timestamp?: string; // ISO 8601 — when the response was generated
  duration?: number; // response time in ms
  pagination?:
    | { nextCursor: string | null; hasMore: boolean }
    | { page: number; pageSize: number; total: number };
};
```

**Rules:**

- `meta` is flat — `pagination` is the only valid nested object
- Allowed: `action`, `traceId`, `requestId`, `timestamp`, `duration`, `pagination`
- Forbidden: business data, domain payloads, debug dumps
- Test: _"Does this help debug, navigate, or guide the client without knowing the domain?"_ Yes → meta. No → `data` or drop it

```json
// ❌ meta as data dump
{ "meta": { "user": { ... }, "order": { ... }, "debug": "..." } }

// ✅ meta as context
{ "meta": { "traceId": "abc-123", "requestId": "req-456", "duration": 42 } }
```

#### Error Codes — Centralized Constants

```ts
const Errors = {
  ORDER_EMPTY: 'ORDER_EMPTY',
  INVALID_EMAIL: 'INVALID_EMAIL',
} as const;

// Usage
const result = fail(Errors.ORDER_EMPTY);
return result;
```

Eliminates typos, standardizes backend + frontend, and makes every error code a valid translation/log key. Never use raw strings inside `fail()`.

#### Boundary Rule — Result Lives Until the Edge

```
Domain     → Result<T>       ✔ propagates failures up the call stack
Controller → HTTP Response   ✔ Adapter converts here — Result stops
UI / State → never Result    ✔ translate to UI state before crossing
```

Result is a domain contract. It must not cross into HTTP responses, DTOs, or frontend state. The Adapter is the only crossing point.

#### Command vs Query (light CQRS)

```ts
createOrder(): Result<void>   // Command — mutates state, returns no data
getOrder():    Result<Order>  // Query   — reads state, returns data, no side-effects
```

Commands and Queries never mix. A function that both mutates and returns domain data is a violation.

#### DTO — Never Leak Internal Structure

```ts
// Domain object stays internal
const dto = { id: order.id, total: order.total }; // only expose what the API contract needs
```

The Adapter produces the DTO. The domain object never goes out raw.

#### Adapter — the Bridge

The Adapter translates `Result<T>` → HTTP status + Envelope and domain object → DTO. It is the only layer allowed to know both. Domain code never imports HTTP; HTTP layer never imports domain logic.

#### Anti-patterns

| ❌ Result                        | ❌ Envelope                                 | ❌ Architecture                               |
| -------------------------------- | ------------------------------------------- | --------------------------------------------- |
| `boolean` instead of `Result<T>` | `action` at envelope root instead of `meta` | Returning `Result` directly from controller   |
| `ok` + `error` both set          | `meta` as data dump                         | Exception as normal control flow              |
| Storing `isFailure` as a field   | Empty fields sent (`"data": undefined`)     | God Result with HTTP concerns inside          |
| Raw string error without code    | `errors[]` array instead of `error` object  | Branching on HTTP status instead of `success` |
| **Pure Boolean** (success/error) | **Redundant Action** (CRUD / NONE)          | **Coupled Cache** to core/domain              |
| Generic names (`handle`, `do`)   | Missing envelope (`{ success: true }`)      | **Structure Duplication** across layers       |

> **Consistency over perfection.** One simple pattern followed everywhere beats five perfect patterns used inconsistently. Add `meta`, `Errors`, builders, and adapters only when the pain is real — not preemptively. The moment you notice you are building a framework instead of a feature, stop and apply Rule of Three.

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

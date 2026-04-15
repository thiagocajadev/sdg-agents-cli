# Code Style — Naming, Scansion, Narrative & Tactical Quality

<ruleset name="CodeStyleAndQuality">

> [!NOTE]
> The unified "write-quality code" skill. Merges naming discipline, visual scansion, narrative anatomy, and tactical clean-code standards into one top-down reference.
> Load in **Phase CODE** alongside `staff-dna`. For SQL-specific aesthetics, load the [SQL Style skill](.ai/skill/sql-style.md).

---

# Part 1 — Naming Discipline

> [!IMPORTANT]
> Names are the primary documentation of code. A name that requires a comment to be understood is a naming failure.
> This section applies universally — every language, every layer, every file.

## Rule: Domain First

<rule name="DomainFirst">

Name by business intent, not technical implementation or storage detail.

- `processOrder` ✅ — `callStripe` ❌ (implementation detail)
- `fetchUserProfile` ✅ — `getUserFromDB` ❌ (storage detail)
- `isNonInteractiveMode` ✅ — `hasFlags` ❌ (too abstract)
- `flagsThatConsumeNextArg` ✅ — `flagsWithValues` ❌ (not expressive)

A reader must understand a variable's domain role without tracing its origin. If the name only makes sense after reading the surrounding code, rename it.

</rule>

## Rule: SDG Taboos (Banned Generic Names)

<rule name="SDGTaboos">

> [!IMPORTANT]
> These names are banned because they carry no information. They force the reader to look elsewhere to understand the code.

#### Banned Verbs

- **NO `handle...`** as a verb prefix: ambiguous. Replace with `process`, `validate`, `persist`, `navigate`, `submit`, `dispatch`.
- **NO `do`, `run`, `execute`, `perform`** without a domain subject: `doStuff` ❌ — `executeOrderCheckout` ✅.
- **NO `get` for computations**: `getTotal` ❌ when it computes — use `computeTotal` or `calculateTotal` ✅.

#### Banned Nouns

- **NO `data`, `info`, `obj`, `item`, `thing`**: meaningless. Use the domain name — `order`, `userPayload`, `productCatalog`.
- **NO Single-Letter Vars**: banned even in loops. Use `index`, `item`, `orderItem`, `userId`.

#### Banned Abbreviations

`idx`, `prev`, `arr`, `val`, `tmp`, `res`, `cb`, `fn`, `mgr`, `ctrl`, `svc` are banned.
If you need to abbreviate, the name is wrong. **Framework parameters are not exempt**: `req` → `request`, `res` → `response`, `ctx` → `context`.

</rule>

## Rule: Expressive Booleans

<rule name="ExpressiveBooleans">

> [!IMPORTANT]
> Every boolean must carry a semantic prefix. A bare noun (`loading`, `error`, `active`) is banned.

| Prefix     | Meaning                                     | Examples                                      |
| :--------- | :------------------------------------------ | :-------------------------------------------- |
| `is`       | Current state or condition                  | `isLoading`, `isError`, `isOpen`, `isValid`   |
| `has`      | Presence or possession                      | `hasContent`, `hasError`, `hasSelection`      |
| `can`      | Active capability or permission (dynamic)   | `canSubmit`, `canDelete`, `canRetry`          |
| `should`   | Behavioral directive (agent decides)        | `shouldRedirect`, `shouldRetry`, `shouldSkip` |
| `did`      | Past action completed (one-time events)     | `didFetch`, `didMount`, `didAccept`           |
| `needs`    | Dependency or requirement not yet satisfied | `needsConfirmation`, `needsRefresh`           |
| `supports` | Capability of an external system or feature | `supportsTouch`, `supportsWebP`               |
| `allows`   | Passive permission (policy/config driven)   | `allowsMultiSelect`, `allowsGuests`           |

**`can` vs `allows`:** `can` = the current actor has the ability right now (computed, dynamic). `allows` = the system or policy permits it (config, role, feature flag — static from the caller's perspective).

**Negation rule:** Define both positive and negative forms only when both improve readability at the call site. `isSuccess` and `isFailure` coexist because guard clauses read better with `isFailure` than `!isSuccess`. Never define a negative-only boolean — `isNotReady` ❌ → use `!isReady` or rename to `isPending` ✅.

</rule>

## Rule: Verb Taxonomy (Operations by Intent)

<rule name="VerbTaxonomy">

> [!NOTE]
> Choose the verb that describes the operation's intent, not its mechanism.

| Intent                              | Preferred Verbs                           | Avoid              |
| :---------------------------------- | :---------------------------------------- | :----------------- |
| Read from storage / external system | `fetch`, `load`, `find`, `get`            | `retrieve`, `pull` |
| Write / persist state               | `save`, `persist`, `create`, `insert`     | `put`, `push`      |
| Compute / derive a value            | `compute`, `calculate`, `derive`, `build` | `get`, `do`        |
| Transform / map shape               | `map`, `transform`, `convert`, `format`   | `process`, `parse` |
| Validate / assert constraints       | `validate`, `check`, `assert`, `verify`   | `handle`, `test`   |
| Send / dispatch / notify            | `send`, `dispatch`, `notify`, `emit`      | `fire`, `trigger`  |
| Remove / clean up                   | `delete`, `remove`, `purge`, `clear`      | `destroy`, `kill`  |

**UI-specific verb prefixes** (React / component functions):

| Prefix    | Use                                    |
| :-------- | :------------------------------------- |
| `load`    | Initial data fetch on mount            |
| `refresh` | Reload triggered by user action        |
| `submit`  | Form submission or mutation            |
| `handle`  | DOM event handler (click, change, etc) |

Note: `handle` is **only permitted as a UI event handler prefix** — not as a general-purpose verb in business logic or services.

</rule>

## Rule: File & Module Naming

<rule name="FileModuleNaming">

> [!IMPORTANT]
> File names must describe the domain and operation. Generic names are a dumping ground waiting to happen.

#### Pattern: `domain.operation.ext`

- `order.compute.js` ✅ — `helpers.js` ❌
- `order.format.ts` ✅ — `utils.ts` ❌
- `currency.normalize.js` ✅ — `common.js` ❌
- `user.validate.ts` ✅ — `shared.ts` ❌

**Test:** _"Does this function make sense without knowing what an `order` is?"_

- Yes → it can live in a shared, domain-agnostic module named by intent.
- No → it stays in the domain module.

#### Shared utilities — 3 conditions required

1. Truly domain-agnostic (works without knowing the business entity)
2. Reused in ≥ 2 real, unrelated contexts
3. Named by intent — `currency.normalize.js`, not `formatters.js`

If any condition fails, keep it in the domain module.

#### Never create

`helpers.js`, `utils.js`, `common.js`, `shared.js`, `misc.js` — these names carry no responsibility and evolve into dumping grounds.

</rule>

---

# Part 2 — Visual Aesthetics & Scansion

> [!NOTE]
> Aesthetics are not optional; they are a direct indicator of software quality and discipline. Code is optimized for vertical reading — horizontal scrolling is a failure.

## Rule: Vertical Scansion & Density

<rule name="VerticalScansion">

> [!IMPORTANT]
> Code must be optimized for vertical reading (scansion). Horizontal scrolling is a failure.

#### Principles

- **One Instruction per Line**: Avoid chaining multiple operations on the same line.
- **Vertical Density**: Indent parameters, conditions, and list items vertically to allow the eye to scan without jumping left-to-right.
- **Compact Logic Blocks**: Keep related operations close, but separate them with single blank lines to indicate a "Narrative Paragraph" change.

#### Bad vs Good

````carousel
```typescript
// ❌ BAD: Horizontal Density — three conditions chained on one line
if (user.isActive && user.hasRole('ADMIN') && user.permissions.includes('DELETE')) {
  deleteRecord(id);
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Vertical Scansion — each condition is its own scannable line
const canDelete =
  user.isActive &&
  user.hasRole('ADMIN') &&
  user.permissions.includes('DELETE');

if (canDelete) {
  deleteRecord(id);
}
```
````

</rule>

---

# Part 3 — Code Anatomy (Narrative Cascade)

## Rule: Narrative Cascade

<rule name="NarrativeCascade">

> [!NOTE]
> Functions should be read like a story, from high-level to detail.

- **Stepdown Rule**: Higher-level functions appear at the top of the file; lower-level helpers go to the bottom.
- **Guard Clauses**: Prefer early returns over nested conditionals. Kill the "Arrow Antipattern".
- **Explaining Returns**: The final value must be assigned to a named variable before returning — `const result = ...; return result;`. Never return large anonymous objects or inline ternaries.
- **Narrative Siblings (Local Helpers)**: If a helper is only used by one function, define it as a local (non-exported) sibling immediately following its caller to maintain clean top-down scannability.
- **Strategy over Switch**: Replace large `switch` or `if/else` chains with **Strategy Objects** (Maps) to separate data/logic from orchestration (SLA).

#### Strategy Patterns (vs Switch-Bombing)

> [!TIP]
> Use Lookup Maps to maintain high technical density and low visual noise.

````carousel
```typescript
// ❌ BAD: Switch-Bombing — high visual noise, repeats logic structure
function getStatusLabel(status) {
  switch (status) {
    case 'active': return 'User is Active';
    case 'pending': return 'Waiting Approval';
    case 'banned': return 'Access Denied';
    default: return 'Unknown';
  }
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Strategy Map — clean data/logic separation (SLA)
function getStatusLabel(status) {
  const STATUS_LABELS = {
    active: 'User is Active',
    pending: 'Waiting Approval',
    banned: 'Access Denied',
  };

  const label = STATUS_LABELS[status] ?? 'Unknown';
  return label;
}
```
````

#### Explaining Returns & Dedent

> [!IMPORTANT]
> Large template literals MUST be assigned to an "explaining const" and use the **dedent** utility to maintain vertical scansion in the source code.

````carousel
```typescript
// ❌ BAD: Bare Template Return — messy indentation in source
function buildWelcome(name) {
  return `
Welcome, ${name}!
    Let's get started.
  `;
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Explaining Return + Dedent — readable source and output
import dedent from 'dedent';

function buildWelcome(name) {
  const welcomeMessage = dedent`
    Welcome, ${name}!
    Let's get started.
  `;

  return welcomeMessage;
}
```
````

#### Guard Clauses

````carousel
```typescript
// ❌ BAD: "Arrow Antipattern" — logic buried inside nested else branches
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      // business logic...
    } else {
      throw new Error('No items');
    }
  }
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Guard Clauses — happy path always flows at the top level, uninterrupted
function processOrder(order) {
  if (!order) return;
  if (order.items.length === 0) throw new Error('No items');

  // business logic flows here...
}
```
````

#### Explaining Returns

````carousel
```typescript
// ❌ BAD: Anonymous inline return — caller must guess the contract shape
function buildUserCard(user) {
  return {
    display: `${user.firstName} ${user.lastName}`,
    isAdmin: user.roles.includes('ADMIN'),
    avatar: user.avatarUrl ?? '/default.png',
  };
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Named variable — contract is explicit and type-annotatable at the boundary
function buildUserCard(user) {
  const userCard = {
    display: `${user.firstName} ${user.lastName}`,
    isAdmin: user.roles.includes('ADMIN'),
    avatar: user.avatarUrl ?? '/default.png',
  };
  return userCard;
}
```
````

#### Narrative Siblings

````carousel
```typescript
// ❌ BAD: Helper nested inside parent — creates nesting debt and complicates maintenance
export function buildOrderSummary(order) {
  function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
  }

  const summary = { total: formatCurrency(order.total) };
  return summary;
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Helper defined as local sibling — maintains Stepdown Rule and flat structure
export function buildOrderSummary(order) {
  const summary = { total: formatCurrency(order.total) };
  return summary;
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
```
````

</rule>

## Rule: SLA Enforcement (Single Level of Abstraction)

<rule name="NarrativeSLA">

> [!IMPORTANT]
> **Single Level of Abstraction is the hardest rule to follow and the most valuable.**

- **SLA (Single Level of Abstraction):** Each function body either **orchestrates** (calls other named functions) or **implements** (computes, transforms, formats) — never both in the same body. A function that loops AND formats AND queries a DB is three functions pretending to be one.
- **Top-Down File Structure:** The highest-level function is defined first. Readers should never scroll down to understand what a file does.
- **No Orphan Logic:** Any expression that doesn't fit the current abstraction level must be extracted to a named function — defined as a sibling if reused or immediately following its parent (Narrative Siblings).
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
// Stepdown Rule: Orchestrator sits at top. Narrative Siblings: helpers follow their parent as local siblings.
// Shallow Boundaries: max 2 levels. Data-first, Presentation-later (SLA).
function buildOrderSummary(order) {
  const header = buildHeader(order);
  const lineItems = buildLineItems(order);
  const extras = buildExtrasSection(order);

  const sections = [header, lineItems, extras].filter((section) => section !== null);
  const summary = sections.join('\n\n');
  return summary;
}

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
}

function computeExtras(order) {
  const { discount, shipping } = order; // Shallow Boundaries: destructure inside body
  const discountItem = discount ? [{ code: discount.code, amount: discount.amount }] : [];
  const shippingItem = shipping.method !== 'pickup' ? [{ address: shipping.address }] : [];
  const extraData = [...discountItem, ...shippingItem];
  return extraData;
}
```
````

</rule>

---

# Part 4 — Tactical Clean Code

## Rule: Clean Code Essentials (Balance is the Key)

<rule name="CleanCodeTactical">

> [!IMPORTANT]
> **Balance is the Key.** Write only what the problem requires — neither under-engineered nor over-abstracted. Code must be readable, stack-agnostic, and proportional to its purpose.

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
- **Narrative Siblings**: One-off helpers follow caller as local siblings. No `export default`.
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

#### Linter Strategy

Mandatory: `no-multi-spaces` (eslint), `no-unused-vars` (eslint), `prettier`.

`no-multi-spaces` closes the gap Prettier does not cover — multiple spaces used for visual column alignment inside declarations.

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

## Rule: Abstract Configuration Management

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

## Rule: Staff-Grade Version Control

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
- Tests cover Happy Path + Edge Case + Expected Failure.
- Logs are meaningful and structured.
- No TODOs in critical paths.
- No raw entities leaked in responses — DTO / OutputFilter (Response DTO) applied at every endpoint.
- Clean Code standards (Narrative Cascade) met.
- [Security Skill](.ai/skill/security.md) rules passed.

</rule>

## Rule: Enforcement Checklist (Pre-Finish Gate)

<rule name="EnforcementChecklist">

> [!IMPORTANT]
> Before finishing any file, verify every item. Binary pass/fail — no partial credit.

- [ ] **Stepdown Rule**: entry point is the first function after imports/constants
- [ ] **SLA applied**: every function either orchestrates or implements — never both
- [ ] **Narrative Siblings**: every helper used by only one function is declared as a local sibling immediately following its caller
- [ ] **Explaining Returns**: named `const` above every return statement
- [ ] **No framework abbreviations**: `req` → `request`, `res` → `response`
- [ ] **Vertical Density applied**: logical parts grouped by "Paragraphs of Intent"
- [ ] **Revealing Module Pattern**: public contract defined via named object + named export at footer
- [ ] **Shallow Boundaries**: no property chain deeper than 3 levels (level 2 preferred)
- [ ] Destructuring happens inside the function body, not in the parameter signature
- [ ] **Boolean names carry a prefix**: (e.g., `isLoading`, `hasError`, `isActive`)
- [ ] **No explanatory comments**: only `// why:` for non-obvious constraints
- [ ] **No Section Banners**: zero narrative interruptions via `// --- Section ---`
- [ ] **Pure Entry Point**: run() serves only as a high-level headline caller
- [ ] Code reads like a "Short Story" headline-to-details (Narrative Cascade)

</rule>

</ruleset>

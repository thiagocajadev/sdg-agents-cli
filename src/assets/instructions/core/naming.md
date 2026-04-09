# Naming Discipline — Domain Language & Expressivity

<ruleset name="NamingDiscipline">

> [!IMPORTANT]
> Names are the primary documentation of code. A name that requires a comment to be understood is a naming failure.
> This ruleset applies universally — every language, every layer, every file.

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

</ruleset>

# JavaScript — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="JavaScriptConventions">

## Error Handling

- **Strategy**: Result Pattern in the domain (`Result<T>`); `throw` only for unexpected failures (runtime/infra)
- **Propagation**: Result is explicitly returned in business flows; exceptions bubble up to the global handler (backend) or error boundary (frontend)
- **Domain errors**: Standardized `Error` object (`code`, `message`); enum-like const objects when necessary
- **Never**: `throw` for business rules; empty `catch`; leak internal details to the client
- **Global Handling**: Backend → global middleware; Frontend → error boundaries + interceptors; structured logging

### Result Pattern (Vanilla JS)

> <rule name="ResultPatternJS">

Aligned with `ResultPatternAndEnvelope` in `engineering-standards.md`. JSDoc provides type hints; runtime shape is identical to the TypeScript version.

```javascript
/**
 * @template T
 * @typedef {{ ok: true, data: T, error: null, isSuccess: true, isFailure: false }
 *          | { ok: false, data: null, error: string, isSuccess: false, isFailure: true }} Result
 */

function ok(data) {
  return { ok: true, data, error: null, isSuccess: true, isFailure: false };
}

function fail(error) {
  return { ok: false, data: null, error, isSuccess: false, isFailure: true };
}
```

Usage: `fail` receives the error **code** string (e.g. `fail('ORDER_EMPTY')`). Never pass human-readable messages into `fail` — the HTTP adapter translates `error: string` → `{ code, message }` at the boundary.

> </rule>

---

## HTTP & API

- **Framework**: Fastify (preferred) or Express when necessary
- **Style**: API First + BFF — API shaped for the frontend consumer
- **Route organization**: Vertical slice per feature; avoid a single giant central router
- **Middleware/hooks**: Auth in hooks/middleware; validation at the boundary; logging and tracing in the pipeline
- **DI**: Manual via factory functions; explicit dependencies; avoid heavy containers

---

## Testing

- **Framework**: Vitest (preferred) or Jest; `node:test` for scripts/utilities without build
- **Style**: Flat, focused on behavior
- **Naming**: `shouldDoXWhenY`
- **Mocks**: Only external I/O (HTTP, DB, storage); never mock business rules
- **What to test**: Behavior, error cases (Result), API contracts when relevant

### Unit Testing

> <rule name="NodeTest">

```javascript
import test from 'node:test';
import assert from 'node:assert';
import { sum } from './math.js';

test('sum adds two numbers', () => {
  assert.strictEqual(sum(1, 2), 3);
});
```

> </rule>

---

## Types & Contracts

- **Strictness**: Prefer TypeScript whenever possible; `strict: true`; avoid `any`; explicit null
- **DTOs**: Types for DTOs; interfaces for public contracts/extension; never expose internal structure
- **Validation**: Zod (preferred) or Yup; always validate at the boundary

### JSDoc Type Safety (Vanilla JS)

> <rule name="JSDocTypes">

```javascript
/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} email
 * @property {boolean} [isAdmin]
 */

/** @param {UserProfile} profile */
function syncProfile(profile) { ... }
```

> </rule>

---

## JavaScript-Specific Delta

- `async/await` as standard — avoid chained `.then()`
- Never mix sync/async without clear necessity
- Structure code by feature, not by technical type
- Pure functions and functional composition; avoid classes when composition works
- `map` is valid for pure 1-to-1 collection transforms; `reduce` should be avoided — use `for...of` with named intermediate variables for accumulation

### Async/Await

> <rule name="AsyncAwait">

```javascript
async function fetchData(id) {
  try {
    const response = await fetch(`/api/items/${id}`);
    const body = await response.json();
    const result = ok(body.data);
    return result;
  } catch {
    const result = fail('FETCH_ERROR');
    return result;
  }
}
```

> </rule>

### Functional Collections

> <rule name="FunctionalCollections">

```javascript
// ✅ map — valid for 1-to-1 transformation
const activeUserViews = users
  .filter((user) => user.isActive)
  .map((user) => ({ id: user.id, name: user.fullName }));

// ✅ for...of — preferred for accumulation (sum, count, total)
let orderTotal = 0;
for (const item of order.items) {
  const lineAmount = item.qty * item.price;
  orderTotal += lineAmount;
}

// ❌ reduce — avoid: accumulator obscures intent
const total = items.reduce((acc, item) => acc + item.qty * item.price, 0);
```

> </rule>

### Modern Syntax (ES2020+)

> <rule name="ModernSyntax">

```javascript
const userName = response?.data?.user?.name ?? 'Anonymous';
```

> </rule>

### Destructuring & Spread

> <rule name="DestructuringSpread">

```javascript
const updateProfile = (current, updates) => ({
  ...current,
  ...updates,
  updatedAt: new Date(),
});
```

> </rule>

### Module Pattern

> <rule name="RevealingModule">
> Define all logic first, then a single export object at the end. **Always named export — never `export default`.**

```javascript
// ✅ Correct — named export, explicit contract
const saveUser = (user) => { ... };
const deleteUser = (id) => { ... };
const _buildAuditLog = (action) => { ... }; // private — does not enter the object

export const UserService = { saveUser, deleteUser };

// ❌ Incorrect — default export silences rename errors and hinders tree-shaking
export default UserService;
```

**Why named export:**

- IDE always resolves the correct name in autocomplete and "go to definition"
- Bundlers (Vite, esbuild) perform tree-shaking by symbol — default export is treated as opaque
- `import { UserService }` is a contract; `import anything` is silent

### ESM Extension Mandate

> <rule name="ESMExtensionMandate">
> Always use explicit file extensions (`.js`, `.mjs`) for all local internal imports. Node.js with `"type": "module"` requires full specifiers. This prevents resolution ambiguity and aligns with modern browser/ESM standards.
>
> ```javascript
> // ✅ Correct — explicit extension
> import { formatCurrency } from './utils/format.js';
>
> // ❌ Incorrect — extensionless import (fails in ESM)
> import { formatCurrency } from './utils/format';
> ```
>
> </rule>

>

> </rule>

</ruleset>

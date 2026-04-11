# TypeScript — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="TypeScriptConventions">

## Error Handling

- **Strategy**: Result Pattern (`Result<T>`) as default; `throw` only for unexpected runtime/infra failures
- **Propagation**: Result returned explicitly in business flows; exceptions bubble up to the global handler (backend) or error boundary (frontend)
- **Domain errors**: Typed object (`code`, `message`); discriminated unions for more complex scenarios
- **Never**: `throw` for business rules; empty `catch`; leak internal error details to consumers
- **Global Handling**: Backend → central middleware; Frontend → error boundaries + HTTP interceptors

### Result Pattern (Discriminated Union)

> <rule name="ResultPatternTS">

Aligned with `ResultPatternAndEnvelope` in `engineering-standards.md`. TypeScript-specific advantage: discriminated union on `ok` enables full type narrowing — after `if (result.ok)`, `result.data` is `T` (not `T | null`).

```typescript
// Discriminated union — TypeScript narrows automatically after if (result.ok)
type Result<T> =
  | { ok: true; data: T; error: null; isSuccess: true; isFailure: false }
  | { ok: false; data: null; error: string; isSuccess: false; isFailure: true };

export const ok = <T>(data: T): Result<T> => ({
  ok: true,
  data,
  error: null,
  isSuccess: true,
  isFailure: false,
});

export const fail = <T>(error: string): Result<T> => ({
  ok: false,
  data: null,
  error,
  isSuccess: false,
  isFailure: true,
});
```

Usage: `fail` receives the error **code** string (e.g. `fail('ORDER_EMPTY')`). The HTTP adapter translates `error: string` → `{ code, message }` at the boundary — domain never carries human-readable messages.

> </rule>

---

## HTTP & API

- **Framework**: Fastify (preferred) or Express; NestJS when the project requires structured DI
- **Style**: API First + BFF — API shaped for the frontend consumer
- **Route organization**: Vertical slice per feature; avoid a single central router
- **Middleware/hooks**: Auth in the pipeline (`preHandler`); validation at the boundary; centralized logging/tracing
- **DI**: Manual via factory functions with strong typing; NestJS only when the project already uses it

### Node.js (Fastify)

> <rule name="NodeJSFastify">
> Auth via `preHandler`. Route registration via plugins per feature slice.

```typescript
// Constructor-based injection. Never manual instantiation inside routes.
```

> </rule>

---

## Testing

- **Framework**: Vitest (preferred)
- **Style**: Flat, behavior-oriented
- **Naming**: `shouldDoXWhenY`
- **Mocks**: External I/O only; never mock the domain
- **What to test**: Business rules, error flows (Result), typed contracts

### Node.js (Vitest + app.inject)

> <rule name="VitestSupertest">

```typescript
it('should create user', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { email: 'test@test.com' },
  });
  expect(response.statusCode).toBe(201);
});
```

> </rule>

### React (Testing Library)

> <rule name="ReactTestingLibrary">
> Test behavior, not implementation. Use `screen.getByRole` and `userEvent`. Mock hooks that call APIs.
> </ rule>

---

## Types & Contracts

- **Type vs interface**: `type` as default (more flexible); `interface` for public extension/open contracts
- **Strictness**: `strict: true`, `noImplicitAny`, `strictNullChecks`; avoid `any` (use `unknown`)
- **DTOs**: Explicit types for input/output; separated from domain; never expose internal structure
- **Validation**: Zod (preferred); schema as the single source of truth (`z.infer`)

### Zod Validation

> <rule name="ZodValidation">
> Use `safeParse` (returns a Result-like shape). Never `parse` (throws exception).

```typescript
const parsed = schema.safeParse(input);
if (!parsed.success) {
  const validationFailure = fail('VALIDATION_ERROR');
  return validationFailure;
}
const validatedResult = ok(parsed.data);
return validatedResult;
```

> </rule>

---

## Module Pattern

### Revealing Module

> <rule name="RevealingModule">
> Define all implementation first, then a single export object at the end. **Always named export — never `export default`.**

```typescript
// ✅ Correct — named export with explicit type on the object
async function create(data: CreateUserInput): Promise<CreateUserResult> { ... }
async function findOneById(id: string): Promise<User | null> { ... }
async function findOneByEmail(email: string): Promise<User | null> { ... }
function _hashPassword(raw: string): string { ... } // private — does not enter the object

export const userRepository = { create, findOneById, findOneByEmail };
//           ^^^^^^^^^^^^^^^ TypeScript infere o tipo automaticamente

// ❌ Incorrect — default export silencia erros de rename e prejudica tree-shaking
export default userRepository;
```

**When to type the object explicitly:** if the module is an implementation of an interface (repository, service), declare the type to enforce the contract and get a compile-time error if a function is missing.

```typescript
interface UserRepository {
  create(data: CreateUserInput): Promise<CreateUserResult>;
  findOneById(id: string): Promise<User | null>;
  findOneByEmail(email: string): Promise<User | null>;
}

export const userRepository: UserRepository = { create, findOneById, findOneByEmail };
//                         ^^^^^^^^^^^^^^^^^ immediate error if a method is missing
```

**Why named export:**

- IDE always resolves the correct name in autocomplete and "go to definition"
- Bundlers (Vite, esbuild) perform tree-shaking by symbol — default export is treated as opaque
- `import { userRepository }` is a contract; `import anything` is silent

### ESM Extension Mandate

> <rule name="ESMExtensionMandate">
> Always use explicit file extensions in all local internal imports.
> **Note for TypeScript:** When targeting Node.js ESM, you MUST use the `.js` extension in the source code import even if the file is `.ts`.
>
> ```typescript
> // ✅ Correct — Node.js ESM requirement
> import { formatCurrency } from './utils/format.js';
>
> // ❌ Incorrect — extensionless import (fails in Node.js ESM)
> import { formatCurrency } from './utils/format';
> ```
>
> </rule>

> </rule>

---

## TypeScript-Specific Delta

- Discriminated unions to model states and errors (not enums)
- Explicit narrowing via type guards
- `readonly` by default in DTOs and domain objects
- Avoid complex overloads — prefer simple APIs with union types
- Explicitly type return values of critical functions (do not rely on inference)
- `map` is valid for pure 1-to-1 collection transforms; `reduce` should be avoided — use `for...of` with named intermediate variables for accumulation

---

## Framework-Specific Patterns

### React / React Native

> <rule name="ReactHooks">
> Components return only JSX. No API calls or business logic in the component. ViewModel comes from the hook.

```typescript
// Mapper (raw -> ViewModel)
export function mapUser(raw: RawUser): UserViewModel {
  const userViewModel = { id: raw.id, displayName: raw.name ?? raw.email };
  return userViewModel;
}

// Custom Hook
export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => axios.get(`/api/users/${id}`),
    select: (response) => mapUser(response.data),
  });
}
```

> </ rule>

> <rule name="VerticalDensity">
> Use exactly one blank line to separate logical blocks (State/Hooks -> Styles/Classes -> Rendered JSX parts).

- **Logical Grouping**: Group variables by their role (paragraphs of intent).
- **Cohesion**: No blank lines _within_ a block. All related variables stay together.
- **Immediate Context**: Comments stay on the line immediately preceding the code (no blank line).

```tsx
// ❌ Incorrect — excessive spacing breaks cohesion
function MyComponent() {
  const [data, setData] = useState(null);

  // loading state
  const { isLoading } = useQuery(...);

  const containerClassName = cn(...);

  const renderedContent = <div>{data}</div>;

  return <div>{renderedContent}</div>;
}

// ✅ Correct — vertical density with grouping and context
function MyComponent() {
  const [data, setData] = useState(null);
  // loading state
  const { isLoading } = useQuery(...);

  const containerClassName = cn(...);
  const titleClassName = cn(...);

  const renderedContent = <div>{data}</div>;

  return <div>{renderedContent}</div>;
}
```

> </rule>

> <rule name="ReactStyling">
> No horizontal scrolling for Tailwind classes. Use expressive naming and grouped `cn` arguments.

- **Grouping**: Group classes by responsibility (Layout, Typography, Visuals, States).
- **Expressive Naming**: Store style strings in named constants (e.g., `const containerClassName = cn(...)`).
- **Rule of 10**: If an element requires **10 or more** Tailwind classes, a named `cn` constant is MANDATORY.
- **Line-Breaking**: Within `cn`, break lines every **10 classes** (or per responsibility group) to eliminate horizontal scrolling.

```tsx
// ❌ Incorrect — hard to read, causes horizontal scroll
<div className="w-full h-12 flex items-center p-4 bg-card text-primary hover:bg-muted font-bold uppercase transition-all shadow-xl">

// ✅ Correct — expressive, grouped, and clean
const headerContainerClassName = cn(
  "w-full h-12 flex items-center",
  "p-4 bg-card shadow-xl",
  "text-primary font-bold uppercase",
  "hover:bg-muted transition-all"
);

return <div className={headerContainerClassName}>...</div>
```

> </rule>

### Angular

> <rule name="AngularRxJS">
> Logic in Services injected into Components. `AsyncPipe` for Observables. API results with business logic → Result pattern.
> </ rule>

### Astro

> <rule name="AstroServerSide">
> Fetch and validation in the server block (`---`). Only data is passed to client islands (`client:load`, `client:visible`).
> </ rule>

## Operational Resilience

### Node Discovery (Shell Resilience)

> <rule name="NodeDiscovery">
> When writing shell hooks (Husky, CI, git hooks) for a Node project, attempt to discover `node` and `npm` if they are missing from the current `$PATH`. This prevents failures in restricted environments (AI agents, GUI clients).

```bash
# Node Discovery — Staff-grade Resilience
if ! command -v node >/dev/null 2>&1; then
  export PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin"
  # Source common environment managers
  [ -f "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && nvm use --silent >/dev/null 2>&1
  [ -f "$HOME/.asdf/asdf.sh" ] && . "$HOME/.asdf/asdf.sh" >/dev/null 2>&1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Error: 'node' not found in PATH."
  exit 1
fi
```

> </rule>

</ruleset>

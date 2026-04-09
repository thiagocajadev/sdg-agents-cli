# Backend Execution System

<ruleset name="BackendSkill">

> [!IMPORTANT]
> **Backend for Frontend (BFF) is the default architectural pattern.**
> Every endpoint exists to serve a specific frontend need — not to expose a generic data layer.
> Developer Experience (DX) is the primary quality metric: predictable contracts, clear error codes, zero surprises for the frontend consumer.

## Rule: Standard Response Envelope

<rule name="ResponseEnvelope">

All responses use a consistent envelope. Never return raw entities or ad-hoc response shapes.

```typescript
// Success — single resource
{ success: true, error: null, data: T }

// Success — with BFF action directive inside meta
{ success: true, error: null, meta: { action: "SHOW_TOAST" }, data: T }

// Success — paginated collection with action
{ success: true, error: null, meta: { action: "SHOW_TOAST", nextCursor: string | null, hasMore: boolean }, data: T[] }

// Failure
{ success: false, error: { code: string, message: string }, data: null }

// Failure — with BFF action directive inside meta
{ success: false, error: { code: "UNAUTHORIZED", message: "Session expired" }, meta: { action: "REDIRECT_TO_LOGIN" }, data: null }
```

The `success` boolean is the discriminator — consumers branch on it, never on HTTP status alone. `error` is always present: `null` on success, `{ code, message }` on failure. `data` is always last — it is the payload; envelope headers (`success`, `error`, `meta`) are read first. `action` lives inside `meta` — it is one of several possible directives the server can send alongside pagination or observability context.

**Pagination shape:**

- **Default (cursor-based):** Use `nextCursor` + `hasMore` for all collection endpoints. Cursor is stable under concurrent inserts and performs consistently at any depth.
- **Offset-based (exception only):** Use `page` + `total` only for admin/backoffice UIs where deep pagination is explicit and dataset size is bounded. Document the exception in the contract.

```typescript
// Cursor-based (default)
GET /api/orders?cursor=eyJpZCI6MTAwfQ&limit=20
→ { success: true, error: null, meta: { nextCursor: "eyJpZCI6MTIwfQ", hasMore: true }, data: Order[] }

// Offset-based (exception)
GET /api/admin/users?page=3&limit=50
→ { success: true, error: null, meta: { page: 3, pageSize: 50, total: 240 }, data: User[] }
```

#### Meta — Context, Not Content

`meta` is optional and always lean. It carries technical context that helps consumers paginate, trace, or monitor — never business data.

```typescript
type PaginationCursor = {
  nextCursor: string | null; // null when no more pages
  hasMore: boolean;
};

type PaginationOffset = {
  page: number;
  pageSize: number; // items per page — equivalent to "take"
  total: number; // total record count for UI pagination controls
};

type Meta = {
  action?: string; // BFF directive — guides client behavior (REDIRECT_TO_LOGIN, SHOW_TOAST, SILENT_RETRY, REFRESH_TOKEN)
  traceId?: string; // distributed trace ID — correlates request across services
  requestId?: string; // per-request unique ID — correlates logs within this service
  timestamp?: string; // ISO 8601 — when the response was generated
  duration?: number; // response time in ms — useful for client-side monitoring
  pagination?: PaginationCursor | PaginationOffset;
};
```

**When to include each field:**

| Field        | Include when                                                  |
| :----------- | :------------------------------------------------------------ |
| `action`     | Server must guide client behavior — BFF only                  |
| `traceId`    | Distributed system — correlates calls across services         |
| `requestId`  | Always on non-trivial endpoints — correlates server-side logs |
| `timestamp`  | Caching-sensitive responses or audit trails                   |
| `duration`   | Performance-sensitive endpoints or internal tooling           |
| `pagination` | Any collection endpoint — choose cursor or offset (not both)  |

**Pagination strategy:**

- **Cursor** (`nextCursor` + `hasMore`) — default for all feeds, timelines, and large datasets. Stable under concurrent writes; no total count needed.
- **Offset** (`page` + `pageSize` + `total`) — exception for admin/backoffice UIs where the user navigates by page number and the dataset is bounded.

```typescript
// Builder — spread only what is present, never send null/undefined fields
function buildMeta(fields: Partial<Meta>): Meta {
  const meta = {
    ...(fields.action && { action: fields.action }),
    ...(fields.traceId && { traceId: fields.traceId }),
    ...(fields.requestId && { requestId: fields.requestId }),
    ...(fields.timestamp && { timestamp: fields.timestamp }),
    ...(fields.duration !== undefined && { duration: fields.duration }),
    ...(fields.pagination && { pagination: fields.pagination }),
  };
  return meta;
}
```

**Rules:**

- `meta` is flat — `pagination` is the only valid nested object
- `action` lives in `meta`, not at envelope root — it is one directive among several context fields
- Forbidden in `meta`: business data, user objects, domain payloads, debug dumps
- Test: _"Does this field help debug, navigate, or guide the client without knowing the domain?"_ Yes → meta. No → `data` or drop it.

HTTP status codes map to explicit, documented error codes:

| Status | Code                      | When                                                      |
| :----- | :------------------------ | :-------------------------------------------------------- |
| `400`  | `INVALID_INPUT`           | Schema validation failed                                  |
| `401`  | `UNAUTHORIZED`            | Missing or invalid credentials                            |
| `403`  | `FORBIDDEN`               | Authenticated but not permitted                           |
| `404`  | `NOT_FOUND`               | Resource does not exist                                   |
| `409`  | `CONFLICT`                | Unique constraint violation (e.g. duplicate email)        |
| `409`  | `BUSINESS_RULE_VIOLATION` | Domain rule violated (e.g. cannot cancel a shipped order) |
| `422`  | `UNPROCESSABLE`           | Input valid but semantically incorrect                    |
| `500`  | `INTERNAL_ERROR`          | Unexpected server failure                                 |

The frontend consumer must never need to parse free-form error messages or infer meaning from HTTP status alone.
</rule>

## Rule: Contract-First Implementation

<rule name="ContractFirst">

Define the contract before writing any code. The spec must establish:

```markdown
## Contract: <UseCaseName>

Input:

- field: type (constraints)

Output (200):

- field: type (from envelope: data.field)

Meta (optional):

- meta.action: "REDIRECT_TO_LOGIN" | "SHOW_TOAST" | "SILENT_RETRY" | "REFRESH_TOKEN" — BFF directive, only when server must guide client
- meta.pagination: cursor or offset — for collection endpoints

Errors:

- 400 INVALID_INPUT — when: [condition]
- 404 NOT_FOUND — when: [condition]
- 409 CONFLICT — when: [condition]
```

Without a defined contract in the spec, ask — do not invent structure.
</rule>

## Rule: Mandatory Execution Flow

<rule name="ExecutionFlow">

Every operation follows this sequence. Mixing layers is forbidden.

1. **Validate input** — guard clauses, fail fast before any I/O
2. **Load dependencies** — DB reads, service calls (no writes yet)
3. **Apply business rules** — invariants, policy checks
4. **Execute core logic** — the actual operation
5. **Persist state** — writes, events
6. **Return response** — map through Response DTO (OutputFilter), then wrap in the standard envelope

Business logic does not belong in repositories. DB calls do not happen after state mutation.
</rule>

## Rule: Use Case Structure

<rule name="UseCaseStructure">

Each operation lives in a dedicated Use Case:

- No business logic in controllers — controllers route and delegate only
- No anemic domain — entities enforce their own invariants
- Dependencies injected via interfaces (testable and swappable)
- Async all the way — no sync blocking on I/O paths
- Guard clauses over nested conditionals

The **Result Pattern** (`Result<T>`) is preferred when it meaningfully clarifies the happy/failure path distinction. In simple CRUD operations or contexts where idiomatic language error handling is clearer, do not force the pattern — DX matters more than dogma.
</rule>

## Rule: Typed Layer Results

<rule name="TypedLayerResults">

> [!NOTE]
> Every inter-layer return uses a named type. Anonymous object shapes are forbidden at layer boundaries.

Use a named type (interface, type alias, record, struct) for every value crossing a layer boundary — Use Case → Controller, Repository → Use Case, Service → Use Case. Never return raw anonymous objects.

```typescript
// ✅ Correct — named return type + Explaining Returns
interface CreateOrderResult {
  orderId: string;
  estimatedDelivery: Date;
}

async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  // ...
  const orderResult: CreateOrderResult = { orderId, estimatedDelivery };
  return orderResult;
}

// ❌ Wrong — anonymous shape leaks through the cascade; callers must guess the contract
async function createOrder(input) {
  return { orderId, estimatedDelivery, internalRef, rawEntity }; // what's safe to use?
}
```

**Why it matters:**

- Callers know exactly what they receive — no guessing which fields are safe to use
- Refactoring a field name propagates through the type system, not through manual grep
- Each boundary becomes a readable contract, reinforcing **NarrativeCascade**
- OutputFilter at the API boundary is the final step of a chain that was already typed throughout

This is the internal analog of OutputFilter: the same contract discipline, applied to every layer — not just the API edge.
</rule>

## Rule: Thin Entry Point

<rule name="ThinEntryPoint">

The HTTP entry point (Controller in MVC, Handler/Endpoint in Vertical Slice, Minimal API delegate) must be a thin delegation — no business logic, no branching, no DB calls. Ideally one line.

```typescript
// ✅ Correct — named input, Explaining Returns, delegates to Adapter
async function createOrderHandler(request: Request, response: Response) {
  const input: CreateOrderInput = request.body;
  const result = await createOrderUseCase.execute(input);
  const { status, body } = toEnvelope(result);
  response.status(status).json(body);
}

// ❌ Wrong
async function createOrderHandler(req, res) {
  // req/res — ambiguous abbreviations; use request/response
  const existing = await db.orders.findByRef(req.body.ref); // DB call in entry point — belongs in repository
  if (existing) return res.status(409).json({ error: 'Duplicate' }); // business rule here + wrong envelope shape
  // ...
}
```

#### Adapter — Result\<T\> → HTTP Envelope

The entry point delegates through an Adapter. The Adapter is the **only** layer that knows both `Result<T>` (domain) and the HTTP envelope (infrastructure). Domain code never imports HTTP; the entry point never knows `Result<T>`.

```typescript
// adapter.ts — lives in infrastructure/, one per feature or shared

interface HttpEnvelope<T> {
  status: number;
  body: { success: boolean; error: { code: string; message: string } | null; data: T | null };
}

const statusByCode: Record<string, number> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  VALIDATION_ERROR: 400,
};

function toEnvelope<T>(result: Result<T>): HttpEnvelope<T> {
  if (result.isFailure) {
    const status = statusByCode[result.error] ?? 400;
    const body = {
      success: false,
      error: { code: result.error, message: result.error },
      data: null,
    };
    const failureEnvelope = { status, body };
    return failureEnvelope;
  }

  const body = { success: true, error: null, data: result.data };
  const successEnvelope = { status: 200, body };
  return successEnvelope;
}
```

**Rules:**

- `toEnvelope` receives `Result<T>` — never a raw entity or domain object
- HTTP status is derived from the error code — never hardcoded in the entry point
- Human-readable `message` can be resolved from a message map; defaults to the code itself
- `action` is added by the entry point or use case when the server must guide the client — not by `toEnvelope` generically

Naming varies by flavor — the rule is universal:

- **MVC**: Controller delegates to **Service** → `toEnvelope`
- **Vertical Slice**: Handler delegates to **UseCase** → `toEnvelope`
- **Minimal API (C#, Hono)**: Endpoint delegate → **Handler** → `toEnvelope`

If the entry point needs more than 4 lines, the logic belongs in the application layer.
</rule>

## Rule: OutputFilter (Response DTO)

<rule name="OutputFilter">

Every response must be serialized through a Response DTO before leaving the system. Never return raw entities.

- Map domain/DB entity → Response DTO at the boundary (Presenter in Vertical Slice, Service return type in MVC)
- The DTO defines exactly which fields are exposed — unlisted fields are never returned
- Sensitive fields (`passwordHash`, `internalId`, `createdBy`, PII) must never appear in any Response DTO
- No exceptions: even simple CRUD endpoints go through the DTO

This is the enforcement layer for data masking and BFF contract integrity.
</rule>

## Rule: BFF Endpoint Design

<rule name="BFFDesign">

> [!NOTE]
> Shape every endpoint for its UI consumer. Generic REST purity is secondary to frontend DX.

Endpoints are shaped for the UI consumer, not for generic REST purity:

- Response shapes match what the frontend needs directly — no N+1 client-side assembly
- Aggregation and transformation happen server-side (one call, complete data)
- Field names match the frontend's domain language, not the DB column names
- Pagination, filtering, and sorting parameters reflect the UI's actual usage patterns

Avoid exposing raw DB shapes through generic repositories. Transform at the use case boundary.
</rule>

## Rule: Infrastructure Insulation (Cache & Persistence)

<rule name="InfraInsulation">

Infrastructure concerns must never leak into the Domain Layer.

- **Cache as Decorator**: Caching logic must be implemented as a decorator or interceptor around the service/repository. Never add `if (cache.get(key))` inside a business use case.
- **Repository Pattern**: Persistence details (SQL, NoSQL, ORM) stay in the repository implementation. The use case only knows the interface.
- **Circuit Breakers**: External service calls must be wrapped in resilience patterns outside the business logic.

Anti-pattern: **Coupled Cache** — mixing business rules with TTL and cache key management.
</rule>

</ruleset>

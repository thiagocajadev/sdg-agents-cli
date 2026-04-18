# Backend Execution System

> **BFF (Backend for Frontend) is default.** Endpoints serve UI needs, not generic data.

## 1. Response Envelope (SSOT)

> Canonical definition. Referenced by `code-style.md` and `api-design.md` — do not redefine elsewhere.

- **Structure**: `{ success: bool, error: { code, message } | null, meta: { action, nextCursor, hasMore, traceId }, data: T }`.
- **Discriminator**: Consumer branches on `success`.
- **Meta**: `action`, `traceId`, `requestId`, pagination fields only. No business data.
- **Pagination**: Default Cursor (`nextCursor`, `hasMore`). Offset exception (`page`, `total`).
- **Errors**: 400 INVALID_INPUT · 401 UNAUTHORIZED · 403 FORBIDDEN · 404 NOT_FOUND · 409 CONFLICT · 409 BUSINESS_RULE_VIOLATION · 500 INTERNAL.
- **Boundary**: Adapter converts `Result<T>` → Envelope at controller edge.

## 2. Execution Flow

1. **Contract-First**: Define SPEC I/O/errors before code.
2. **Sequence**: Validate → Load Dep → Business Rules → Core Logic → Persist → Filter → Envelope.
3. **Use Cases**: One operation per file. No logic in controllers. Entities enforce invariants.
4. **Result Pattern**: `Result<T>` for domain happy/fail paths.

## 3. Boundaries & Insulation

- **Typed Layer Results**: Named types for all inter-layer returns. No anonymous objects.
- **One-Line Entry Point**: `run()` / `init()` / `start()` = exactly **1 line of delegation**. `Result<T> → HttpEnvelope` via Adapter.
- **OutputFilter**: Entities → Response DTOs. Mask PII/password/internal IDs.
- **Insulation**: Cache as decorator. Repositories hide SQL/NoSQL details.

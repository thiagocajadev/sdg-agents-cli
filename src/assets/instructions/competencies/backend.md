# Backend Execution System

> **BFF (Backend for Frontend) is default.** Endpoints serve UI needs, not generic data.

## 1. Response Envelope

- **Structure**: `{ success, error: { code, message } | null, meta: { action, nextCursor, hasMore, traceId }, data: T }`.
- **Discriminator**: Consumer branches on `success`.
- **Meta**: TraceId, RequestId, Pagination only. No business data.
- **Pagination**: Default Cursor (`nextCursor`, `hasMore`). Offset exception (`page`, `total`).
- **Errors**: 400 INVALID_INPUT · 401 UNAUTHORIZED · 404 NOT_FOUND · 409 CONFLICT · 500 INTERNAL.

## 2. Execution Flow

1. **Contract-First**: Define SPEC I/O/errors before code.
2. **Sequence**: Validate → Load Dep → Business Rules → Core Logic → Persist → Filter → Envelope.
3. **Use Cases**: One operation per file. No logic in controllers. Entities enforce invariants.
4. **Result Pattern**: `Result<T>` for domain happy/fail paths.

## 3. Boundaries & Insulation

- **Typed Layer Results**: Named types for all inter-layer returns. No anonymous objects.
- **Thin Entry Point**: 1-4 lines delegation. `Result<T> → HttpEnvelope` via Adapter.
- **OutputFilter**: Entities → Response DTOs. Mask PII/password/internal IDs.
- **Insulation**: Cache as decorator. Repositories hide SQL/NoSQL details.

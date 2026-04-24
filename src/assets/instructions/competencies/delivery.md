# Delivery Contracts — BFF + UI Execution System

> Load in Phase CODE. The two halves are **self-gated**: apply the section whose discriminator matches the task. A task that touches both sides (e.g. endpoint + its consumer) applies both.

## Backend (load if the task is server-side)

> **BFF (Backend for Frontend) is default.** Endpoints serve UI needs, not generic data.

### 1. Response Envelope (SSOT)

> Canonical definition. Referenced by `code-style.md` and `api-design.md` — do not redefine elsewhere.

- **Structure**: `{ success: bool, error: { code, message } | null, meta: { action, nextCursor, hasMore, traceId }, data: T }`.
- **Discriminator**: Consumer branches on `success`.
- **Meta**: `action`, `traceId`, `requestId`, pagination fields only. No business data.
- **Pagination**: Default Cursor (`nextCursor`, `hasMore`). Offset exception (`page`, `total`).
- **Errors**: 400 INVALID_INPUT · 401 UNAUTHORIZED · 403 FORBIDDEN · 404 NOT_FOUND · 409 CONFLICT · 409 BUSINESS_RULE_VIOLATION · 500 INTERNAL.
- **Boundary**: Adapter converts `Result<T>` → Envelope at controller edge.

### 2. Execution Flow

1. **Contract-First**: Define SPEC I/O/errors before code.
2. **Sequence**: Validate → Load Dep → Business Rules → Core Logic → Persist → Filter → Envelope.
3. **Use Cases**: One operation per file. No logic in controllers. Entities enforce invariants.
4. **Result Pattern**: `Result<T>` for domain happy/fail paths.

### 3. Boundaries & Insulation

- **Typed Layer Results**: Named types for all inter-layer returns. No anonymous objects.
- **One-Line Entry Point**: `run()` / `init()` / `start()` = headline caller only (single-statement or canonical 2-statement form). `Result<T> → HttpEnvelope` via Adapter.
- **OutputFilter**: Entities → Response DTOs. Mask PII/password/internal IDs.
- **Insulation**: Cache as decorator. Repositories hide SQL/NoSQL details.

---

## Frontend (load if the task is UI)

> **No UI creation. Contract execution.** Follow SPEC. Apply Design System.
> Mandatory: Phase 0 (Design Thinking) before code.

### 1. Execution Flow

0. **Design Thinking**: Declare Contract (palette, preset, tone).
1. **Wireframe**: Structure only (div, flex, grid). No styles.
2. **Contracts**: Enforce section structure from SPEC.
3. **Design System**: Apply shadcn tokens + brand OKLCH layer.
4. **Self-Check**: Mandatory visual/code audit.

### 2. Visual Layers & Scale

- **Base**: `bg-background` (root) · **Surface**: `bg-muted` / `bg-muted/40` (sections) · **Elevated**: `bg-card` (cards) · **Overlay**: `bg-popover` (modals).
- **Brand**: `--color-primary-*` (OKLCH) for actions/accents.
- **Spacing**: `gap-1`–`gap-8`. No arbitrary values. No margin for layout.
- **Radius**: `rounded-sm (6px)` · `rounded-md (10px)` · `rounded-lg (16px)`.

### 3. HTTP Integration

- **Architecture**: `Component → useApi hook → Service → apiClient`.
- **apiClient**: Only file importing `fetch`. Returns `Result<T>`.
- **Service**: Fetch + transform domain data to `View` type.
- **UI State**: Three fields: `data`, `error`, `isLoading`.
- **Boundaries**: `Result` stops at Service. Component receives pure View data.

### 4. Component Discipline

- **Hierarchy**: Entry point first. Named variable for JSX (`const view = ...`).
- **Wrappers**: `AppButton` etc. project-wrappers over base shadcn.
- **Rules**: Guard clauses. No logic in `useEffect`. No `try/catch` in UI.
- **Formatting**: Max 2 font-weights per section. No bold-pollution.

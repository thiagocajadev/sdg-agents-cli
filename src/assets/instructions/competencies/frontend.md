# Frontend Execution System

> **No UI creation. Contract execution.** Follow SPEC. Apply Design System.
> Mandatory: Phase 0 (Design Thinking) before code.

## 1. Execution Flow

0. **Design Thinking**: Declare Contract (palette, preset, tone).
1. **Wireframe**: Structure only (div, flex, grid). No styles.
2. **Contracts**: Enforce section structure from SPEC.
3. **Design System**: Apply shadcn tokens + brand OKLCH layer.
4. **Self-Check**: Mandatory visual/code audit.

## 2. Visual Layers & Scale

- **Base**: `bg-background` (root) · **Surface**: `bg-muted` / `bg-muted/40` (sections) · **Elevated**: `bg-card` (cards) · **Overlay**: `bg-popover` (modals).
- **Brand**: `--color-primary-*` (OKLCH) for actions/accents.
- **Spacing**: `gap-1`–`gap-8`. No arbitrary values. No margin for layout.
- **Radius**: `rounded-sm (6px)` · `rounded-md (10px)` · `rounded-lg (16px)`.

## 3. HTTP Integration

- **Architecture**: `Component → useApi hook → Service → apiClient`.
- **apiClient**: Only file importing `fetch`. Returns `Result<T>`.
- **Service**: Fetch + transform domain data to `View` type.
- **UI State**: Three fields: `data`, `error`, `isLoading`.
- **Boundaries**: `Result` stops at Service. Component receives pure View data.

## 4. Component Discipline

- **Hierarchy**: Entry point first. Named variable for JSX (`const view = ...`).
- **Wrappers**: `AppButton` etc. project-wrappers over base shadcn.
- **Rules**: Guard clauses. No logic in `useEffect`. No `try/catch` in UI.
- **Formatting**: Max 2 font-weights per section. No bold-pollution.

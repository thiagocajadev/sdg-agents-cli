# Frontend Execution System

<ruleset name="FrontendSkill">

> [!IMPORTANT]
> **Do not create UI. Execute contracts.**
> The agent's role is to follow structural contracts defined in the spec, then apply the design system.
> Never invent structure, spacing, or visual treatment independently.
> **Start every UI task with Phase 0 (Design Thinking) from [design-thinking.md](../core/ui/design-thinking.md).** Code only begins after the Design Contract is declared.
> For code structure patterns and the L1-L4 spacing hierarchy, see [architecture.md](../core/ui/architecture.md).
> For visual aesthetic presets (Glass, Bento, etc.), see [presets.md](../core/ui/presets.md).
>
> **NarrativeCascade applies to all TypeScript logic files** — hooks, services, mappers, and utils follow the same rule: entry point first, each function either orchestrates or implements, no explanatory comments. UI components are exempt from ordering only when JSX structure demands it; all non-JSX logic inside them is not.

## Rule: Contract-Based Execution Flow

<rule name="ContractExecution">

Every UI task follows a mandatory 5-phase sequence:

0. **DESIGN THINKING** — declare the Design Contract (palette, preset, tone, differentiator, typography). See [design-thinking.md](../core/ui/design-thinking.md). Cannot be skipped.
1. **WIREFRAME** — structure only (`div`, `flex`, `grid`). No styles, no colors.
2. **CONTRACTS** — enforce the section structure defined in the spec.
3. **DESIGN SYSTEM** — apply spacing scale, color layers, typography.
4. **SELF-CHECK** — validate and auto-fix before returning output.

For new pages, always derive from an existing page via **clone-and-modify**. Never build from scratch — keep the header, footer, and layout; replace only the sections that differ. If no existing page is available, start from the closest `section.*` template defined in the Section Contract Templates rule.
</rule>

## Rule: Color Semantic Layers

<rule name="ColorLayers">

### Layer Mapping (shadcn tokens — always semantic, never raw)

Use shadcn semantic tokens for structural color. Never use raw colors (`bg-white`, `bg-black`, hardcoded hex, raw `oklch(...)` inline in JSX).

| Layer      | Role                        | Light (shadcn)  | Dark            |
| :--------- | :-------------------------- | :-------------- | :-------------- |
| `base`     | Page background — root only | `bg-background` | `bg-background` |
| `surface`  | Section backgrounds         | `bg-muted`      | `bg-muted/40`   |
| `elevated` | Cards and panels            | `bg-card`       | `bg-card`       |
| `overlay`  | Modals and drawers          | `bg-popover`    | `bg-popover`    |

Nesting rules:

- `elevated` inside `elevated` is forbidden
- `surface` inside `surface` is forbidden

Text: `text-foreground` (primary content), `text-muted-foreground` (support/captions).
Never place `text-muted-foreground` on a `surface` or `elevated` background with insufficient contrast.

### Brand Palette Layer (`--color-primary-*` — complementary, not a replacement)

Shadcn owns the structural tokens. The brand palette is a **separate OKLCH layer** for interactive elements (buttons, links, highlights, badges) and accent surfaces.

```css
/* globals.css — brand layer extends shadcn, does not replace it */
@theme {
  --color-primary-400: oklch(68% 0.13 250); /* dark-mode hover */
  --color-primary-500: oklch(58% 0.15 250); /* action color */
  --color-primary-600: oklch(48% 0.14 250); /* light-mode hover */
}
```

```html
<!-- Correct: shadcn token for layout, brand token for action -->
<section class="bg-muted">
  <button class="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400">Ação</button>
</section>
```

> The Hue, Chroma, and scale progression for `--color-primary-*` are defined in [design-thinking.md](../core/ui/design-thinking.md). Generate tokens there, consume them here.
> </rule>

## Rule: Spacing & Typography Scale

<rule name="SpacingTypography">

**Spacing scale** — use only these values: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px).

- Prefer `gap` over `margin` for layout composition
- Arbitrary values (`w-[123px]`, `mt-[17px]`) are forbidden
- Use the L1-L4 hierarchy from [architecture.md](../core/ui/architecture.md) to pick the right level per context

**Typography** — default scale:

| Token     | Classes                         |
| :-------- | :------------------------------ |
| `h1`      | `text-2xl font-semibold`        |
| `h2`      | `text-xl font-semibold`         |
| `h3`      | `text-lg font-medium`           |
| `body`    | `text-sm font-normal`           |
| `caption` | `text-xs text-muted-foreground` |

Max 2 font-weights per section. Never use `font-bold` across an entire section.

**Radius** — use only: `rounded-sm` (6px), `rounded-md` (10px), `rounded-lg` (16px). No arbitrary radius.
</rule>

## Rule: Section Contract Templates

<rule name="SectionContracts">

When the spec defines a section, execute its contract exactly. The spec's definition always takes precedence over these defaults.

**section.hero**

```
section(surface) > container > grid(2-col desktop / 1-col mobile)
  ├── left: text content
  └── right: image or visual
```

- `gap-6`, max 2 CTAs, clear heading hierarchy.

**section.cards**

```
section(surface) > container > grid
  └── card(elevated)[]
```

- `gap-6`, consistent card size, no nested cards.

**section.form**

```
section(surface) > container(max-w-md) > form
  ├── inputs
  └── actions
```

- Vertical layout, `gap-4`.

**section.carousel**

```
section(surface) > container > horizontal-scroll
  └── item[] (consistent width)
```

- `overflow-hidden`, consistent item width.

**page.simple** (docs, privacy, terms)

```
header > content(max-w-prose) > footer
```

- Single column, readability focus. No hero, no cards.
  </rule>

## Rule: Component Discipline

<rule name="ComponentDiscipline">

- Prefer shadcn/ui components as the base layer
- Use Tailwind for layout only (`flex`, `grid`, `gap`, sizing)
- Never override base component styles directly
- Wrap base components when project-specific defaults are needed:

```tsx
// Correct: define project-level wrapper, never touch the base
export const AppButton = ({ children, ...props }) => (
  <Button className="h-10 px-4 rounded-md" {...props}>
    {children}
  </Button>
);
```

Use the project's wrappers (`AppButton`, etc.) in pages — not base components directly.

**Forbidden (global)**:

- Arbitrary values (`w-[123px]`)
- `margin` for layout composition
- Raw colors
- `border` + `shadow` + colored `bg` all together (visual pollution)
- Nested elevated cards with identical styling
  </rule>

## Rule: HTTP Integration (API Client Contract)

<rule name="HttpIntegration">

> **UI never calls `fetch` directly. All HTTP flows through a single `apiClient` that returns `Result<T>`.**
> **UI is declarative — it displays state. It does not resolve problems.**

#### Architecture

```
Component (render + action)
  ↓
useApi hook (state: data / error / isLoading)   ← hooks/useApi.ts
  ↓
Service (fetch + transform → delivers View)
  ↓
apiClient (infra — only file that imports fetch)
```

**Error Boundaries vs `useApi` error state** — complementary, not alternatives:

| Mechanism            | Catches                                     | When to use                                |
| :------------------- | :------------------------------------------ | :----------------------------------------- |
| `useApi` error state | Expected API failures (404, 422, network)   | Always — standard flow                     |
| Error Boundary       | Unexpected render/runtime exceptions thrown | Wrap page-level components as a safety net |

`useApi` handles expected failures gracefully (shows error UI). Error Boundaries catch the unexpected (prevent a blank screen). Use both layers: `useApi` for the happy/failure path, Error Boundary as the outer safety net.

#### Core (always)

```ts
// 1. apiClient — production-grade: 204 safe, json-safe, single error shape
async function apiClient<T>(url: string, options?: RequestInit): Promise<Result<T>> {
  try {
    const response = await fetch(url, options);

    const hasContent = response.status !== 204;

    let body = null;

    if (hasContent) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    }

    const isError = !response.ok;

    if (isError) {
      const message = body?.error?.code || body?.error?.message || 'REQUEST_ERROR';
      const result = fail<T>(message);
      return result;
    }

    const data = body?.data ?? null;
    const result = ok<T>(data);
    return result;
  } catch {
    const result = fail<T>('NETWORK_ERROR');
    return result;
  }
}

// 2. Service — fetches and transforms; UI never sees raw domain types
async function getOrderView(id: string): Promise<Result<OrderView>> {
  const result = await apiClient<Order>(`/orders/${id}`, { method: 'GET' });

  if (result.isFailure) {
    return result;
  }

  const view = toOrderView(result.data!);
  const finalResult = ok(view);
  return finalResult;
}

// 3. View function — pure transformation, not a class or hook
function toOrderView(data: Order): OrderView {
  const view = {
    id: data.id,
    customerName: data.customer.name,
    totalLabel: `$${data.total}`,
  };
  return view;
}

// 4. useApi — standard state hook, lives in hooks/useApi.ts, reused across all components
function useApi() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function execute(promiseFn: () => Promise<Result<unknown>>) {
    setIsLoading(true);
    setError(null);

    const result = await promiseFn();

    if (result.isFailure) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setData(result.data);
    setIsLoading(false);
  }

  const state = { data, error, isLoading, execute };
  return state;
}

// 5. Component — render + named action only
function OrderPage({ id }: { id: string }) {
  const { data, error, isLoading, execute } = useApi();

  React.useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    await execute(() => getOrderView(id));
  }

  if (isLoading) {
    const view = <div>Loading...</div>;
    return view;
  }

  if (error) {
    const view = <div>Error: {error}</div>;
    return view;
  }

  if (!data) {
    const view = null;
    return view;
  }

  const view = (
    <div>
      <h1>Order #{data.id}</h1>
      <p>{data.customerName}</p>
      <p>{data.totalLabel}</p>
    </div>
  );

  return view;
}
```

#### Naming convention (component functions)

| Prefix     | Use                                   |
| :--------- | :------------------------------------ |
| `loadX`    | Initial data fetch on mount           |
| `refreshX` | Reload triggered by user action       |
| `submitX`  | Form submission or mutation           |
| `handleX`  | UI event handler (click, change, etc) |

#### Optional — add only when the pain is real

```ts
// Error mapping — only when the app has user-facing messages at scale
const ErrorMap: Record<string, string> = {
  ORDER_EMPTY: 'Pedido sem itens',
  NETWORK_ERROR: 'Erro de conexão',
};
const message = ErrorMap[error] ?? 'Erro inesperado';

// Cache as service decorator — zero impact on the rest of the architecture
const cache = new Map();
async function withCache<T>(key: string, fn: () => Promise<Result<T>>): Promise<Result<T>> {
  const cached = cache.get(key);
  if (cached) {
    const result = ok<T>(cached);
    return result;
  }
  const result = await fn();
  if (result.isSuccess) cache.set(key, result.data);
  return result;
}
// Usage: withCache(`order:${id}`, () => getOrderView(id))

// Normalization — only when backend shape is unreliable
function normalizeOrder(data: unknown): Order {
  const order = { id: (data as any).id, total: (data as any).total ?? 0 };
  return order;
}
```

#### Rules of gold

- `apiClient` is the only file that imports `fetch`
- `async/await` always — never `.then()`
- No `try/catch` in UI — `apiClient` owns all error handling
- `Result` stops at the service — never stored in component state
- Service delivers the View type — UI never transforms raw domain data
- View function = pure function (`toOrderView`) — not a class, hook, or layer
- State = three separate fields: `data / error / isLoading` — never one object
- `useApi` lives in `hooks/useApi.ts` — never duplicated per component
- `useEffect` triggers a named action only — no logic inline
- Every JSX return goes through a named variable (`const view = ...`) — Explaining Returns applies to components
- `result.data!` (non-null assertion after `isFailure` guard) is the accepted tradeoff — `Result<T>` types `data` as `T | undefined`; after the guard the value is guaranteed present but TypeScript cannot infer it without a type predicate

#### Anti-patterns

| ❌                                                      | Why                                               |
| ------------------------------------------------------- | ------------------------------------------------- |
| `fetch` in a component                                  | Bypasses error handling and coupling contract     |
| `useState<Result<T>>`                                   | Result is domain flow, not UI state               |
| Logic inside `useEffect` (`execute(async () => {...})`) | Breaks Stepdown and makes breakpoints impossible  |
| Transformation inside the component                     | Service owns the View contract                    |
| **Heavy ViewModel** (class, heavy hook)                 | Over-engineering — a pure function is enough      |
| State with extra fields (`flags`, `meta`, `status`)     | **Multiple sources of truth** (data dump)         |
| `return <div>...</div>` directly                        | Explaining Returns — always assign before return  |
| **Redundant Action** (CRUD / NONE)                      | meta.action is for server-driven UI state changes |
| `loading` bare noun in state                            | Boolean Prefixes — use `isLoading`                |
| **Structure Duplication** across layers                 | Keep DTOs proportional to their purpose           |
| **Overengineering** (premature abstraction)             | Rule of Three — wait for real pain                |

</rule>

## Rule: Self-Check (Mandatory Before Returning)

<rule name="SelfCheck">

Before returning any UI output, verify and auto-fix:

**Visual**

- Spacing value outside the allowed scale? → **FIX**
- Wrong color layer nesting (`elevated` inside `elevated`)? → **FIX**
- Base component used directly instead of project wrapper? → **FIX**
- Contrast issue (`muted` text on `muted` background)? → **FIX**
- Section structure doesn't match the spec's contract? → **FIX**
- Visual pollution (border + shadow + bg together)? → **SIMPLIFY**

**Color & Theme (OKLCH)**

- Raw color inline in JSX (`bg-[oklch(...)]`, `bg-white`, `bg-black`)? → **FIX** (use semantic or brand token)
- Dark mode hover goes darker instead of lighter (`dark:hover:bg-primary-600`)? → **FIX** (must be `dark:hover:bg-primary-400`)
- Design Contract not declared before code? → **STOP** and complete [Phase 0](../core/ui/design-thinking.md)
- 60-30-10 violated (secondary color dominates surface)? → **REDUCE** to accent-only usage
- `text-muted-foreground` on `bg-muted` or `bg-muted/40`? → **CHECK** Lightness delta: difference between L of text token and L of background token must be ≥ 40 percentage points. If below threshold → use `text-foreground` instead.

**Code**

- `fetch` used directly in a component? → **FIX** (move to `apiClient`)
- `Result` stored in component state (`useState<Result<T>>`)? → **FIX** (translate to `data / error / isLoading`)
- Logic or transformation inline inside `useEffect`? → **FIX** (extract named function)
- JSX returned without a named variable? → **FIX** (`const view = ...; return view;`)
  </rule>

</ruleset>

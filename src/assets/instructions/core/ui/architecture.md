# UI Architecture & Component DNA

> Aesthetic base: Bento Grid + Glassmorphism + Precision
> Styling: Utility-First CSS (Tailwind v4) + shadcn/ui
> Role: Create predictable, scalable, and clean UI systems

---

# PART I — CODE STRUCTURE (MANDATORY)

## C1. The ViewModel Law (Refined)

1. Keep components **declarative** (render only).
2. Move UI state, mapping, and conditional logic to a ViewModel (hook).
3. Pure transformations MUST live outside components.
4. Business/domain logic MUST NOT live in the ViewModel.
5. Exception: trivial components (\< ~10 lines, no logic) do not need ViewModel.

---

## C2. Pattern: ViewModel & Orchestration

```tsx
type Props = {
  user: User;
  isHighlighted?: boolean;
  isLoading?: boolean;
  error?: string | null;
};

export function UserCard(props: Props) {
  const vm = useUserCardVM(props);

  if (vm.isLoading) return <Skeleton />;
  if (vm.error) return <ErrorState message={vm.error} />;
  if (vm.isEmpty) return <EmptyState />;

  return (
    <Card className={vm.cardStyles}>
      <Avatar src={vm.avatarUrl} border={vm.statusColor} />
      <Title>{vm.title}</Title>
      <Timestamp>{vm.formattedDate}</Timestamp>
    </Card>
  );
}

function useUserCardVM({ user, isHighlighted, isLoading, error }: Props) {
  // UI STATE
  const isEmpty = !user;

  // DERIVED STATE
  const statusColor = user?.isActive ? 'border-chart-1' : 'border-muted';

  // TRANSFORMATIONS (pure)
  const formattedDate = user ? formatDate(user.createdAt) : null;

  return {
    isLoading,
    error,
    isEmpty,
    title: user?.name ?? '',
    avatarUrl: user ? resolveAvatar(user) : '',
    statusColor,
    formattedDate,
    cardStyles: cn('group transition-all', isHighlighted && 'ring-2'),
  };
}
```

---

## C3. Logic Separation (Critical)

- **ViewModel**
  - UI state (loading, empty, error)
  - derived state (isActive → color)
  - mapping (API → UI)

- **Domain (services)**
  - business rules
  - validations
  - calculations

- **Utils**
  - formatting (date, currency, string)

---

## C4. File & Export Convention

- Prefer **named exports**
- Step-down order:
  1. Main component
  2. ViewModel (hook)
  3. Private helpers

---

## C5. Anti-Patterns (Avoid)

- API calls inside components
- ViewModel as dumping ground
- Passing raw backend data directly to UI
- Inline ternaries with business meaning
- Styling logic scattered across JSX

---

## C6. Heuristic (Use or Not)

**Use ViewModel if:**

- There is conditional UI
- There is transformation
- There is reuse potential

**Avoid if:**

- Component is trivial
- Only displays props

---

## C7. State Management Strategy

Choose the right mechanism for the right scope. Never over-engineer state.

| State type           | Mechanism               | When to use                                                                             |
| :------------------- | :---------------------- | :-------------------------------------------------------------------------------------- |
| UI-only, isolated    | `useState` / hook local | Modals, toggles, form dirty state, accordion — not shared outside the component         |
| Shared UI state      | React Context           | Cross-component UI state with no business logic (e.g., theme, sidebar open)             |
| Server / remote data | React Query or SWR      | All data fetched from an API — handles caching, revalidation, loading, and error states |
| Global app state     | Zustand                 | App-wide state with frequent writes; avoid Redux unless the project already uses it     |

#### Rules

- **Never call APIs directly in components.** Always use a hook or React Query — components are consumers, not fetchers.
- **Avoid Context for server data.** React Query/SWR is the correct tool; Context causes stale data and manual invalidation.
- **Avoid Zustand for server data.** Use it only for client-side global state (e.g., authenticated user session, UI preferences).
- **Prop drilling up to 2 levels is acceptable.** Reach for Context or Zustand only when drilling exceeds 2 levels or the state is shared across unrelated subtrees.

---

# PART II — SPACING SYSTEM (L1–L4)

## U1. Hierarchy of Gaps

| Level | Category | Example     | Usage                        |
| ----: | -------- | ----------- | ---------------------------- |
|    L1 | Internal | p-1, gap-2  | Button padding, icon spacing |
|    L2 | Siblings | p-4, gap-4  | Elements inside cards        |
|    L3 | Sections | p-8, gap-12 | Blocks, grid spacing         |
|    L4 | Page     | py-24, px-6 | Page breathing space         |

---

# PART III — AI AGENT CHECKLIST

## Code Integrity

- [ ] Component is declarative (no heavy logic in JSX)
- [ ] ViewModel encapsulates UI logic and mapping
- [ ] No business logic in ViewModel
- [ ] Named exports used
- [ ] Helpers are below main component

## Visual Integrity

- [ ] Spacing follows L1–L4 hierarchy
- [ ] Mobile-first respected
- [ ] Loading / Empty / Error states handled

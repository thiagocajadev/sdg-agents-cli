# Code Style — Aesthetics and Scannability

<ruleset name="Code Style & Aesthetics">

> [!NOTE]
> This is the visual "Gabarito" of the project. Aesthetics are not optional; they are a direct indicator of software quality and discipline.
> For naming rules (taboos, booleans, verb taxonomy, file naming), refer to [Naming Discipline](.ai/instructions/core/naming.md).
> For SQL-specific aesthetics, refer to [SQL Style](.ai/instructions/core/sql-style.md).

## Rule: Vertical Scansion & Density

<rule name="VerticalScansion">

> [!IMPORTANT]
> Code must be optimized for vertical reading (scansion). Horizontal scrolling is a failure.

#### Principles

- **One Instruction per Line**: Avoid chaining multiple operations on the same line.
- **Vertical Density**: Indent parameters, conditions, and list items vertically to allow the eye to scan without jumping left-to-right.
- **Compact Logic Blocks**: Keep related operations close, but separate them with single blank lines to indicate a "Narrative Paragraph" change.

#### Bad vs Good

````carousel
```typescript
// ❌ BAD: Horizontal Density — three conditions chained on one line
if (user.isActive && user.hasRole('ADMIN') && user.permissions.includes('DELETE')) {
  deleteRecord(id);
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Vertical Scansion — each condition is its own scannable line
const canDelete =
  user.isActive &&
  user.hasRole('ADMIN') &&
  user.permissions.includes('DELETE');

if (canDelete) {
  deleteRecord(id);
}
```
````

</rule>

## Rule: Code Anatomy (Narrative Cascade)

<rule name="NarrativeCascade">

> [!NOTE]
> Functions should be read like a story, from high-level to detail.

- **Stepdown Rule**: Higher-level functions appear at the top of the file; lower-level helpers go to the bottom.
- **Guard Clauses**: Prefer early returns over nested conditionals. Kill the "Arrow Antipattern".
- **Explaining Returns**: The final value must be assigned to a named variable before returning — `const result = ...; return result;`. Never return large anonymous objects or inline ternaries.
- **Narrative Siblings (Local Helpers)**: If a helper is only used by one function, define it as a local (non-exported) sibling immediately following its caller to maintain clean top-down scannability.
- **Strategy over Switch**: Replace large `switch` or `if/else` chains with **Strategy Objects** (Maps) to separate data/logic from orchestration (SLA).

#### Strategy Patterns (vs Switch-Bombing)

> [!TIP]
> Use Lookup Maps to maintain high technical density and low visual noise.

````carousel
```typescript
// ❌ BAD: Switch-Bombing — high visual noise, repeats logic structure
function getStatusLabel(status) {
  switch (status) {
    case 'active': return 'User is Active';
    case 'pending': return 'Waiting Approval';
    case 'banned': return 'Access Denied';
    default: return 'Unknown';
  }
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Strategy Map — clean data/logic separation (SLA)
function getStatusLabel(status) {
  const STATUS_LABELS = {
    active: 'User is Active',
    pending: 'Waiting Approval',
    banned: 'Access Denied',
  };

  const label = STATUS_LABELS[status] ?? 'Unknown';
  return label;
}
```
````

#### Explaining Returns & Dedent

> [!IMPORTANT]
> Large template literals MUST be assigned to an "explaining const" and use the **dedent** utility to maintain vertical scansion in the source code.

````carousel
```typescript
// ❌ BAD: Bare Template Return — messy indentation in source
function buildWelcome(name) {
  return `
Welcome, ${name}!
    Let's get started.
  `;
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Explaining Return + Dedent — readable source and output
import dedent from 'dedent';

function buildWelcome(name) {
  const welcomeMessage = dedent`
    Welcome, ${name}!
    Let's get started.
  `;

  return welcomeMessage;
}
```
````

#### Guard Clauses

````carousel
```typescript
// ❌ BAD: "Arrow Antipattern" — logic buried inside nested else branches
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      // business logic...
    } else {
      throw new Error('No items');
    }
  }
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Guard Clauses — happy path always flows at the top level, uninterrupted
function processOrder(order) {
  if (!order) return;
  if (order.items.length === 0) throw new Error('No items');

  // business logic flows here...
}
```
````

#### Explaining Returns

````carousel
```typescript
// ❌ BAD: Anonymous inline return — caller must guess the contract shape
function buildUserCard(user) {
  return {
    display: `${user.firstName} ${user.lastName}`,
    isAdmin: user.roles.includes('ADMIN'),
    avatar: user.avatarUrl ?? '/default.png',
  };
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Named variable — contract is explicit and type-annotatable at the boundary
function buildUserCard(user) {
  const userCard = {
    display: `${user.firstName} ${user.lastName}`,
    isAdmin: user.roles.includes('ADMIN'),
    avatar: user.avatarUrl ?? '/default.png',
  };
  return userCard;
}
```
````

#### Narrative Siblings

````carousel
```typescript
// ❌ BAD: Helper nested inside parent — creates nesting debt and complicates maintenance
export function buildOrderSummary(order) {
  function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
  }

  const summary = { total: formatCurrency(order.total) };
  return summary;
}
```
<!-- slide -->
```typescript
// ✅ GOOD: Helper defined as local sibling — maintains Stepdown Rule and flat structure
export function buildOrderSummary(order) {
  const summary = { total: formatCurrency(order.total) };
  return summary;
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
```
````

</rule>

</ruleset>

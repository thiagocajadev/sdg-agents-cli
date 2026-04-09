# Vertical Slice Architecture (Agnostic Staff Ruleset)

<ruleset name="VerticalSliceArchitecture">

> [!IMPORTANT]
> This architecture MANDATORY follows the [Universal Staff Engineering DNA](../core/staff-dna.md). All rules regarding Security (Hardening), Reliability (Resilience), and Narrative (NarrativeCascade) are inherited from the DNA.

## Mandatory Backend Pipeline

### Rule: Backend Pipeline

> <rule name="BackendPipeline">
> [!NOTE]
> Every backend feature MUST follow this exact flow. No reordering.

#### Pipeline Flow

```text
Endpoint/Handler → UseCase → Validator → Domain → Repository → Presenter → Response DTO
```

#### Layer Responsibilities

- **Endpoint/Handler:** HTTP entry point. Calls UseCase. NO business logic.
- **UseCase:** Orchestrates the feature flow. Calls Validator → Domain → Repository.
- **Validator:** Validates input structure. Runs BEFORE Domain.
- **Domain:** Business rules. MUST NOT depend on infrastructure.
- **Repository:** Persistence only. NO business logic.
- **Presenter:** Maps domain entity → Response DTO. Filters sensitive data.
- **Response DTO:** External output contract. NO logic.
  > </rule>

## Mandatory Frontend Pipeline

### Rule: Frontend Pipeline

> <rule name="FrontendPipeline">
> [!NOTE]
> Every frontend feature MUST follow this flow when consuming APIs.

#### Pipeline Flow

```text
UI → ApiClient → Mapper
```

#### Layer Responsibilities

- **ApiClient:** Low-level HTTP calls. Handles headers, base URL. NO business logic.
- **Mapper:** Maps raw API response → UI model (DTO). Isolates UI from API changes.
- **UI:** Receives only mapped data. NEVER accesses ApiClient directly.
  > </rule>

## Vertical Slice Directory Structure

### Rule: Directory Structure

> <rule name="DirectoryStructure">
> [!NOTE]
> Organize the project by features (Domain), not by technical layers.

#### Structure Example

```text
/features/{feature-name}/
  {feature}.handler.ts       ← HTTP entry point
  {feature}.usecase.ts       ← orchestrator
  {feature}.validator.ts     ← input validation
  {feature}.domain.ts        ← business rules
  {feature}.repository.ts    ← persistence
  {feature}.presenter.ts     ← output mapping
  {feature}.dto.ts           ← contracts
```

> </rule>

## Rule: Domain Layer Implementation

<rule name="DomainImplementation">

> [!NOTE]
> Business rules live exclusively in the Domain layer. Two implementation styles are valid — choose based on complexity.

### Style A — Rich Entity (class with invariants)

Preferred when the entity enforces its own state transitions and invariants.

```typescript
// order.domain.ts
export class Order {
  private constructor(
    readonly id: string,
    readonly status: 'pending' | 'shipped' | 'cancelled',
    readonly items: OrderItem[]
  ) {}

  static create(items: OrderItem[]): Result<Order> {
    if (items.length === 0) return fail('ORDER_EMPTY');
    return ok(new Order(uuid(), 'pending', items));
  }

  cancel(): Result<Order> {
    if (this.status === 'shipped') return fail('CANNOT_CANCEL_SHIPPED');
    return ok(new Order(this.id, 'cancelled', this.items));
  }
}
```

### Style B — Pure Functions (types + functions)

Preferred for simpler domains or functional-leaning stacks. Properties are defined as types in the same file.

```typescript
// order.domain.ts

// Internal domain types (≠ external DTOs)
export interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'cancelled';
  items: OrderItem[];
}

// Functions that operate on those types
export function createOrder(items: OrderItem[]): Result<Order> {
  if (items.length === 0) return fail('ORDER_EMPTY');
  return ok({ id: uuid(), status: 'pending', items });
}

export function cancelOrder(order: Order): Result<Order> {
  if (order.status === 'shipped') return fail('CANNOT_CANCEL_SHIPPED');
  return ok({ ...order, status: 'cancelled' });
}
```

**Internal types vs external DTOs:**

| Type                             | Owner                                 | File                                   |
| :------------------------------- | :------------------------------------ | :------------------------------------- |
| Domain entity (`Order`)          | Internal — real shape with all fields | `order.domain.ts`                      |
| Response DTO (`OrderResponse`)   | External API contract                 | `order.dto.ts` via Presenter           |
| Input DTO (`CreateOrderRequest`) | Validated entry contract              | `order.dto.ts` or `order.validator.ts` |

The Presenter maps `Order → OrderResponse` — sensitive or internal fields never reach the client.

**Both styles:** zero infrastructure dependencies, fully testable without DB or HTTP mocks.
</rule>

## Rule: Layer Isolation & Validation

- **Layer Isolation:** Each layer has a single responsibility. Mixing responsibilities breaks the architecture.
- **Data Shielding:** Raw database entities MUST NEVER be returned to the client. The Presenter is the mandatory filter.
- **Validate Before Domain:** Reject invalid input at the Validator before the Domain ever sees it (Fail Fast).
- **Statelessness:** Design logic to be horizontally scalable and resilient to retries.
- **Dependency Inversion:** Use Interfaces/Abstractions to create "Seams" for testing.

## Summary: DO and DO NOT

> <rule name="SummaryDoDont">

### ✅ DO

- Validate input BEFORE reaching Domain.
- Keep business rules exclusively in Domain.
- Sanitize all output through the Presenter.
- Organize code by feature slice.

### ❌ DO NOT

- Put business logic in Handler/Endpoint.
- Access Repository from Handler or Domain directly.
- Skip the Validator step.
- Return database entities directly to the client.

> [!WARNING]
> **Conflict resolution:** DO NOT rules ALWAYS override DO rules.
> </rule>

</ruleset>

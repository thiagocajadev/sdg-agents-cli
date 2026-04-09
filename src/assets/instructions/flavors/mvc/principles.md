# MVC Architecture Principles (Agnostic Staff Ruleset)

<ruleset name="MVCArchitecture">

> [!IMPORTANT]
> This architecture MANDATORY follows the [Universal Staff Engineering DNA](../core/staff-dna.md). All rules regarding Security (Hardening), Reliability (Resilience), and Narrative (NarrativeCascade) are inherited from the DNA.

## Mandatory MVC Pipeline

### Rule: MVC Pipeline

> <rule name="MVCPipeline">
> [!NOTE]
> Every MVC feature MUST follow this exact flow. Selection depends on the output type (API vs SSR).

#### API Pipeline

```text
Request → Controller → Service → Repository → Response
```

#### SSR / Legacy (Razor) Pipeline

```text
Request → Controller → Service → Repository → Mapper → ViewModel → View
```

#### Layer Responsibilities

- **Controller:** HTTP entry point. Receives Request, calls Service, and returns formatted Response or View.
- **Service:** Business orchestration layer. Returns a `Result<T>`.
- **Repository:** Handles persistence only. Returns raw entities.
- **Response / ViewModel:** Defines the external contract. Raw entities are NEVER exposed.
  > </rule>

## Rule: Thin Controllers & Services

> <rule name="ThinLayers">
> [!NOTE]
> Both layers must remain thin. High complexity logic (The How) is delegated to helper functions or Domain Entities.

#### Flow Standards

- **Orchestration:** Controllers receive Request → Call Service → Map Result → Return.
- **Business Flow:** Services receive Clean Data → Orchestrate Domain/Repo → Return Result. NO technical noise.
- **Thin Services:** Avoid "God Services". Split into specific Use Cases if logic grows.
- **Validation Extraction:** Structural validation belongs in DTOs or dedicated Validators.

### ❌ BAD Example: Controller with business logic

```javascript
async function updateOrderController(req, res) {
  // req/res — ambiguous; prefer request/response
  const order = await db.orders.findById(req.params.id); // DB call in Controller — belongs in Repository
  if (!order) return res.status(404).json({ error: 'Not found' }); // business rule in Controller + wrong envelope

  if (order.status === 'shipped') {
    return res.status(422).json({ error: 'Cannot update shipped order' }); // domain rule leaked here
  }

  order.item = req.body.item; // mutation on raw entity — no domain method, no invariant enforcement
  await db.orders.save(order); // bypasses Repository abstraction
  return res.json(order); // raw entity leaked — no OutputFilter, no DTO
}
```

> </rule>

## Standard MVC Directory Structure

### Rule: MVC Structure

> <rule name="MVCDirectoryStructure">
> [!NOTE]
> Follow a predictable layout organized by technical layer.

```text
/controllers     ← HTTP entry points (thin)
/services        ← business orchestration and validation
/repositories    ← persistence (DB queries only, no try/catch)
/dtos            ← Request and Response contracts
/viewmodels      ← View-specific data structures (SSR only)
/views           ← Shells for rendering (SSR only, no logic)
/models          ← internal data structures (never exposed directly)
/infrastructure  ← DB connection, global exception handler, auth middleware
```

> </rule>

## Rule: Views as Shells (SSR/Legacy Rule)

> <rule name="ViewsAsShells">
> [!IMPORTANT]
> Views (Razor, Blade, Twig) MUST be logic-less shells. All data decisions must be made in the Mapper/ViewModel.

#### Instructions

- **Zero Logic:** No `if` blocks for business rules inside the template. The ViewModel must provide boolean flags (e.g., `model.IsEditable`).
- **No Raw Entities:** Never pass a database entity directly to a View. Map it to a ViewModel first.
- **Pre-formatted Data:** Dates, currencies, and complex strings must be formatted in the Mapper, not the View.
  > </rule>

## Summary: DO and DO NOT

> <rule name="MVCSummary">

### ✅ DO

- Validate input structure before calling the Service.
- Map all output through Response DTOs.
- Use Repository abstraction for all DB access.

### ❌ DO NOT

- Put business logic in Controllers.
- Access Repository directly from Controllers (bypass Service).
- Return raw entities to the client.
- Mix HTTP concerns with business logic in Services.

> [!WARNING]
> **Conflict resolution:** DO NOT rules ALWAYS override DO rules.
> </rule>

</ruleset>

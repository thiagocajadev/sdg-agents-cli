# Legacy Architecture Principles (Agnostic Staff Ruleset)

<ruleset name="LegacyArchitecture">

> [!IMPORTANT]
> This architecture MANDATORY follows the [Universal Staff Engineering DNA](../core/staff-dna.md). All rules regarding Security (Hardening), Reliability (Resilience), and Narrative (NarrativeCascade) are inherited from the DNA.

## Standard Legacy Pipeline

<rule name="LegacyPipeline">

> [!NOTE]
> Every Legacy/Desktop feature MUST follow this exact flow to ensure data shielding.

#### Pipeline Flow

```text
Request → UI (Event) → Service → Repository → UI (Response)
```

#### Layer Responsibilities

- **UI (Event):** The entry point where user interaction occurs. It creates the initial Request.
- **Service (BLL):** Business orchestration layer. It receives clean Data/DTOs and coordinates the logic.
- **Repository (DAL):** Handles persistence and raw SQL/PROCS only. Returns raw entities or DataTables.
- **UI (Response):** The final step where the Service delivers pre-mapped DTOs back to the "Passive View".
  </rule>

## Rule: Passive View (Presenter Pattern)

<rule name="PassiveViewPattern">

> [!IMPORTANT]
> The UI file (.vb, .cs, .java) must be a "Mute Shell". It only displays what the Service provides.

- **No Business Logic in UI**: Never implement calculations or data decisions inside UI event handlers (e.g., `button_Click`).
- **Mapped DTOs**: The Service MUST return a DTO/ViewModel already formatted for the UI. The UI should only do `grid.DataSource = result.value`.
- **No Raw DataSets**: Never pass a `DataSet` or `DataTable` directly to the UI. Map it inside the Service/BLL loop.
  </rule>

## Rule: Service Responsibility (Anti-God-Object)

<rule name="LegacyServiceResponsibility">

> [!NOTE]
> Services in legacy projects often grow too large. Keep them granular.

- **NarrativeCascade**: The Service tells the story — entry point first, orchestration above implementation. Each method either orchestrates or implements, never both. See `NarrativeCascade` → [Engineering Standards](../../core/engineering-standards.md).
- **Delegation**: Use specific Service classes per feature area (Vertical Slice approach) to avoid monolithic files.
  </rule>

## Rule: SQL Hardening (Legacy Specific)

<rule name="LegacySQLHardening">

> [!IMPORTANT]
> Security is the top priority in legacy data access.

- **100% Parameterization**: Never use string concatenation for SQL. Use the database-specific parameter objects.
- **Encapsulated Repositories**: All SQL/Procs must live in a Repository, never leaked to the Service or UI.
- **Vertical Formatting**: Follow the SQL Strategy defined in the DNA for all raw queries.
  </rule>

</ruleset>

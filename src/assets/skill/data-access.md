# Data Access — Performance, Safety, and Scalability

<ruleset name="Data Access Standards">

> [!NOTE]
> Universal rules for database interaction focusing on infrastructure, performance, and result orchestration.
> Load in **Phase CODE** when touching repositories, DB connections, queries, or transactions.
> For SQL scansion, indentation, and aesthetic standards, refer to `.ai/skill/sql-style.md`.

## Rule: Result-Driven Repositories

<rule name="ResultDrivenRepos">

> [!IMPORTANT]
> Repositories MUST return `Result<T>`. Infrastructure failures (timeouts, constraints) are business values, not exceptions.

#### Instructions

- **Explicit Success/Failure**: Every data-access method returns `ok(data)` or `fail(ERROR_CODE)`.
- **No try/catch in Domain**: Domain layers orchestrate failures via `if (result.isFailure)` rather than catching infrastructure exceptions.
- **Consistent Error Codes**: Map database-specific errors (e.g., `PK_VIOLATION`) to domain-agnostic codes (e.g., `CONFLICT`) before returning.
  </rule>

## Rule: Connection Management

<rule name="ConnectionManagement">

> [!IMPORTANT]
> Connections are expensive resources. Pool them, scope them, and release them fast.

#### Instructions

- **Connection Pooling**: Always use connection pooling. Configure pool size based on expected concurrency.
- **Short-Lived Connections**: Open late, close early. Never hold a connection across user interactions or request boundaries beyond the scope.
- **Health Checks**: Enable connection pool health checks to evict stale or broken connections automatically.
  </rule>

## Rule: Query Performance & Pagination

<rule name="QueryPerformance">

> [!IMPORTANT]
> Every query that hits production must be intentional, indexed, and bounded.

#### Instructions

- **No SELECT \***: Always project only the columns you need.
- **N+1 Prevention**: Detect and eliminate N+1 query patterns. Use eager loading or batch fetching.
- **Cursor-Based Pagination**: Mandatory for large or real-time datasets. Use `LIMIT/OFFSET` only for small datasets or admin backoffices.
- **Query Analysis**: Use `EXPLAIN`/`EXPLAIN ANALYZE` on any query touching tables with >10k rows.
  </rule>

## Rule: Vertical Density & Storytelling SQL

<rule name="VerticalDensitySQL">

> [!NOTE]
> Database interactions must follow the **SDG Linear Flow Style** as defined in `.ai/skill/sql-style.md`.

#### Instructions

- **Join Ordering (Mandatory First)**: Group all mandatory relations (`JOIN`) first, followed by optional relations (`LEFT JOIN`).
- **Qualified Identifiers**: ALWAYS use `TableName.ColumnName` to ensure clarity of origin.
- **Anti-Subquery (Temp Tables)**: Avoid complex nested subqueries. Favor `TEMPORARY TABLES` (#TempTable) for building complex results in sequential steps.
- **Identity Alignment**: Use trailing conjunctions (`AND`, `OR`) and commas (`,`) at the end of the line.
  </rule>

## Rule: Stored Procedure Naming (SP\_ Prefix)

<rule name="StoredProcedureNaming">

> [!IMPORTANT]
> Stored Procedures must follow a strict taxonomy: `SP_{CONTEXT}_{ACTION}_{SUBJECT}`.

#### Contexts & Actions

- **Contexts**: `SYS` (Core), `ADM` (Admin), `SEC` (Security), `HIS` (Audit), `INT` (Integration).
- **Actions**: `GET_ONE`, `GET_ALL`, `INSERT`, `DELETE`, `UPDATE`, `UPSERT`, `PROC/SP`, `SYNC`, `VALIDATE`.
  </rule>

## Rule: Infrastructure Insulation (Caching)

<rule name="CachingInsulation">

> [!NOTE]
> Caching is an infrastructure concern. Treat it as ephemeral and lossy.

#### Instructions

- **Cache as Decorator**: Caching logic must be implemented as a decorator/interceptor around the repository. Never mix business logic with TTL/Key management.
- **TTL Mandatory**: Every entry must expire.
  </rule>

## Rule: Data Integrity & Transactions

<rule name="DataIntegrity">

> [!IMPORTANT]
> Application logic fails. Database constraints don't. Push invariants as close to the data as possible.

#### Instructions

- **Foreign Keys**: Enforce referential integrity via foreign key constraints.
- **NOT NULL by Default**: Columns should be `NOT NULL` by default.
- **Transaction Boundaries**: Scope minimally. Exactly one unit of work — no more.
- **No I/O Inside Transactions**: Never call external APIs or perform file I/O inside a database transaction.
  </rule>

## Rule: Resource Hygiene (Cleanup)

<rule name="ResourceHygiene">

> [!TIP]
> Procedural SQL must be self-healing and hygienic.

- **Idempotency Phase**: Always check if a temporary table exists and drop it before creation (`IF OBJECT_ID... DROP`).
- **Cleanup Phase**: Always explicitly drop temporary tables at the end of the script to free resources immediately.
  </rule>

</ruleset>

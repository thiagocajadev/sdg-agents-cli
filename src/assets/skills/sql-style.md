# SQL Style — SDG Linear Flow

<ruleset name="SQLStyleAesthetics">

> Load in Phase CODE when writing, reviewing, or refactoring SQL.
> For structural data access rules (pooling, transactions, indexes), see `.ai/skills/data-access.md`.

## SDG Linear Flow (Keyword Alignment)

Left-Edge Table Pattern + Trailing Conjunctions:

- **Keywords (L0)**: `SELECT`, `FROM`, `JOIN`, `WHERE`, `GROUP BY`, `ORDER BY` on own lines
- **Left-Edge Subjects (L0)**: Table names and `(` at left margin
- **Indented Content (L1)**: Fields, values, aliases indented one level
- **Trailing Conjunctions**: `AND`, `OR`, `,` at END of line — never leading
- **Qualified Identifiers**: Always `Table.Column` — never bare columns
- **Temp Suffix**: `...Temp` alias for subqueries used in JOINs

```sql
-- ✅ SDG Linear Flow
SELECT
  Users.Id,
  Users.Name
FROM
Users
WHERE
  Users.IsActive = 1 AND
  Users.Age > 18
ORDER BY
  Users.Name ASC;

-- ✅ JOIN with subquery (Temp Suffix)
SELECT
  Users.Name,
  OrdersTemp.Total
FROM
Users
JOIN (
  SELECT
    Orders.UserId,
    Orders.Total
  FROM
  Orders
  WHERE
    Orders.Status = 'CONFIRMED'
) OrdersTemp ON
  OrdersTemp.UserId = Users.Id
WHERE
  Users.IsActive = 1
ORDER BY
  Users.Name ASC;
```

## Rule of 3 (Inline Exception)

- Single-line SQL permitted only when ≤3 fields AND ≤1 condition
- If inline forces horizontal scrolling → refactor to Linear Flow

```sql
-- ✅ Inline OK for trivial ops
DELETE FROM Logs WHERE Logs.Id = 123;
```

## Query Discipline

- **Early filtering**: `WHERE` before joins; narrow driving table first.
- **Descriptive aliases**: by domain (`Orders`, `Users`), not letters.
- **Named parameters**: `@orderId` / `:user_id` — never inline literals.
- **Explicit `ORDER BY`**: always state the column.
- **No `SELECT *`**: see `data-access.md`.

## CTE vs Temp Table

- **CTE (`WITH`)**: single-read derivation — prefer for readability.
- **Temp Table (`#Temp`)**: multi-read reuse, indexed intermediate, perf-critical.
- **Promote CTE → Temp**: when read >1× or benefits from index.

## Multi-Row INSERT (Vertical Layout)

INSERT with 4+ fields follows Left-Edge Pattern:

```sql
INSERT INTO Orders (
  UserId,
  Status,
  Total,
  CreatedAt
)
VALUES (
  42,
  'PENDING',
  199.90,
  NOW()
);
```

</ruleset>

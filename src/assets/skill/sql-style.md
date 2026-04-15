# SQL Style — SDG Linear Flow

<ruleset name="SQLStyleAesthetics">

> [!NOTE]
> SQL is a narrative. Every query must be scannable top-to-bottom, with no horizontal scrolling.
> Load in **Phase CODE** when writing, reviewing, or refactoring SQL queries.
> For structural data access rules (pooling, transactions, indexes, repositories), refer to the [Data Access skill](.ai/skill/data-access.md).

## Rule: SDG Linear Flow (Keyword Alignment)

<rule name="SDGLinearFlowSQL">

> [!IMPORTANT]
> Use the **Left-Edge Table Pattern** and **Trailing Conjunctions**.

#### Instructions

- **Keywords (L0)**: `SELECT`, `FROM`, `JOIN`, `WHERE`, `GROUP BY`, `ORDER BY` on their own lines.
- **Left-Edge Subjects (L0)**: Table names and opening parentheses `(` sit at the left margin.
- **Indented Content (L1)**: Fields, values, and aliases indented one level.
- **Trailing Conjunctions**: `AND`, `OR`, and `,` at the **END** of the line — never leading.
- **Qualified Identifiers**: Always use `TableName.ColumnName` — never bare column names.
- **Temp Suffix**: Always use `...Temp` alias for subqueries used in JOINs.

#### Simple SELECT

````carousel
```sql
-- ❌ BAD: Compact and unaligned — hidden conditions, impossible to extend safely
SELECT u.id, u.name FROM Users u WHERE u.active = 1 AND u.age > 18;
```
<!-- slide -->
```sql
-- ✅ GOOD: SDG Linear Flow — each clause is a scannable paragraph
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
```
````

#### JOIN with Subquery (Temp Suffix)

````carousel
```sql
-- ❌ BAD: Inline JOIN with single-letter alias — origin of every column is ambiguous
SELECT u.Name, o.Total FROM Users u JOIN Orders o ON u.Id = o.UserId WHERE u.IsActive = 1;
```
<!-- slide -->
```sql
-- ✅ GOOD: Subquery aliased as ...Temp — column origin is explicit at every line
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
````

</rule>

## Rule: Pragmatic "Rule of 3" (Inline Exception)

<rule name="RuleOf3SQL">

> [!TIP]
> Pragmatism over Dogmatism. Small operations remain small.

- **Inline Exception**: Single-line SQL is permitted only when it contains at most **3 fields** and **1 condition**.
- **Scroll Bound**: If an inline instruction forces horizontal scrolling, it MUST be refactored to Linear Flow.

````carousel
```sql
-- ❌ BAD: Too many fields inline — unreadable and fragile to extend
INSERT INTO Logs (Type, UserId, Message, CreatedAt, Severity) VALUES ('ERROR', 1, 'Failed', NOW(), 5);
```
<!-- slide -->
```sql
-- ✅ GOOD: Inline only for trivial operations (1–3 fields, 1 condition)
DELETE FROM Logs WHERE Logs.Id = 123;
```
````

</rule>

## Rule: Multi-Row INSERT (Vertical Layout)

<rule name="MultiRowInsert">

> [!NOTE]
> INSERT statements with 4+ fields follow the same Left-Edge Pattern as SELECT.

````carousel
```sql
-- ❌ BAD: All fields and values on one line — unreadable and fragile to extend
INSERT INTO Orders (UserId, Status, Total, CreatedAt) VALUES (42, 'PENDING', 199.90, NOW());
```
<!-- slide -->
```sql
-- ✅ GOOD: Fields and values aligned vertically — each field is its own scannable line
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
````

</rule>

</ruleset>

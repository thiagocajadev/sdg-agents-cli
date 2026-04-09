# SQL — Project Conventions

> Universal principles are in `../../core/staff-dna.md` and `../../core/data-access.md`.
> This file contains only decisions specific to the data layer and SQL usage.

<ruleset name="SqlConventions">

## Error Handling

- **Strategy**: Errors handled in the application, not in the query
- **Propagation**: SQL returns an error → application decides the next action
- **Never**: Hide errors with SQL logic; use SQL for complex business rules

---

## Query Design

- Explicit and readable queries — no "magic queries"
- Vertical style: break at each keyword (`SELECT`, `FROM`, `WHERE`, `JOIN`, etc.)
- Avoid unnecessary subqueries; prefer CTEs for clarity
- Temporary tables inside procedures/functions when necessary for readability
- Avoid unnecessary nesting

### CTE for Clarity

> <rule name="SqlCTE">

```sql
WITH regional_sales AS (
    SELECT region, SUM(amount) AS total_sales
    FROM orders
    GROUP BY region
), top_regions AS (
    SELECT region
    FROM regional_sales
    WHERE total_sales > (SELECT SUM(total_sales)/10 FROM regional_sales)
)
SELECT * FROM top_regions;
```

> </rule>

---

## Naming

- Tables: `snake_case`, plural (`users`, `order_items`)
- Columns: `snake_case`
- PK: `id`
- FK: `<entity>_id` (`user_id`, `order_id`)
- Stored Procedures: `sp_<action_name>` (`sp_get_active_users`)
- Functions: `fn_<action_name>` (`fn_calculate_total`)
- Views: `vw_<view_name>` (`vw_order_summary`)
- Indexes: `idx_<table_name>_<column_names>`

---

## Migrations

- Versioned with timestamp (`20240301_add_users_index.sql`)
- Always forward-only — never edit existing migrations
- Idempotent when possible (`IF NOT EXISTS`, `CREATE INDEX CONCURRENTLY`)
- Expand-contract for zero-downtime: add before removing

---

## Performance

- Indexes based on actual usage (real queries, not anticipation)
- Avoid `SELECT *` — project only required columns
- Analyze execution plan before optimizing
- Mandatory pagination for large lists (keyset/cursor, not OFFSET for high volumes)

---

## Data Integrity

- Database constraints as the last line of defense:
  - `NOT NULL` for required fields
  - `FOREIGN KEY` for referential integrity
  - `UNIQUE` for uniqueness
- Do not rely solely on the application to ensure integrity

---

## Transactions

- Use only when strictly necessary
- Minimum possible scope — open late, close early
- Avoid long locks that block other operations

---

## Security

- Always use parameters (bind variables) — never concatenate strings for SQL
- Access control managed by the application
- Principle of least privilege for database users

---

## SQL-Specific Delta

- SQL is for **data**, not for business orchestration
- Avoid complex business logic in stored procedures — hinders testing and maintenance
- Prefer simplicity and predictability over "premature optimizations"
- Queries must be easy to read, maintain, and test

</ruleset>

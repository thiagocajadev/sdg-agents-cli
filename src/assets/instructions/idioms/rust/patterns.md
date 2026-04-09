# Rust — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="RustConventions">

## Error Handling

- **Strategy**: `Result<T, E>` as the absolute standard; `panic!` only for unrecoverable bugs
- **Propagation**: `?` for simple propagation; wrapping with context when necessary
- **Domain errors**: Typed `enum` with `thiserror`; implement `Display` + `Debug`; `anyhow::Result` at the application level
- **Never**: `panic!` for business rules; `.unwrap()` / `.expect()` outside of tests/prototypes; swallow errors
- **Global Handling**: HTTP handler converts `Result` → response; structured logging (`tracing`)

### Result Pattern (Enums + thiserror)

> <rule name="ResultPatternRust">

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum OrderError {
    #[error("User not found: {0}")]
    UserNotFound(String),
    #[error("Insufficient balance: need {needed}, have {available}")]
    InsufficientBalance { needed: f64, available: f64 },
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

pub async fn create_order(user_id: &str, amount: f64) -> Result<Order, OrderError> {
    let user = find_user(user_id).await?;
    let balance = check_balance(&user).await?;

    if balance < amount {
        return Err(OrderError::InsufficientBalance { needed: amount, available: balance });
    }

    save_order(&user, amount).await
}
```

> </rule>

---

## HTTP & API

- **Framework**: Axum (preferred) or Actix Web
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature/module; avoid excessive centralization
- **Middleware/hooks**: Auth via middleware/layer; validation at the boundary; logging/tracing in the pipeline
- **DI**: Explicit dependency passing via structs; `Arc` when necessary; avoid containers

### Traits as Contracts

> <rule name="TraitDesign">
> One trait per behavior. `impl Trait` over `dyn Trait` unless dynamic dispatch is strictly required.

```rust
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: &str) -> Result<Option<User>, DbError>;
    async fn save(&self, user: &User) -> Result<(), DbError>;
}

pub struct OrderService<R: UserRepository> {
    users: R,
}
```

> </rule>

---

## Testing

- **Framework**: built-in (`cargo test` + `#[cfg(test)]`)
- **Style**: Tests close to the code; `#[tokio::test]` for async
- **Naming**: `should_do_x_when_y`
- **Mocks**: Real implementations or simple traits; mock only external I/O
- **What to test**: Business rules, error flows (`Result`), contracts

### Unit Testing

> <rule name="RustTesting">

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_should_return_sum() {
        assert_eq!(add(2, 3), 5);
    }

    #[tokio::test]
    async fn create_order_should_fail_on_insufficient_balance() {
        let result = create_order("user-1", 9999.0).await;
        assert!(matches!(result, Err(OrderError::InsufficientBalance { .. })));
    }
}
```

> </rule>

---

## Types & Contracts

- **struct** for data; **trait** for contracts
- `Option<T>` and `Result<T, E>` in place of null/exceptions
- `serde` for DTO serialization; never expose internal structs directly
- Validation at the boundary (request parsing); strong types + explicit validation

### Ownership & Borrowing

> <rule name="OwnershipBorrowing">
> Prefer `&T`, `&mut T`. Clone only when strictly necessary.

```rust
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

fn normalize_path(path: &str) -> Cow<'_, str> {
    if path.starts_with('/') { Cow::Borrowed(path) }
    else { Cow::Owned(format!("/{path}")) }
}
```

> </rule>

---

## Rust-Specific Delta

- Ownership and borrowing respected — no unnecessary clones, no lifetime workarounds
- `match` explicit and exhaustive; no catch-all `_` unless intentional
- Modules organized by feature (`mod orders`, not `mod utils`)
- Zero-cost abstractions — generics over `dyn Trait` when performance matters
- Async with `tokio`; never block the runtime (`spawn_blocking` for CPU-heavy tasks)
- Avoid complex macros without clear necessity
- Naming: `PascalCase` for types/traits/enums; `snake_case` for functions/variables/modules; `SCREAMING_SNAKE_CASE` for constants
- `map` is valid for pure 1-to-1 collection transforms; `for` loops are preferred for accumulation or complex logic

### Async Concurrency

> <rule name="AsyncTokio">

```rust
pub async fn fetch_dashboard(user_id: &str) -> Result<Dashboard, AppError> {
    let (profile, orders, notifications) = tokio::join!(
        fetch_profile(user_id),
        fetch_recent_orders(user_id),
        fetch_notifications(user_id),
    );

    Ok(Dashboard { profile: profile?, orders: orders?, notifications: notifications? })
}
```

> </rule>

### Iterators vs Loops

> <rule name="RustCollections">

```rust
// ✅ Good: map for pure 1-to-1 transform
let user_uids: Vec<String> = users
    .iter()
    .filter(|u| u.is_active)
    .map(|u| u.uid.clone())
    .collect();

// ✅ Good: for loop for complex accumulation
let mut total = 0.0;
for item in &order.items {
    let line_amount = item.qty as f64 * item.price;
    total += line_amount;
}
```

> </rule>

</ruleset>

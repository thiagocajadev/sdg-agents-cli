# Kotlin — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="KotlinConventions">

## Error Handling

- **Strategy**: `Result<T>` / `sealed class` in the domain; exceptions only for unexpected failures
- **Propagation**: Explicit Result between layers; exceptions handled at the boundary
- **Domain errors**: `sealed class` for typed errors; avoid using exceptions as control flow
- **Never**: Exception for business rules; swallow errors

### Result Pattern (Sealed Class)

> <rule name="ResultPatternKotlin">

```kotlin
sealed class Result<out T> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Failure(val message: String, val code: String) : Result<Nothing>()
}

// Usage in ViewModel/Controller
return when (val result = useCase.execute(request)) {
    is Result.Success -> ResponseEntity.ok(result.data)
    is Result.Failure -> mapError(result)
}
```

> </rule>

---

## HTTP & API

- **Framework**: Ktor (preferred) or Spring Boot
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature
- **DI**: Manual or Koin; avoid heavy containers

---

## Testing

- **Framework**: JUnit 5 + Kotlin Test / MockK
- **Style**: Behavior-oriented
- **Naming**: `shouldDoXWhenY`
- **Mocks**: Mock only external I/O; never mock the domain

---

## Types & Contracts

- **DTOs**: `data class` for DTOs; `interface` for contracts
- **Strictness**: Default null safety; avoid `!!`
- **DTOs**: Separated from the domain
- **Validation**: At the boundary

---

## Kotlin-Specific Delta

- `data class` as default for immutable data
- `sealed class` for modeling states and errors — safer than enums
- `val` by default; `var` only when mutability is strictly necessary
- Coroutines (`suspend`) for asynchronous I/O; `Flow` for streams
- Avoid logic in Android View/Composable — ViewModel orchestrates
- Organization by feature
- Naming: `camelCase` for variables/functions; `PascalCase` for classes; `SCREAMING_SNAKE_CASE` for constants
- `map` is valid for pure 1-to-1 collection transforms; `for` loops are preferred for accumulation or complex logic

### Collections & Transformations

> <rule name="KotlinCollections">

```kotlin
// ✅ map — valid for 1-to-1 transform
val userNames = users
    .filter { it.isActive }
    .map { it.fullName }

// ✅ for loop — preferred for accumulation
var total = 0
for (item in order.items) {
    val lineAmount = item.qty * item.price
    total += lineAmount
}
```

> </rule>

</ruleset>

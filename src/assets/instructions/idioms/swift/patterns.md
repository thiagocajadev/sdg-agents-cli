# Swift — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="SwiftConventions">

## Error Handling

- **Strategy**: `Result<T, Error>` in the domain; `throw` only for unexpected failures
- **Propagation**: Explicit Result between layers; `throw` handled at the boundary (ViewModel/Coordinator)
- **Domain errors**: Typed `enum` with `case` and context when necessary; avoid `NSError` in the domain
- **Never**: `throw` for business rules; `try!`; ignore errors

### Result Pattern (Enum + Generic)

> <rule name="ResultPatternSwift">

```swift
enum AppError: Error {
    case userNotFound(id: String)
    case insufficientBalance(needed: Double, available: Double)
    case databaseError(underlying: Error)
}

func fetchUser(id: String) async -> Result<User, AppError> {
    do {
        let user = try await db.queryUser(id: id)
        return .success(user)
    } catch {
        return .failure(.databaseError(underlying: error))
    }
}
```

> </rule>

---

## HTTP & API

- **Style**: API First + BFF
- **Client**: `URLSession` or an abstracted layer; centralized and typed API client
- **Serialization**: `Codable` as standard
- **Never**: Call API directly from the View; spread request logic

---

## Testing

- **Framework**: XCTest
- **Style**: Behavior-focused
- **Naming**: `test_shouldDoX_whenY`
- **Mocks**: Protocols for abstraction; mock only external I/O

---

## Types & Contracts

- **Type vs protocol**: `struct` for data; `protocol` for contracts
- **Strictness**: Use `Optional` consciously; immutability by default (`let`)
- **DTOs**: Separated from the domain; `Codable`
- **Validation**: At the boundary (input/UI/API)

---

## Swift-Specific Delta

- Prefer `struct` (value types) over classes when identity is not required
- `async/await` standard for asynchronous I/O
- Avoid excessive Combine — use only when a reactive flow is genuinely necessary
- View only renders; ViewModel/Coordinator orchestrates
- Organization by feature
- Naming: `camelCase` for variables/functions; `PascalCase` for types; project prefixes in public frameworks
- `map` is valid for pure 1-to-1 collection transforms; `for` loops are preferred for accumulation or complex logic

### Collections & Higher-Order Functions

> <rule name="SwiftCollections">

```swift
// ✅ map — valid for 1-to-1 transform
let userIds = users
    .filter { $0.isActive }
    .map { $0.id }

// ✅ for loop — preferred for accumulation
var total: Double = 0
for item in order.items {
    let lineAmount = Double(item.qty) * item.price
    total += lineAmount
}
```

> </rule>

</ruleset>

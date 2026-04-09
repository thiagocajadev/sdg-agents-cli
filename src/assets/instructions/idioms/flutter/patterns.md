# Flutter (Dart) — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="FlutterConventions">

## Error Handling

- **Strategy**: Result Pattern (`Result<T>`) in the domain; `throw` only for unexpected failures
- **Propagation**: Explicit Result between layers; exceptions handled at the boundary (ViewModel/Controller)
- **Domain errors**: Sealed classes via `freezed` for union types; standard structure (`code`, `message`)
- **Never**: Exception for business rules; swallow errors; expose technical errors in the UI

### Result Pattern (Sealed Class / Freezed)

> <rule name="ResultPatternFlutter">

```dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String message, String code) = Failure<T>;
}

// Usage in ViewModel
final result = await _useCase.execute(request);
state = result.when(
  success: (data) => state.copyWith(data: data, isLoading: false),
  failure: (msg, code) => state.copyWith(errorMessage: msg, isLoading: false),
);
```

> </rule>

---

## HTTP & API

- **Style**: API First + BFF
- **Client**: Dio (preferred) or `http`; centralized and typed API client
- **Serialization**: `json_serializable` or `freezed`
- **Never**: Call API directly from the widget; mix parsing with UI

---

## Testing

- **Framework**: `flutter_test` / `mocktail`
- **Style**: Behavior-oriented
- **Naming**: `shouldDoXWhenY`
- **Mocks**: Mock only external I/O; domain is always real

---

## Types & Contracts

- **Classes**: Immutable by default (`const`, `final`)
- **Union types**: `freezed` for complex DTOs and states
- **Null safety**: Mandatory; avoid `!`
- **DTOs**: Separated from the domain; never expose internal structure
- **Validation**: At the boundary (input/API)

---

## Flutter-Specific Delta

- Widget = rendering only; no business logic in `build()`
- Logic outside the widget (Controller/ViewModel)
- State management with Riverpod or BLoC — no uncontrolled global state
- Strong componentization — small and focused widgets
- Organization by feature
- Naming: `camelCase` for variables/functions; `PascalCase` for classes; `snake_case` for files
- `map` is valid for pure 1-to-1 collection transforms; `for` loops are preferred for accumulation or complex logic

### Collections & UI Lists

> <rule name="FlutterCollections">

```dart
// ✅ map — valid for 1-to-1 transform (e.g. data to widget)
final userWidgets = users
    .where((u) => u.isActive)
    .map((u) => UserCard(user: u))
    .toList();

// ✅ for loop — preferred for accumulation
double total = 0;
for (final item in order.items) {
    final lineAmount = item.qty * item.price;
    total += lineAmount;
}
```

> </rule>

</ruleset>

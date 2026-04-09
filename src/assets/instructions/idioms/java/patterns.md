# Java — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="JavaConventions">

## Error Handling

- **Strategy**: Result Pattern in the domain (`sealed interface Result<T>`); exceptions only for unexpected failures (infra/runtime)
- **Propagation**: Result is explicitly returned in business flows; exceptions bubble up to the `@ControllerAdvice`
- **Domain errors**: Standardized object (`code`, `message`); enum for categorization when necessary
- **Never**: Exception for business rules; empty `catch`; leak internal details
- **Global Handling**: Centralized `@RestControllerAdvice`; consistent mapping to HTTP; structured logging (SLF4J)

### Result Pattern (sealed interface + record)

> <rule name="ResultPatternJava">

```java
public sealed interface Result<T> {
    record Success<T>(T value) implements Result<T> {}
    record Failure<T>(String message, String code) implements Result<T> {}

    static <T> Result<T> success(T value) { return new Success<>(value); }
    static <T> Result<T> failure(String msg, String code) { return new Failure<>(msg, code); }
}

// Controller — pattern matching (Java 21+)
return switch (useCase.execute(request)) {
    case Result.Success<User>(var user) -> ResponseEntity.status(201).body(UserPresenter.present(user));
    case Result.Failure<User>(var msg, var code) -> mapErrorToResponse(msg, code);
};
```

> </rule>

### Global Exception Handler

> <rule name="JavaExceptions">

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ConstraintViolationException ex) {
        var message = ex.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new ErrorResponse(message, "VALIDATION_ERROR"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.internalServerError().body(new ErrorResponse("Internal error", "INTERNAL"));
    }
}
```

> </rule>

---

## HTTP & API

- **Framework**: Spring Boot — industry standard, mature, broad ecosystem
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature; avoid rigid technical layer division
- **Middleware/hooks**: Auth via filter/interceptor; validation at the boundary (`@Valid`); logging/tracing in the pipeline
- **DI**: Constructor injection mandatory; `@RequiredArgsConstructor` (Lombok) or explicit constructor; never `@Autowired` on field

### Dependency Injection

> <rule name="JavaDI">

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;
    private final NotificationService notifier;

    public Result<Order> createOrder(CreateOrderRequest request) {
        var order = orderRepo.save(Order.from(request));
        notifier.send(order);
        return Result.success(order);
    }
}
```

> </rule>

### Virtual Threads (Project Loom)

> <rule name="JavaVirtualThreads">
> Enable via `spring.threads.virtual.enabled=true`. Use standard imperative code — avoid WebFlux unless strictly necessary.

```java
@GetMapping("/users/{id}")
public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
    var result = userService.findById(id);
    return switch (result) {
        case Result.Success<User>(var u) -> ResponseEntity.ok(UserPresenter.present(u));
        case Result.Failure<User>(var msg, var code) -> mapError(msg, code);
    };
}
```

> </rule>

---

## Testing

- **Framework**: JUnit 5 + AssertJ + Mockito
- **Style**: Flat, behavior-oriented
- **Naming**: `shouldDoXWhenY` (e.g., `createOrder_shouldReturnSuccess`)
- **Mocks**: Mockito for external dependencies; never mock the domain
- **What to test**: Business rules, error cases (Result), API contracts

### Unit Testing

> <rule name="JUnit5Testing">

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepo;
    @InjectMocks private OrderService orderService;

    @Test
    void createOrder_shouldReturnSuccess() {
        when(orderRepo.save(any())).thenReturn(new Order(UUID.randomUUID(), "product-1", 2));
        var result = orderService.createOrder(new CreateOrderRequest("product-1", 2));
        assertThat(result).isInstanceOf(Result.Success.class);
    }
}
```

> </rule>

### Integration Testing (Testcontainers)

> <rule name="JavaIntegration">

```java
@SpringBootTest
@Testcontainers
class UserRepositoryIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }

    @Autowired private UserRepository repo;

    @Test
    void save_shouldPersistUser() {
        var user = new User(UUID.randomUUID(), "test@test.com");
        repo.save(user);
        assertThat(repo.findById(user.getId())).isPresent();
    }
}
```

> </rule>

---

## Types & Contracts

- **DTOs**: `record` for Request/Response; each layer has its own type; never expose JPA entity directly
- **Optional**: Only as method return (not as field or parameter)
- **Validation**: Bean Validation (`jakarta.validation`) at the input; never in the domain
- **Strictness**: Avoid `null` whenever possible; `Optional` only at the boundary

### Records as Data Carriers

> <rule name="JavaRecords">

```java
public record CreateUserRequest(@NotBlank String email) {}

public record ValidatedCreateUser(String email) {
    public ValidatedCreateUser { email = email.trim().toLowerCase(); }
}

public record UserResponse(UUID id, String email) {}
```

> </rule>

---

## Java-Specific Delta

- `record` for DTOs — avoid POJO boilerplate; Lombok with moderation when needed
- `@Transactional` at the correct level (service, not repository); never cascaded without necessity
- Imperative loops (for-each) with explaining variables are preferred for complex transformations and accumulation.
- Streams are valid for pure 1-to-1 collection transformations and simple filter + map pipelines.
- Avoid logic in annotations
- Naming: PascalCase for classes; camelCase for methods/variables; `SCREAMING_SNAKE_CASE` for constants
- Interfaces without `I` prefix; implementations with descriptive names (`JpaOrderRepository`, not `OrderRepositoryImpl`)
- Boolean methods: `is`, `has`, `can` prefix

### Stream API

> <rule name="JavaStreams">

```java
// ✅ Streams for trivial 1-to-1 transformation
var activeEmails = users.stream()
    .filter(User::isActive)
    .map(User::getEmail)
    .toList();

// ✅ For-each Loop (Equilibrium and Narrative) for complex logic
var results = new ArrayList<Result>();
for (var item : items) {
    var intermediate = compute(item);
    if (intermediate.isValid()) {
        results.add(format(intermediate));
    }
}
```

> </rule>

</ruleset>

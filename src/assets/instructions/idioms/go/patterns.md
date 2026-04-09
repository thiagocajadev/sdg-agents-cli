# Go — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="GoConventions">

## Error Handling

- **Strategy**: Explicit `(T, error)`; no exceptions, no `panic` for business logic
- **Propagation**: Errors are explicitly returned; wrapping with `fmt.Errorf("ctx: %w", err)` for traceability
- **Domain errors**: Sentinel `var` for simple cases; custom `type` with `Error()` when necessary; `errors.Is` / `errors.As` for comparison
- **Never**: Ignore errors (`_`); `panic` for business rules; swallow errors
- **Global Handling**: HTTP handler converts `error` → response; structured logging (`slog`)

### Result Pattern (Go Style)

> <rule name="ResultPatternGo">

```go
type AppError struct {
    Message string
    Code    string
}

func (e *AppError) Error() string {
    return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func FindUser(ctx context.Context, id string) (*User, error) {
    if id == "" {
        return nil, &AppError{Message: "id is required", Code: "INVALID_ID"}
    }
    user, err := db.QueryUser(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("FindUser: %w", err)
    }
    return user, nil
}
```

> </rule>

---

## HTTP & API

- **Framework**: `net/http` (preferred) or Echo/Fiber when necessary
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature/package; avoid generic packages (`utils`, `common`)
- **Middleware/hooks**: Auth via middleware; validation at the boundary; logging/tracing in the pipeline
- **DI**: Manual — explicit dependency passing via structs; constructor functions (`New...`); avoid containers

### Interface Design

> <rule name="InterfaceDesign">
> Interfaces defined by the consumer, not the provider. Small interfaces (1-2 methods). `-er` suffix for single-method.

```go
type UserFinder interface {
    FindByID(ctx context.Context, id string) (*User, error)
}

type OrderService struct {
    users UserFinder
}

func NewOrderService(users UserFinder) *OrderService {
    return &OrderService{users: users}
}
```

> </rule>

### Context Propagation

> <rule name="ContextPropagation">
> `context.Context` is the first parameter of every function that performs I/O or can be canceled.

```go
func (s *Service) CreateOrder(ctx context.Context, input CreateOrderRequest) (*Order, error) {
    user, err := s.users.FindByID(ctx, input.UserID)
    if err != nil {
        return nil, fmt.Errorf("CreateOrder: %w", err)
    }
    return s.orders.Save(ctx, newOrder(user, input))
}
```

> </rule>

---

## Testing

- **Framework**: built-in (`testing`)
- **Style**: Table-driven tests (preferred)
- **Naming**: `TestShouldDoXWhenY`
- **Mocks**: Small interfaces for abstraction; mock only external I/O; avoid heavy frameworks

### Table-Driven Tests

> <rule name="TableTests">

```go
func TestParseVersion(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    float64
        wantErr bool
    }{
        {name: "simple", input: "10", want: 10},
        {name: "decimal", input: "3.14", want: 3.14},
        {name: "empty", input: "", wantErr: true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseVersion(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("got %v, want %v", got, tt.want)
            }
        })
    }
}
```

> </rule>

---

## Types & Contracts

- **struct** for data; small interfaces defined by the consumer
- No nulls — use zero values carefully; pointers only when strictly necessary
- Well-defined JSON tags; never expose internal structs directly
- Manual validation or lightweight library (`go-playground/validator`); simple and explicit

---

## Go-Specific Delta

- Idiomatic > "beautiful architecture" — simplicity is the standard, not the exception
- Short and clear names; exported = PascalCase; unexported = camelCase; acronyms in caps (`ID`, `HTTP`)
- Early return for error flow — no `else` after `return err`
- Avoid "god structs" and "god packages" — focused packages by responsibility
- `context.Context` always applicable — cancellation and timeout propagated
- Managed lifecycle goroutines (`errgroup`, `WaitGroup`); never fire-and-forget
- `defer` immediately after resource acquisition
- Structured logging (`slog`)
- Package names: lowercase, single word, no underscores
- `for` loops are the standard for all collection operations; mapping and transformations follow the imperative pattern

### Goroutines & Concurrency

> <rule name="GoroutinesChannels">

```go
func ProcessBatch(ctx context.Context, items []Item) error {
    g, ctx := errgroup.WithContext(ctx)
    for _, item := range items {
        g.Go(func() error {
            return processItem(ctx, item)
        })
    }
    return g.Wait()
}
```

> </rule>

### Defer for Cleanup

> <rule name="DeferCleanup">

```go
func ReadConfig(path string) ([]byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, fmt.Errorf("ReadConfig: %w", err)
    }
    defer f.Close()
    return io.ReadAll(f)
}
```

> </rule>

</ruleset>

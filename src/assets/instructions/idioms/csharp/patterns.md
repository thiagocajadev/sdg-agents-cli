# C# — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="CSharpConventions">

## Error Handling

- **Strategy**: Result Pattern in the domain (`Result<T>` via sealed record); exceptions only for unexpected failures (infra/runtime)
- **Propagation**: Result is explicitly returned in business flows; exceptions bubble up to the global middleware
- **Domain errors**: `sealed record ApiError(string Message, string Code)`; pattern matching for mapping
- **Never**: `throw` for business rules; `.Result` / `.Wait()` in async code; leak internal details

### Result Pattern

> <rule name="ResultPatternCSharp">

```csharp
public sealed record ApiError(string Message, string Code);

public record Result<T>(bool IsSuccess, bool IsFailure, T? Value, ApiError? Error)
{
    public static Result<T> Success(T value) => new(true, false, value, null);
    public static Result<T> Fail(string msg, string code) => new(false, true, default, new ApiError(msg, code));
}

// Pattern matching
public IActionResult GetOrder(Result<Order> result) => result switch
{
    { IsSuccess: true, Value: var o } => Ok(o),
    { IsFailure: true, Error: var e } => MapError(e),
    _ => Problem()
};
```

> </rule>

---

## HTTP & API

- **Framework**: ASP.NET Core — Minimal APIs (preferred) or Controllers when necessary
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature (`Features/Orders/OrderEndpoints.cs`)
- **Middleware/hooks**: Auth in the pipeline; validation at the boundary; centralized logging/tracing
- **DI**: Constructor injection via primary constructors; registration in `Program.cs`; never service locator

### Minimal API per Feature

> <rule name="MinimalAPI">

```csharp
public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders");
        group.MapPost("/", CreateOrder);
        group.MapGet("/{id:guid}", GetOrder);
    }

    private static async Task<IResult> CreateOrder(
        CreateOrderRequest request,
        OrderService service,
        CancellationToken ct)
    {
        var result = await service.CreateOrderAsync(request, ct);
        var httpResponse = ToEnvelope(result);
        return httpResponse;
    }

    // Adapter — only layer that knows both Result<T> and HTTP envelope
    private static IResult ToEnvelope<T>(Result<T> result) => result switch
    {
        { IsSuccess: true, Value: var value } =>
            Results.Ok(new { success = true, error = (object?)null, data = value }),
        { IsFailure: true, Error: var error } =>
            Results.Json(
                new { success = false, error = new { code = error!.Code, message = error.Message }, data = (object?)null },
                statusCode: MapStatusCode(error.Code)
            ),
        _ => Results.Problem()
    };

    private static int MapStatusCode(string code) => code switch
    {
        "NOT_FOUND" => 404,
        "UNAUTHORIZED" => 401,
        "FORBIDDEN" => 403,
        "CONFLICT" => 409,
        "INVALID_INPUT" => 400,
        _ => 422
    };
}
```

> </rule>

### Dependency Injection

> <rule name="CSharpDI">

```csharp
public class OrderService(IOrderRepository repo, INotifier notifier)
{
    public async Task<Result<Order>> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        var order = await repo.SaveAsync(Order.From(request), ct);
        await notifier.SendAsync(order, ct);
        return Result<Order>.Success(order);
    }
}

// Program.cs
builder.Services.AddScoped<IOrderRepository, PostgresOrderRepository>();
builder.Services.AddScoped<OrderService>();
```

> </rule>

---

## Testing

- **Framework**: xUnit + FluentAssertions + NSubstitute
- **Style**: Flat, behavior-oriented
- **Naming**: `MethodName_ShouldDoX_WhenY`
- **Mocks**: NSubstitute for external dependencies; never mock the domain
- **What to test**: Business rules, error cases (Result), API contracts

### Unit Testing

> <rule name="CSharpTesting">

```csharp
public class OrderServiceTests
{
    private readonly IOrderRepository _repo = Substitute.For<IOrderRepository>();
    private readonly INotifier _notifier = Substitute.For<INotifier>();
    private readonly OrderService _sut;

    public OrderServiceTests() => _sut = new OrderService(_repo, _notifier);

    [Fact]
    public async Task CreateOrder_ShouldReturnSuccess()
    {
        _repo.SaveAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>())
             .Returns(new Order(Guid.NewGuid(), "prod-1", 2));

        var result = await _sut.CreateOrderAsync(new CreateOrderRequest("prod-1", 2));

        result.IsSuccess.Should().BeTrue();
        result.Value!.ProductId.Should().Be("prod-1");
        await _notifier.Received(1).SendAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
    }
}
```

> </rule>

### Integration Testing

> <rule name="CSharpIntegration">

```csharp
public class OrdersApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task CreateOrder_ReturnsCreated()
    {
        var response = await _client.PostAsJsonAsync("/api/orders", new { ProductId = "abc", Quantity = 2 });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

> </rule>

---

## Types & Contracts

- **DTOs**: `record` for Request/Response; each layer has its own type; never expose EF entities
- **Validation**: Validation at the boundary — factory method with Result, FluentValidation when rules are complex
- **Async**: All I/O methods are `async Task<T>`; `Async` suffix; `CancellationToken` in public APIs; never `.Result` / `.Wait()`
- **Naming**: PascalCase for public members; `_camelCase` for private fields; `I` prefix for interfaces; `Async` suffix for async methods

### Records as Data Carriers

> <rule name="CSharpRecords">

```csharp
public record CreateUserRequest(string Email, string Password);
public record UserResponse(Guid Id, string Email);

// Factory method with validation
public record CreateOrderRequest(string ProductId, int Quantity)
{
    public static Result<CreateOrderRequest> Create(string productId, int quantity)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return Result<CreateOrderRequest>.Fail("Product ID is required.", "INVALID_PRODUCT_ID");
        if (quantity < 1)
            return Result<CreateOrderRequest>.Fail("Quantity must be at least 1.", "INVALID_QUANTITY");
        return Result<CreateOrderRequest>.Success(new(productId, quantity));
    }
}
```

> </rule>

### Async Pattern

> <rule name="CSharpAsync">

```csharp
public async Task<Result<Dashboard>> GetDashboardAsync(string userId, CancellationToken ct = default)
{
    var profileTask = _users.FindByIdAsync(userId, ct);
    var ordersTask = _orders.GetRecentAsync(userId, ct);
    var notificationsTask = _notifications.GetUnreadAsync(userId, ct);

    await Task.WhenAll(profileTask, ordersTask, notificationsTask);

    return Result<Dashboard>.Success(new Dashboard(
        Profile: await profileTask,
        Orders: await ordersTask,
        Notifications: await notificationsTask
    ));
}
```

> </rule>

---

## LINQ & Collections

> Use LINQ for clarity, not cleverness. Prefer readability over chaining.

### Core Principles

- Prefer **readability over conciseness**
- Keep queries **simple and predictable**
- Avoid complex chaining ("magic LINQ")
- LINQ is for **data transformation**, not business logic
- Use `foreach` for complex logic or accumulation (sum, total)

### Code Flow Alignment

Keep LINQ inside the **execution step** — never mix orchestration with complex queries.

> <rule name="CSharpLINQ">

````carousel
```csharp
// ❌ BAD: Chained LINQ magic — logic buried, untestable, hard to extend
var result = orders
    .Where(o => o.Status == "CONFIRMED" && o.CreatedAt > DateTime.UtcNow.AddDays(-30))
    .GroupBy(o => o.CustomerId)
    .Select(g => new { CustomerId = g.Key, Total = g.Sum(o => o.Items.Sum(i => i.Price * i.Qty)) })
    .OrderByDescending(x => x.Total)
    .ToList();
```
<!-- slide -->
```csharp
// ✅ GOOD: LINQ for 1-to-1 transform; foreach for accumulation — each step is readable
var recentOrders = orders
    .Where(o => o.Status == "CONFIRMED" && o.CreatedAt > DateTime.UtcNow.AddDays(-30))
    .ToList();

var summaries = recentOrders
    .GroupBy(o => o.CustomerId)
    .Select(group => BuildCustomerSummary(group))
    .OrderByDescending(summary => summary.Total)
    .ToList();

return summaries;

static CustomerSummary BuildCustomerSummary(IGrouping<Guid, Order> group)
{
    decimal total = 0;
    foreach (var order in group)
    foreach (var item in order.Items)
    {
        var lineAmount = item.Price * item.Qty;
        total += lineAmount;
    }

    var customerSummary = new CustomerSummary(group.Key, total);
    return customerSummary;
}
```
````

> </rule>

### Materialization (ToList / ToArray)

Materialize only when needed: multiple iterations, snapshot of data, or returning a concrete collection.

- Default → `IEnumerable<T>`
- Use `.ToList()` at boundaries (return, serialization, EF Core terminal calls)
- Never materialize prematurely inside a pipeline

### Side Effects

LINQ must be **pure** — no side effects inside queries. Never use `.Select(u => { Log(u); return u; })`.

---

## Data Access — EF Core

> Data access rules in [Universal Data Access Principles](../../core/data-access.md).

### DbContext & Tracking

> <rule name="EFContextLifetime">
> `DbContext` Scoped (one per request). `AsNoTracking()` in read-only queries. Never Singleton.

```csharp
public async Task<IReadOnlyList<OrderSummary>> GetRecentOrdersAsync(CancellationToken ct) =>
    await _context.Orders
        .AsNoTracking()
        .Where(o => o.CreatedAt > DateTime.UtcNow.AddDays(-30))
        .Select(o => new OrderSummary(o.Id, o.Total, o.CreatedAt))
        .ToListAsync(ct);
```

> </rule>

### Projection — Select over Full Entities

> <rule name="EFProjection">
> Always project to DTOs via `.Select()`. Never expose EF entities to the API layer.

```csharp
public async Task<ProductDetail?> GetProductDetailAsync(Guid id, CancellationToken ct) =>
    await _context.Products
        .Where(p => p.Id == id)
        .Select(p => new ProductDetail(p.Id, p.Name, p.Price, p.Category.Name, p.Reviews.Count))
        .FirstOrDefaultAsync(ct);
```

> </rule>

### N+1 Prevention

> <rule name="EFNPlusOne">
> Lazy loading disabled. `.Include()` for known graphs. `AsSplitQuery()` for multiple collections.

```csharp
var orders = await _context.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .Where(o => o.CustomerId == customerId)
    .ToListAsync(ct);
```

> </rule>

</ruleset>

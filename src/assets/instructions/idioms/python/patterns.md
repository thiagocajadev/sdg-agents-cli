# Python — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="PythonConventions">

## Error Handling

- **Strategy**: Result Pattern in the domain (`Result[T]`); exceptions only for unexpected failures (runtime/infra)
- **Propagation**: Result is explicitly returned in business flows; exceptions bubble up to the framework's global handler
- **Domain errors**: Standard structure (`code`, `message`); `Enum` for categorization when necessary
- **Never**: Exception for business rules; `except: pass`; bare `except:`; leak internal details
- **Global Handling**: Framework middleware/exception handler; consistent mapping to HTTP; structured logging

### Result Pattern

> <rule name="ResultPatternPython">

```python
from dataclasses import dataclass
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

@dataclass
class ApiError:
    message: str
    code: str

@dataclass
class Result(Generic[T]):
    is_success: bool
    is_failure: bool
    value: Optional[T] = None
    error: Optional[ApiError] = None

    @classmethod
    def success(cls, value: T) -> "Result[T]":
        return cls(is_success=True, is_failure=False, value=value, error=None)

    @classmethod
    def fail(cls, message: str, code: str) -> "Result[T]":
        return cls(is_success=False, is_failure=True, value=None, error=ApiError(message, code))
```

> </rule>

---

## HTTP & API

- **Framework**: FastAPI — type hints, performance, and integrated validation
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature; avoid excessive technical layer separation
- **Middleware/hooks**: Auth via `Depends`/middleware; automatic validation at the boundary (Pydantic); logging/tracing in the pipeline
- **DI**: FastAPI `Depends()` for routes; constructor injection in services

### Dependency Injection

> <rule name="PythonDI">

```python
class OrderService:
    def __init__(self, repo: OrderRepository, notifier: Notifier):
        self._repo = repo
        self._notifier = notifier

    async def create_order(self, request: CreateOrderRequest) -> Result[Order]:
        order = await self._repo.save(Order.from_request(request))
        await self._notifier.send(order)
        return Result.success(order)

@router.post("/orders", status_code=201)
async def create_order(
    request: CreateOrderRequest,
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    result = await service.create_order(request)
    if result.is_failure:
        raise HTTPException(status_code=422, detail=result.error.message)
    return OrderResponse.model_validate(result.value)
```

> </rule>

---

## Testing

- **Framework**: pytest
- **Style**: Simple functions, behavior-oriented
- **Naming**: `test_should_do_x_when_y`
- **Mocks**: `pytest-mock` or `unittest.mock.AsyncMock`; mock only external I/O; never mock domain
- **What to test**: Business rules, error cases (Result), API contracts

### Unit Testing

> <rule name="PytestTesting">

```python
@pytest.fixture
def order_service(mock_repo, mock_notifier):
    return OrderService(repo=mock_repo, notifier=mock_notifier)

async def test_create_order_returns_success(order_service):
    result = await order_service.create_order(CreateOrderRequest(product_id="abc", quantity=2))
    assert result.is_success
    assert result.value.product_id == "abc"
```

> </rule>

---

## Types & Contracts

- **Type hints**: Mandatory in all public functions; `X | None` (Python 3.10+) over `Optional[X]`
- **Protocols**: For structural typing (static duck typing)
- **DTOs**: `BaseModel` (Pydantic) for Request/Response; `@dataclass` for internal models
- **Validation**: Pydantic integrated with FastAPI; always validate at the boundary; never reuse Request model as Response

### Pydantic DTOs

> <rule name="PydanticDTOs">

```python
class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: UUID
    email: str
    model_config = ConfigDict(from_attributes=True)
```

> </rule>

---

## Python-Specific Delta

- Avoid unnecessary classes — functions when there is no coupled state
- Async for I/O bound; `asyncio.gather` for concurrency; `asyncio.to_thread` for bridging sync
- `async with` for all resources with cleanup (files, connections)
- Comprehensions are valid for simple 1-to-1 transformations.
- `for` loops are preferred for complex logic or business-critical accumulation.
- Avoid excessive "magic" — complex decorators and metaprogramming increase coupling
- Naming: `snake_case` for variables/functions/modules; `PascalCase` for classes; `SCREAMING_SNAKE_CASE` for constants

### Async Concurrency

> <rule name="AsyncIOPython">

```python
async def fetch_dashboard(user_id: str) -> Result[Dashboard]:
    profile, orders, notifications = await asyncio.gather(
        fetch_profile(user_id),
        fetch_recent_orders(user_id),
        fetch_notifications(user_id),
    )
    return Result.success(Dashboard(profile=profile, orders=orders, notifications=notifications))
```

> </rule>

### Comprehensions vs Loops

> <rule name="PythonCollections">

```python
# ✅ Good: comprehension for simple 1-to-1 map
active_emails = [u.email for u in users if u.is_active]

# ✅ Good: for loop for complex logic
total = 0
for item in order.items:
    line_amount = item.qty * item.price
    total += line_amount
```

> </rule>

</ruleset>

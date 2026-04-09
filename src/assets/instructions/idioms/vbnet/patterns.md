# VB.NET — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="VbNetConventions">

## Error Handling

- **Strategy**: Result Pattern (`Result(Of T)`) as standard; exceptions only for unexpected failures (infra/runtime)
- **Propagation**: Result is explicitly returned in business flows; exceptions bubble up to the Global Handler
- **Domain errors**: Standardized type (`Code`, `Message`); enum for categorization when necessary
- **Never**: `Throw` for business rules; empty `Catch`; leak internal details

### Result Pattern (VB.NET Style)

> <rule name="ResultPatternVbNet">

```vb
Public Class Result(Of T)
    Public Property IsSuccess As Boolean
    Public Property Data As T
    Public Property ErrorCode As String
    Public Property ErrorMessage As String

    Public Shared Function Success(data As T) As Result(Of T)
        Return New Result(Of T) With { .IsSuccess = True, .Data = data }
    End Function

    Public Shared Function Failure(message As String, code As String) As Result(Of T)
        Return New Result(Of T) With { .IsSuccess = False, .ErrorMessage = message, .ErrorCode = code }
    End Function
End Class
```

> </rule>

---

## HTTP & API

- **Framework**: ASP.NET Core (modern .NET interoperability)
- **Style**: API First + BFF
- **Route organization**: Vertical slice per feature; MVC acceptable when necessary
- **Middleware/hooks**: Auth in the pipeline; validation at the boundary; centralized logging/tracing
- **DI**: Constructor injection; native ASP.NET Core container; never service locator

---

## Testing

- **Framework**: xUnit (preferred) or MSTest
- **Style**: Flat, behavior-oriented
- **Naming**: `Should_DoX_WhenY`
- **Mocks**: Mock only external dependencies; never mock the domain
- **What to test**: Business rules, error cases (Result), API contracts

---

## Types & Contracts

- **Type vs interface**: `Interface` for contracts; `Class` for implementation; simple and clear DTOs
- **Strictness**: `Option Strict On`; `Option Explicit On`; avoid `Nothing` — prefer Result/Option
- **DTOs**: Separated from the domain; never expose entities directly
- **Validation**: FluentValidation or manual validation at the boundary; never validate domain rules here

---

## VB.NET-Specific Delta

- Avoid legacy syntax (`On Error Resume Next`, late binding)
- Prefer modern .NET style — compatible and aligned with C#
- `Async/Await` always applicable; never `.Result` / `.Wait()`
- Logging via `ILogger`
- Option Pattern for configuration
- Explicit code > "shorthands" of the language
- Naming: PascalCase for public members; `I` prefix for interfaces
- `For Each` loops are preferred for all collection operations; mapping and transformations follow the imperative pattern

### Collections & Loops

> <rule name="VbNetCollections">

```vb
' ✅ Good: For Each for 1-to-1 transform or accumulation
Dim activeEmails As New List(Of String)
For Each u In users
    If u.IsActive Then
        activeEmails.Add(u.Email)
    End If
Next
```

> </rule>

</ruleset>

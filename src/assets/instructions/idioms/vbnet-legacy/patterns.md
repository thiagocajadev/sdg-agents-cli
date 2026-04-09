# VB.NET (Legacy .NET Framework 4.8 Desktop) — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to this language and stack.

<ruleset name="VbNet48DesktopConventions">

## Error Handling

- **Strategy**: Result Pattern (`Result(Of T)`) in the domain; `Try/Catch` only for unexpected failures (infra/runtime)
- **Propagation**: Result is explicitly returned; exceptions captured at the boundary (UI/App layer) and converted into controlled feedback
- **Domain errors**: `Error` type (`Code`, `Message`); enum for categorization when necessary
- **Never**: `Throw` for business rules; `On Error Resume Next`; empty `Catch`; display stacktrace to the user

### Result Pattern (Legacy VB.NET)

> <rule name="ResultPatternVbNetLegacy">

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

## UI & Application (Desktop)

- **Style**: UI as orchestrator — no business rules in Form/View
- **Architecture**: WinForms → lightweight MVP (Presenter isolates logic); WPF → MVVM when applicable (ViewModel without UI dependency)
- **Separation**: UI = events + binding; Application/Service = orchestration; Domain = business rules
- **Never**: Business rules in Form/View; direct DB access from UI; couple UI with infra

---

## Data Access

- **Approach**: Direct ADO.NET or Dapper (preferred); avoid heavy ORMs (EF6) unless strictly necessary
- **Organization**: Simple repositories per feature; explicit and clear queries
- **Transactions**: Explicit control (`TransactionScope` when necessary); avoid hidden implicit transactions
- **Never**: Business logic in the repository; unsafe dynamic SQL (string concatenation)

---

## Testing

- **Framework**: MSTest or xUnit when possible
- **Style**: Focus on domain, outside the UI
- **Naming**: `Should_DoX_WhenY`
- **Mocks**: Mock only external I/O; domain is always real
- **What to test**: Business rules, error cases (Result), critical flows

---

## Types & Contracts

- **Type vs interface**: `Interface` for contracts; `Class` for implementation; simple DTOs
- **Strictness**: `Option Strict On`; `Option Explicit On`; avoid `Nothing` — use Result/explicit values
- **DTOs**: Separated from the domain; never expose entities directly
- **Validation**: At the boundary (user input); simple and explicit

---

## VB.NET 4.8-Specific Delta

- Avoid any legacy syntax (`On Error`, late binding, `IIF`)
- Explicit and predictable code
- `Async/Await` with care — only when necessary and safe in desktop context (UI threading)
- `Invoke`/`BeginInvoke` to update UI from another thread
- Structured logging to file or Event Viewer
- Config via `app.config` / `ConfigurationManager`
- Centralize unhandled error handling via `Application.ThreadException` / `AppDomain.UnhandledException`
- `For Each` loops are preferred for all collection operations; mapping and transformations follow the imperative pattern

### Collections & Loops

> <rule name="VbNetLegacyCollections">

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

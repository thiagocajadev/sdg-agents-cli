# Architecture Flavor: LITE

<ruleset name="LiteArchitecture">

> [!NOTE]
> The **LITE** flavor is designed for small-scale projects and experimental scripts where layered complexity is a liability. It prioritizes speed while maintaining strict engineering discipline.

> [!IMPORTANT]
> This flavor MUST strictly adhere to the [Universal Staff Engineering DNA](../core/staff-dna.md). All rules regarding Security (Hardening), Reliability (Resilience), and Narrative (NarrativeCascade) are inherited from the DNA.

## Core Principles: Absolute Simplicity

<rule name="LiteCorePrinciples">

> [!NOTE]
> Prioritize direct implementation over abstraction.

1. **KISS (Keep It Simple, Stupid)**: Do not create classes, services, or repositories unless logic is duplicated and complex.
2. **Direct Implementation**: Logic is implemented directly at the point of interaction (e.g., inside the main file or route handler).
3. **Flat Hierarchy**: Minimize file hopping. Keep related logic together in a single file when possible.
4. **No Boilerplate**: Only write what is executed. Avoid "preparing for the future".
   </rule>

## Implementation Standard

<rule name="LiteImplementationStandard">

> [!IMPORTANT]
> Even in a single file, you must follow these constraints:

- **NarrativeCascade**: Entry point first. Each function either orchestrates or implements — never both. Callers above callees. See `NarrativeCascade` → [Engineering Standards](../../core/engineering-standards.md).
- **Explaining Returns**: ALWAYS assign results to a named variable (e.g., `const userFound = ...`) before returning to clarify intent. See `CleanCodeTactical` → [Engineering Standards](../../core/engineering-standards.md).
- **Law of Resilience**: Prefer the **Result Pattern** for business logic or complex failure paths, but do not force it for trivial logic where idiomatic error handling is clearer.

> [!TIP]
> **When to Upgrade**: If the file grows beyond 300 lines or logic is reused across multiple files, consider refactoring to **Vertical Slice**.
> </rule>

</ruleset>

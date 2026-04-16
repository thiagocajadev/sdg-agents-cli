# Architecture Flavor: LITE

> Inherits Security, Reliability, NarrativeCascade from staff-dna.md.
> For small-scale projects and experimental scripts where layered complexity is a liability.

## Core Principles

1. **KISS**: No classes/services/repositories unless logic is duplicated AND complex.
2. **Direct Implementation**: Logic at point of interaction (main file or route handler).
3. **Flat Hierarchy**: Minimize file hopping. Related logic together in single file when possible.
4. **No Boilerplate**: Only write what is executed. No future-proofing.

## Implementation Standard

Even in a single file:

- **NarrativeCascade**: Entry point first. Each function orchestrates OR implements — never both. Callers above callees.
- **Explaining Returns**: Assign results to named variable (`const userFound = ...`) before returning.
- **Resilience**: Prefer Result Pattern for business logic / complex failure paths. Don't force it for trivial logic where idiomatic error handling is clearer.

> **Upgrade trigger**: File > 300 lines or logic reused across multiple files → refactor to Vertical Slice.

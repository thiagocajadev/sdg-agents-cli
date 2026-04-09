# The SDG Constitution: 7 Engineering Laws

This document defines the philosophical and technical foundation of `sdg-agents`.

## How the Model Works

The developer sets direction and approves decisions. The agent handles execution — reading the codebase, proposing a structured plan, writing the code, and running the tests. The agent stops at SPEC and PLAN for explicit approval before proceeding.

This document is the mental model for developers. The technical rules the agent follows are in [`.ai/instructions/core/staff-dna.md`](../src/assets/instructions/core/staff-dna.md).

---

## 1. Hardening (Security Execution)

**Security is not a layer; it is the foundation.**

Configuration isolation is mandatory. Environment templates (`.env.example`) are prohibited — they leak information. All required configuration is declared as a "Configuration Contract" during the SPEC phase, with abstract key names only.

## 2. Resilience (Fault Tolerance)

**Software must withstand repetition and failure.**

Every operation with side-effects must be idempotent. Design for graceful degradation — system stability cannot depend on external dependencies being available.

## 3. The Cascade (Orchestration Scansion)

**Code is a technical narrative.**

Follow the Stepdown Rule: entry points at the top, high-level logic first, implementation details below. Expressive naming is primary documentation. If a comment is needed to explain _what_ the code does, the name is wrong.

## 4. Visual Excellence (Consistency)

**Aesthetics are a signal of quality.**

Semantic design tokens and high-contrast typography are not optional. Visual consistency and attention to micro-interactions are part of the definition of done for interface work.

## 5. Boundaries (Scope Integrity)

**Protect the state through atomic focus.**

Changes are limited to files and functions defined in the current task. The Circuit Breaker rule applies: the agent stops and reports if it hits the same error 3 times, makes no progress in 3 turns, or encounters a non-bypassable access barrier.

## 6. Reflection (Systematic Reasoning)

**Reason first, act later.**

The agent evaluates architecture before proposing anything. Every line of code must serve a deliberate purpose that traces back to the approved SPEC.

## 7. The Writing Soul (Technical Density)

**High signal, zero noise.**

Technical communication is direct and precise. No filler phrases, no summaries of what was just done, no "AI-isms". Output only what the developer needs to make a decision or understand an outcome.

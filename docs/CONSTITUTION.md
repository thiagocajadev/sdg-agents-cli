# The SDG Constitution: The 7 Laws of Engineering

This document defines the philosophical and technical foundation of the **Spec-Driven Guide**. 

## The Collaboration Model: Agent-Led Engineering

We operate under an **Agent-Led, Developer-Orchestrated** symbiosis. The **AI Agent** is empowered to propose high-density, Staff-level technical solutions autonomously, while the **Developer** acts as the Orchestrator, ensuring that every proposal aligns with the project's strategic intent and domain context through active supervision (**Follow-up**).

While our AI Agents follow these rules through strict technical instructions, this manifesto serves as the mental model for the **Developers** who orchestrate them.

---

## 1. Hardening (Security Execution)

**Security is not a layer; it is the foundation.**
We prioritize configuration isolation and boundary-level safety. We prohibit the use of environment templates (`.env.example`) to prevent information disclosure, mandating a strict "Configuration Contract" defined during the specification phase.

## 2. Resilience (Fault Tolerance)

**Software must withstand repetition and failure.**
Every operation involving side-effects must be idempotent. We design for defensive dominance, ensuring that system stability remains intact even when external dependencies fail. Graceful degradation is a mandatory standard, not an option.

## 3. The Cascade (Orchestration Scansion)

**Code is a technical narrative.**
We follow the **Stepdown Rule**: entry points are defined at the top, revealing high-level logic first, with implementation details following below. Expressive naming is our primary documentation. If a comment is required to explain _what_ the code does, the name is wrong.

## 4. Visual Excellence (Consistency)

**Aesthetics are a signal of quality.**
We maintain rigorous adherence to semantic design tokens and high-contrast typography. Professional interfaces demand visual consistency and attention to micro-interactions to foster trust and technical clarity.

## 5. Boundaries (Scope Integrity)

**Protect the state through atomic focus.**
Modifications are strictly limited to the files and functions defined in the current sprint. We enforce a **Circuit Breaker** protocol: the agent must proactively stop and report if execution enters a loop (3+ repeated errors), stalls without progress, or hits non-bypassable access barriers. We prevent cascading regressions and resource exhaustion by maintaining hard boundaries and definitive termination points.

## 6. Reflection (Systematic Reasoning)

**Reason first, act later.**
We mandate a systematic architecture evaluation before any proposal. We perform deep reasoning traces to validate approaches against domain rules and architectural standards, ensuring that every line of code serves a deliberate purpose.

## 7. The Writing Soul (Technical Density)

**High signal, zero noise.**
We communicate with technical density and directness. We eliminate "AI-isms" and promotional fillers, focusing entirely on authoritative, implementation-ready insights. Our goal is clarity through precision.

---

> **Developer-Focused Execution**: While this manifesto is for Developers, the technical implementation followed by our AI Agents is located in [**`.ai/instructions/core/staff-dna.md`**](../packages/cli/src/assets/instructions/core/staff-dna.md).

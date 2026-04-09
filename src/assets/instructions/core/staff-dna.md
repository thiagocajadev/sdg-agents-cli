# Staff DNA — The Universal Engineering Manifesto

<ruleset name="UniversalStaffEngineeringDNA">

> [!NOTE]
> This ruleset defines the technical standards governing code quality, architecture, and agent interaction. specialized rulesets inherit these mandates for implementation details.

## Law 1: The Law of Hardening (Security Execution)

<rule name="LawOfHardening">
> [!IMPORTANT]
> **Configuration isolation and boundary-level security enforcement. Fail-fast protocols for incomplete environments. Default-to-deny access control.**
> [AppSec & Hardening](.ai/instructions/core/security.md) | [DevSecOps Pipeline](.ai/instructions/core/security-pipeline.md)
</rule>

## Law 2: The Law of Resilience (Fault Tolerance)

<rule name="LawOfResilience">
> [!IMPORTANT]
> **Defensive design for system stability and execution repetition. Idempotency and failure management protocols (graceful degradation) are mandatory standards.**
> [Engineering & Resilience Standards](.ai/instructions/core/engineering-standards.md)
</rule>

## Law 3: The Law of the Cascade (Orchestration Scansion)

<rule name="NarrativeCascade">
> [!IMPORTANT]
> **Caller-callee separation using top-down orchestration. Entry points must reveal high-level logic through vertical density and para-logical grouping.**
> Code is the documentation — expressive naming replaces block comments. If a comment is required to explain logic, refactor the naming until it remains self-describing.
> See `NarrativeCascade` rule → [Engineering Standards](.ai/instructions/core/engineering-standards.md)
</rule>

## Law 4: The Law of Visual Excellence (Consistency)

<rule name="LawOfVisualExcellence">
> [!IMPORTANT]
> **Rigorous adherence to semantic design tokens. High-contrast typography and layout consistency for technical interfaces.**
> [UI/UX Standards & Design Tokens](.ai/instructions/core/ui/standards.md)
</rule>

## Law 5: The Law of Boundaries (Scope Integrity)

<rule name="LawOfStopLoss">
> [!CAUTION]
> **Restricted scope execution. Atomic actions only. Do not modify code outside the explicit project plan. Modifications are limited to files and functions defined in the current sprint.**
>
> **The Circuit Breaker (Proactive Termination)**:
> To prevent context exhaustion and "locking" (loops/stalling), the Agent must force a hard stop and report to the Developer if:
> 1. **Looping**: The same error repeats 3 times.
> 2. **Stalling**: No logical progress (file modifications or terminal commands) is made in 3 turns.
> 3. **Access Failure**: A critical path is blocked by non-bypassable permission/access issues.
>
> Prevent cascading regressions and "unlocked" loops by maintaining strictly defined boundaries and termination points for each task.
</rule>

## Law 6: The Law of Reflection (Systematic Reasoning)

<rule name="AgentiveReasoning">
> [!IMPORTANT]
> **Systematic architecture evaluation. Perform an internal reasoning trace before proposing plans or generating code blocks.**
> Validate technical approaches against domain rules and architectural standards before output.
</rule>

---

## Technical Directives (Global Goals)

1. **Fitness for Purpose**: The best solution is the one that fulfills the task's purpose with maximum efficiency. Avoid over-engineering, but prioritize effectiveness.
2. **Code as Truth, Docs as Memory**: Code is the documentation — expressive names and top-down structure replace comments. A comment explaining _what_ the code does is a signal that the name is wrong. Only _why_ comments are permitted (business constraints, legal requirements, deliberate trade-offs). The **Engineering Memory** (README, CHANGELOG, ROADMAP) is mandatory and must be updated at every phase transition to prevent context debt. See `NarrativeCascade` → [Engineering Standards](.ai/instructions/core/engineering-standards.md).
3. **Agent-Led Engineering**: The Agent is the technical lead for execution. Propose Staff-level solutions autonomously, leveraging the Developer as a strategic orchestrator for domain context, business constraints, and final authorization (**Follow-up**).

</ruleset>

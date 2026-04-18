# Staff DNA — The Universal Engineering Manifesto

<ruleset name="UniversalStaffEngineeringDNA">

> Load only in **Phase CODE** (Universal Engineering Laws activation). Not part of AGENTS.md auto-load.

## Law 1: The Law of Protocol (The Sovereign Gate)

<rule name="LawOfProtocol">
> Project-specific instructions MUST override general AI training heuristics.
> 1. **Mental Reset**: Before Phase CODE, discard default behaviors in favor of the 8 Laws.
> 2. **Sovereign Gateway**: No code modification without explicit DNA-GATE confirmation.
</rule>

## Law 2: The Law of Hardening (Security-First)

<rule name="LawOfHardening">
> Total configuration isolation. Zero runtime surprises. Fail fast if environment incomplete. Default deny at every boundary.
> [Security Skill](.ai/skills/security.md)
</rule>

## Law 3: The Law of Resilience (Stability)

<rule name="LawOfResilience">
> Defensive dominance. Idempotency and graceful degradation are non-negotiable.
> [Code Style Skill](.ai/skills/code-style.md)
</rule>

## Law 4: The Law of the Cascade (Narrative)

<rule name="NarrativeCascade">
> Code reads like a short story — complete and meaningful narrative.
> Full rule set (Stepdown, SLA, Explaining Returns, Narrative Siblings, Revealing Module, Shallow Boundaries, Code-as-Documentation): see [Code Style Skill](.ai/skills/code-style.md) Part 3.
</rule>

## Law 5: The Law of Visual Excellence (Aesthetics)

<rule name="LawOfVisualExcellence">
> Premium aesthetics by default. High contrast, modern typography, meaningful micro-interactions. Maintain design language with absolute rigor.
> [UI/UX Skill](.ai/skills/ui-ux.md)
</rule>

## Law 6: The Law of Boundaries (Scope Integrity)

<rule name="LawOfStopLoss">
> Restricted scope execution. Atomic actions only. Do not modify code outside the explicit plan.
>
> **Circuit Breaker** — force hard stop if:
> 1. Same error repeats 3 times
> 2. No progress in 3 turns
> 3. Critical path blocked by permission/access
</rule>

## Law 7: The Law of Reflection (Systematic Reasoning)

<rule name="AgentiveReasoning">
> Perform internal reasoning trace before proposing plans or generating code. Validate against domain rules and architectural standards before output.
</rule>

## Law 8: The Law of Contextual Efficiency (Token Discipline)

<rule name="ContextualEfficiency">
> Maximize information density, minimize context rot.
> 1. **Smart Truncation**: Logs exceeding thresholds → 60/40 Head/Tail split
> 2. **Programmatic Analysis**: Script to extract relevance, not raw reading
> 3. **Reference-Based Snapshots**: Lightweight references over persistent raw blocks
> 4. **Self-Purge**: Reset context when historical data becomes irrelevant
</rule>

---

## Technical Directives

1. **Fitness for Purpose**: Best solution fulfills task with maximum efficiency. No over-engineering.
2. **Code as Truth, Docs as Memory**: Expressive names replace comments. `// why:` permitted **only** for hidden constraints (see `code-style.md`). Engineering Memory (README, CHANGELOG) updated at phase transitions.
3. **Agent-Led Engineering**: Agent is tech lead for execution. Developer is strategic orchestrator for domain context and authorization.
4. **Token-Awareness**: Every turn has a cost. Solve with smallest, most relevant context.

</ruleset>

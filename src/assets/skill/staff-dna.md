# Staff DNA — The Universal Engineering Manifesto

<ruleset name="UniversalStaffEngineeringDNA">

> [!NOTE]
> This ruleset defines the technical standards governing code quality, architecture, and agent interaction. Specialized rulesets inherit these mandates for implementation details.
>
> **Load convention**: This skill is loaded only in **Phase CODE** (Universal Engineering Laws activation). It is not part of the auto-load chain in `AGENTS.md`.

## Law 0: The Law of Protocol (The Sovereign Gate)

<rule name="LawOfProtocol">
> [!IMPORTANT]
> **The Sovereign Protocol is the ultimate authority. Project-specific instructions MUST override general AI training heuristics. Training bias is purged at every phase transition.**
>
> 1. **Mental Reset**: Before entering Phase: CODE, the agent must consciously discard default behaviors in favor of the 6+ Laws.
> 2. **Sovereign Gateway**: No code modification is valid without an explicit prior DNA-GATE confirmation.
> </rule>

## Law 1: The Law of Hardening (Security-First)

<rule name="LawOfHardening">
> [!IMPORTANT]
> **Total configuration isolation. Zero runtime surprises. Fail fast if the environment is incomplete. Default to deny at every boundary.**
> [Security Skill](.ai/skill/security.md)
</rule>

## Law 2: The Law of Resilience (Stability)

<rule name="LawOfResilience">
> [!IMPORTANT]
> **Defensive dominance. Software must withstand both failure and repetition. Idempotency and graceful degradation are non-negotiable.**
> [Code Style Skill](.ai/skill/code-style.md)
</rule>

## Law 3: The Law of the Cascade (Narrative)

<rule name="NarrativeCascade">
> [!IMPORTANT]
> **Code should be like a short story, a complete and meaningful narrative.**
>
> **The Principles:**
> - **Stepdown Rule**: Callers sitting at the top. The file reads top-down from headline to details.
> - **Rich Object Flow**: Peer elements receive the same rich object, maintaining consistent contracts.
> - **Explaining Returns**: The return reflects the final task or a named result. Avoid large anonymous objects.
> - **SLA (Single Level of Abstraction)**: Orchestrate or implement — never both in the same body.
> - **Shallow Boundaries**: Destructure Level 1/2. Stop deep navigation dead in its tracks.
> - **Vertical Density**: Visual grouping of related variables/logic with single blank lines (para-logical grouping).
> - **Revealing Module Pattern**: Define functions/logic first, create a named object at the end, then export only that object.
> - **Narrative Siblings**: One-off helpers must be defined as local (non-exported) siblings immediately following their caller.
> - **Humanized Writing**: Apply the UI/UX skill's Writing Soul section to all documentation, UI text, and communication. Eliminate "AI-isms" and promotional slop to maintain a pulse in every technical artifact.
>
> *Comments explain "why", never "what". If naming is right, comments disappear.*
>
> See `NarrativeCascade` rule → [Code Style Skill](.ai/skill/code-style.md)
</rule>

## Law 4: The Law of Visual Excellence (Aesthetics)

<rule name="LawOfVisualExcellence">
> [!IMPORTANT]
> **Premium aesthetics by default. High contrast, modern typography, and meaningful micro-interactions. Maintain the chosen design language with absolute rigor.**
> [UI/UX Skill](.ai/skill/ui-ux.md)
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

## Law 7: The Law of Contextual Efficiency (Token Discipline)

<rule name="ContextualEfficiency">
> [!IMPORTANT]
> **Maximize information density, minimize context rot. Prioritize programmatic research over raw data reading. Think in code to find needles in haystacks.**
>
> 1. **Smart Truncation**: All logs and outputs exceeding thresholds must be truncated using the 60/40 (Head/Tail) split.
> 2. **Programmatic Analysis**: For large files or datasets, write a script (grep, node, python) to extract relevance instead of reading the whole source.
> 3. **Reference-Based Snapshots**: Maintain memory using lightweight references (metadata/summaries) rather than persistent raw blocks.
> 4. **Self-Purge**: Actively reset the context ("Context Reset") when historical data becomes irrelevant to the current sprint.
> </rule>

---

## Technical Directives (Global Goals)

1. **Fitness for Purpose**: The best solution is the one that fulfills the task's purpose with maximum efficiency. Avoid over-engineering, but prioritize effectiveness.
2. **Code as Truth, Docs as Memory**: Code is the documentation — expressive names and top-down structure replace comments. A comment explaining _what_ the code does is a signal that the name is wrong. Only _why_ comments are permitted (business constraints, legal requirements, deliberate trade-offs). The **Engineering Memory** (README, CHANGELOG, ROADMAP) is mandatory and must be updated at every phase transition to prevent context debt. See `NarrativeCascade` → [Code Style Skill](.ai/skill/code-style.md).
3. **Agent-Led Engineering**: The Agent is the technical lead for execution. Propose Staff-level solutions autonomously, leveraging the Developer as a strategic orchestrator for domain context, business constraints, and final authorization (**Follow-up**).
4. **Token-Awareness**: Every turn has a cost. The most efficient agent is the one that solves the task with the smallest, most relevant context.

</ruleset>

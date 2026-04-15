# Technical Documentation — Context Preparation

Executing documentation for: $ARGUMENTS.

> **Load now**: `.ai/instructions/templates/workflow.md` — defines all phases (SPEC, END) you will follow in this cycle.

---

## Phase: SPEC (The Contract) — MODE: PLANNING

Follow the **Phase: SPEC** from the **Working Protocol**, using these templates for the "Drafting" logic:

### Template A: CHANGELOG (Keep a Changelog)

```md
## [vX.Y.Z] - YYYY-MM-DD

### Added | Changed | Fixed | Removed

- [Brief entries from Unreleased]
```

### Template B: FEAT (Feature Specification)

```md
# FEAT-[NNN]: [Feature Name]

## Status: Draft | Review | Approved

## Goal / Context / Solution / Verification
```

### Template C: ADR (Architecture Decision Record)

```md
# ADR-[NNN]: [Decision Title]

## Context (Why) / Decision (What) / Consequences (Impact)
```

---

## Phase: END (The Delivery) — MODE: PLANNING

Follow the **Phase: END** from the **Working Protocol**. Documentation must be accurate and mirror the code state perfectly. Sync the backlog and **WAIT** for authorization before any `commit`/`push` proposal.

---

> [!TIP]
> **Multi-Agent Optimization (Claude Code only)**
>
> The Docs Cycle is entirely analytical — there is no CODE phase, so Fast is never invoked. All phases run under the **Planning** role.
>
> | Phase      | Role         | Why                                                       |
> | :--------- | :----------- | :-------------------------------------------------------- |
> | SPEC + END | **Planning** | Document classification, structure review, accuracy check |
>
> Planning's strength here is accuracy and coherence: cross-referencing code state, CHANGELOG history, and ADR decisions before committing any documentation artifact.
>
> Read `.ai/instructions/core/agent-roles.md` for the full protocol.

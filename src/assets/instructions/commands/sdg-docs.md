# Technical Documentation — Context Preparation

Executing documentation for: $ARGUMENTS. This command prepares the context for the **Docs Cycle**.

## Step 0 — Document Classification

1. **Context Check**: Identify the document type needed based on the goal:
   - **CHANGELOG**: Release entry or version synchronization → `CHANGELOG.md` at project root.
   - **FEAT (Especificação da Funcionalidade)**: Document _what_ was built and _how_ it fits the pipeline → `docs/specs/FEAT-NNN-slug.md`.
   - **ADR (Architecture Decision Record)**: Document _why_ a technical path was chosen (trade-offs) → `docs/decisions/ADR-NNN-slug.md`.
2. **Numbering**: Use sequential zero-padded numbers (`ADR-001`, `FEAT-042`). Check existing files to find the next available number.
3. **Current Alignment**: Read existing files in the target directory to maintain style and numbering consistency.

---

## Phase: SPEC (Draft Specialization)

Follow the **Phase: SPEC** from the **Working Protocol**, using these templates for the "Drafting" logic:

### Template A: CHANGELOG (Keep a Changelog)

```md
## [vX.Y.Z] - YYYY-MM-DD

### Added | Changed | Fixed | Removed

- [Brief entries from Unreleased]
```

### Template B: FEAT (Especificação da Funcionalidade)

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

---

## Phase: END (Hardened)

Follow the **Phase: END** from the **Working Protocol**. Documentation must be accurate and mirror the code state perfectly. Sync the backlog and **WAIT** for authorization before `commit`/`push`.

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

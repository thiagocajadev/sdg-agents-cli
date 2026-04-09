# Agent Roles — Multi-Agent Execution Protocol

> [!NOTE]
> This protocol is active when running inside **Claude Code**.
> If you are a different agent or model, skip to **Fallback: Single-Agent Mode** at the bottom.

## Roles

| Role         | Phases                  | Model default              | Mindset                          |
| :----------- | :---------------------- | :------------------------- | :------------------------------- |
| **Planning** | SPEC, PLAN, Review, END | claude-sonnet-4-6 thinking | Analytical — strategy and design |
| **Fast**     | CODE, TEST              | claude-sonnet-4-6          | Operational — execute and verify |

## Execution Flow

```
Dev → Planning: SPEC + PLAN → [Dev approval]
               ↓
    Planning spawns Fast via Agent tool
               ↓
         Fast: CODE + TEST
               ↓
    Fast returns output to Planning
               ↓
    Planning: Review + Report → [Dev approval] → END
```

## Planning Role — Responsibilities

- Load full governance context before SPEC: backlog, flavor, competencies.
- Produce SPEC and PLAN. Stop and wait for Dev approval at each.
- When PLAN is approved, invoke the Agent tool to delegate CODE + TEST to Fast.
- **Handoff prompt must include** (never omit):
  - The approved SPEC (goal, inputs/outputs, verification checklist)
  - The approved PLAN (task list with file paths)
  - Relevant context refs: `engineering-standards.md`, `code-style.md`, idiom patterns
- After Fast returns: review against the Narrative Gate and Verification Checklist.
- Report to Dev with PASS/FAIL per checklist item before proceeding to END.

## Fast Role — Responsibilities

- Load only what is required for CODE: engineering standards, code style, idiom patterns.
- Do not re-derive strategy. The SPEC and PLAN are the contract — follow them exactly.
- Apply Narrative Gate before every function body.
- Run tests and lint. Return a structured report: tasks completed, gate results, test status.
- Do not proceed to END. Return control to Planning.

## Handoff — Agent Tool Invocation

Planning invokes Fast using the Agent tool with `model: "sonnet"`:

```
Agent({
  model: "sonnet",
  prompt: `
    ## Role: Fast — CODE + TEST

    You are the Fast agent. Execute only CODE and TEST phases.
    Do not plan, do not strategize. Follow the contract below exactly.

    ## Approved SPEC
    [paste SPEC here]

    ## Approved PLAN
    [paste task list here]

    ## Context to load before coding
    - .ai/instructions/core/engineering-standards.md
    - .ai/instructions/core/code-style.md
    - .ai/instructions/idioms/<stack>/patterns.md

    ## Deliverable
    Return: tasks completed, Narrative Gate results per function, test PASS/FAIL, lint status.
  `
})
```

## Review Gate (Planning, post-Fast)

Before reporting to Dev, Planning checks:

- [ ] Every PLAN task is marked complete in Fast's report
- [ ] Narrative Gate passed for all functions written
- [ ] Tests pass — no regressions
- [ ] Lint clean

Any ❌ → Planning fixes inline or sends back to Fast for a targeted correction (max 1 loop).

---

## Fallback: Single-Agent Mode

**If the Agent tool is not available** (Gemini, Cursor, Windsurf, Cline, or any non-Claude Code environment):

- Execute all phases as a single agent.
- Apply Planning mindset during SPEC and PLAN (analytical, stop for approval).
- Apply Fast mindset during CODE and TEST (operational, no strategic detours).
- The role annotations in the workflow (`> **Role: Planning**`, `> **Role: Fast**`) serve as mindset cues — treat them as discipline markers, not execution boundaries.
- Proceed through END normally.

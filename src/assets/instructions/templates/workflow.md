# Working Protocol (Spec Driven Design + Token Discipline)

<ruleset name="WorkingProtocol">

> [!NOTE]
> Standard operational workflow for AI agents. This is the **Single Source of Truth** for the context-driven lifecycle.

## Intent Routing

On every request, classify intent before acting:

| Signal                    | Cycle                                                                       |
| :------------------------ | :-------------------------------------------------------------------------- |
| `feat: ...`               | Read `.ai/commands/sdg-feat.md` (Context Charge) → Follow **Feature Cycle** |
| `fix: ...`                | Read `.ai/commands/sdg-fix.md` (Context Charge) → Follow **Fix Cycle**      |
| `docs: ...`               | Read `.ai/commands/sdg-docs.md` (Context Charge) → Follow **Docs Cycle**    |
| Trivial change            | CODE directly → END (no CHANGELOG)                                          |
| No prefix, intent unclear | Ask once: "feat, fix, or docs?" — then proceed                              |

**Trivial:** change a color, rename a variable, fix a typo, adjust spacing — single isolated change with no new behavior or contract.

---

## Phase: SPEC (The Contract)

> <rule name="PhaseSPEC">
> [!IMPORTANT]
> Structure the intent before any implementation. **Stop and wait for approval.**

### Instructions

- **Goal:** One sentence summary.
- **Domain:** Backend | Frontend | Fullstack.
- **Inputs / Outputs:** Clearly defined contracts.
- **Configuration Contract**: List all required environment variables with their purpose (keys must be **abstract**; no committed templates like `.env.example`).
- **Specialization**:
  - **Feat**: Focus on **Domain Modeling** and **Public Interfaces**.
  - **Fix**: Focus on **Root Cause Analysis (RCA)** and **Reproduction Case**.
  - **Docs**: Focus on **Structure and Accuracy** — select the appropriate template (CHANGELOG / FEAT / ADR) before drafting.
- **Verification Checklist:** Binary pass/fail criteria (max 5 items).
- **Hard Rule**: You **MUST STOP** and wait for explicit Developer approval before proceeding.
  > </rule>

## Phase: PLAN (The Strategy)

> <rule name="PhasePLAN">
> [!NOTE]
> After spec is approved, produce a numbered task list ordered by logical execution sequence. **Stop and wait for approval.**

### Instructions

- **Action Verb + Object**: Each task must be atomic (e.g., "1. Create User repository").
- **Logical Order**: Tasks must be sequenced so each step unblocks the next — foundation before consumers, contracts before implementations, data layer before orchestration.
- **Effort Estimate**: Tag each task with a relative size — structural criteria are primary, time is a secondary reference:
  - `[S]` — 1–2 files, isolated scope, no cross-layer tracing (≤ 5 min)
  - `[M]` — 3–5 files, cross-layer impact, completes in one session (5–15 min)
  - `[L]` — 6+ files or cross-session risk — **must** be split into sub-tasks (> 15 min)
- **Task Decomposition**: Any task tagged `[L]` or that spans multiple layers **MUST** be split into numbered sub-tasks (e.g., `1.1`, `1.2`) to prevent context/token exhaustion.
- **Constraint**: Skip this phase ONLY if the task is trivial (single-file, self-contained change).
- **Backlog Sync**:
  - `[M]` / `[L]`: write all tasks to `.ai-backlog/tasks.md` under `## Backlog` with `[TODO]`; move first to `## Active` as `[IN_PROGRESS]`.
  - `[S]`: skip `tasks.md` — update only `context.md ## Now` at END.
- **Hard Rule**: You **MUST STOP** and wait for explicit Developer approval before proceeding.
  > </rule>

## Phase: CODE (The Execution)

> <rule name="PhaseCODE">
> [!IMPORTANT]
> Follow the approved plan strictly.

### Instructions

- **Context Load**: Before writing any code, ensure all of the following are loaded:
  - `competencies/` (backend and/or frontend) and `flavor/principles.md`
  - `.ai/instructions/core/engineering-standards.md` — CleanCodeTactical rules
  - `.ai/instructions/core/code-style.md` — NarrativeCascade and Vertical Scansion

- **Narrative Gate (mandatory self-check before writing each function)**:
  Verify all items pass before committing any implementation:
  - [ ] **Stepdown Rule**: Entry point is the topmost function — callers above callees in the file
  - [ ] **SLA**: Each function either orchestrates OR implements — never both in the same body
  - [ ] **Guard Clauses**: All nested conditionals replaced with early returns
  - [ ] **Explaining Returns**: Return value assigned to a named `const` — never anonymous inline objects or ternaries
  - [ ] **Lexical Scoping**: One-off helpers defined inside their only caller, not at module level
  - [ ] **Vertical Density**: Related variables grouped together; single blank line between logical blocks

- **Result Pattern**: Prefer `Result<T>` when it meaningfully clarifies the happy/failure split — do not force it where idiomatic error handling is already clear.
- **YAGNI**: No features or refactors outside the approved SPEC.
- **Blockers**: Surface issues immediately; do not work around them silently.
  > </rule>

## Phase: TEST (The Verification)

> <rule name="PhaseTEST">
> [!IMPORTANT]
> Verify against the Verification Checklist.

### Instructions

- **Regression Focus**: For `fix:` cycles, the test MUST prove the bug no longer reproduces and no regressions exist.
- **Fix Loop (max 3x)**: If any test FAILs, fix and re-run.
- **Lint Fix**: After tests pass, run `lint --fix` (or equivalent) if a lint script is available in the project. Resolve all auto-fixable violations before leaving this phase. If non-auto-fixable violations remain, surface them explicitly.
- **Reporting**: Report PASS/FAIL for every checklist item plus lint status. If still failing after 3 loops, STOP and report.
  > </rule>

## Phase: END (The Delivery)

> <rule name="PhaseEND">
> [!NOTE]
> Close the cycle and sync documentation. **No delivery without explicit curation and authorization.**

### END Checklist (mandatory — execute in order, mark each before proceeding)

- [ ] **SUMMARIZE** — one sentence per completed PLAN task written in response
- [ ] **CHANGELOG** — entry appended under `## [Unreleased]` (`### Added` for feat, `### Fixed` for fix; skip for docs)
- [ ] **BACKLOG: tasks.md** — all completed tasks moved to `## Done` with `[DONE]` status
- [ ] **BACKLOG: context.md** — \`## Now\` updated with next objective or cleared
- [ ] **INSIGHTS** — log patterns, research findings, or rework in \`context.md\` ## Engineering Insights (curate stale or irrelevant items)
- [ ] **CURATE** — final scan for slop, "AI-isms", and unfinished comments. Run `git status` to ensure only intended changes are staged.
- [ ] **LINT** — if lint script exists (`lint`, `lint:fix`, `lint:all`, or config file detected), run it; auto-fix what's possible; block commit if errors remain
- [ ] **COMMIT** — **PROPOSE** the commit message and **WAIT** for explicit Developer approval
- [ ] **PUSH** — **ASK** for explicit permission before pushing to remote

> [!WARNING]
> Do NOT consider the cycle closed until every applicable item above is checked.
> If any item is skipped, the cycle is **INCOMPLETE** — return and complete it before accepting new work.
> </rule>

## Rule: Task Handoff (Cross-Session & Cross-Agent Continuity)

> <rule name="TaskHandoff">
> [!IMPORTANT]
> `.ai-backlog/tasks.md` is the single source of truth for work state. Any agent, any session, any model can continue from it.

### Session Start

1. Read `.ai-backlog/context.md` — understand the project brief.
   - **Local Priority**: Always look for the `.ai-backlog/` folder in the current directory first to avoid redundancy.
   - **If missing**: analyze the project (read `package.json`, `README.md`, entry points, folder structure) and generate `.ai-backlog/context.md` using the bootstrap template below. Announce: _"context.md created with initial analysis. Review and adjust as needed."_ Never overwrite an existing file.
2. Read `.ai-backlog/tasks.md` — check for `[IN_PROGRESS]` tasks before accepting new work.
3. If an `[IN_PROGRESS]` task exists: resume it. Announce what was in progress and continue from the checkpoint.

#### context.md Bootstrap Template

```md
# <project-name> — <one-line description>

stack: <detected from package.json dependencies>
pattern: <detected architectural pattern>
entry: <main entry point file>

## Decisions

- <decision inferred from code or config>: <rationale>

## Now

- Ready for next instruction.

## Engineering Insights

- [topic]: [lesson learned or research finding]
```

### Checkpoint (after each atomic task)

- Mark the completed task as `[DONE]` and move it to `## Done`.
- Move the next task to `## Active` as `[IN_PROGRESS]` with a one-line context note: what was done and what comes next.

### Proactive Handoff (approaching token/context limit)

- When the response is growing long or the next task is complex, **stop proactively**.
- Write a checkpoint to `.ai-backlog/tasks.md`: current task stays `[IN_PROGRESS]` with a note of exactly where it stopped and what the next step is.
- Announce: _"Approaching context limit. Saved checkpoint to `.ai-backlog/tasks.md`. Start a new session and the agent will continue from here."_

### Recovery (if tasks.md is lost or missing)

- Read the last 10–20 git commits (`git log --oneline -20`) to reconstruct completed work.
- Rebuild `tasks.md` from commit history and any remaining in-progress files.
  > </rule>

## Rule: Cycle Continuity (Conversation During Active Cycles)

> <rule name="CycleContinuity">
> [!NOTE]
> An active cycle (feat/fix/docs) stays open until END is reached. Mid-cycle messages do not close or restart the cycle.

When a message arrives during an active cycle, classify it before acting:

| Message type                 | Example                                   | Action                                                                        |
| :--------------------------- | :---------------------------------------- | :---------------------------------------------------------------------------- |
| **Question / clarification** | "why did you choose this approach?"       | Answer directly, then resume the cycle                                        |
| **Plan adjustment**          | "skip step 3" / "add a step for X"        | Update the plan, confirm if the change is significant, continue               |
| **Pivot**                    | "change the approach entirely"            | Return to SPEC, revise, wait for re-approval                                  |
| **Unrelated request**        | "fix this other thing while you're at it" | Flag it as out-of-scope. Finish the current cycle first, then start a new one |

**Hard Rule**: Never interpret a conversational message as a new `feat:` or `fix:` while a cycle is active. The cycle closes only at END.

> </rule>

## Rule: Token & Context Discipline

> <rule name="TokenDiscipline">
> [!NOTE]
> Maximize technical density, minimize token waste.

- **Conclusions Only**: Think step-by-step internally; output only conclusions and code.
- **No Fillers**: No "Certainly!", "Great question", or re-summarizing unchanged code.
- **File:Line References**: When discussing code, use `file:line` syntax instead of snippets.
- **Context Awareness**: If the conversation is too long, acknowledge it and suggest cleaning up the memory (archiving tasks).
- **The Circuit Breaker (Anti-Loop/Anti-Stall)**:
  - **Stop & Report** if the same error repeats 3 times.
  - **Stop & Report** if no physical progress (file writes/commands) is made in 3 turns.
  - **Stop & Report** if blocked by non-bypassable permission or access issues.
  > </rule>

</ruleset>

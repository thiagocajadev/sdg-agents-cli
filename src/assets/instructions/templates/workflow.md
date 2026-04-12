# Working Protocol (Spec Driven Design + Token Discipline)

<ruleset name="WorkingProtocol">

> [!NOTE]
> Standard operational workflow for AI agents. This is the **Single Source of Truth** for the context-driven lifecycle.

## Intent Routing

On every request, classify intent before acting:

| Signal                    | Cycle                                                                          |
| :------------------------ | :----------------------------------------------------------------------------- |
| `land: ...`               | Read `.ai/commands/sdg-land.md` → Follow **Land Cycle** (inception only)       |
| `feat: ...`               | Read `.ai/commands/sdg-feat.md` (Context Charge) → Follow **Feature Cycle**    |
| `fix: ...`                | Read `.ai/commands/sdg-fix.md` (Context Charge) → Follow **Fix Cycle**         |
| `docs: ...`               | Read `.ai/commands/sdg-docs.md` (Context Charge) → Follow **Docs Cycle**       |
| `end:`                    | Read `.ai/commands/sdg-end.md` → Execute **END Phase** checklist (no argument) |
| No prefix, intent unclear | Ask once: "land, feat, fix, or docs?" — then proceed                           |

---

## Phase: SPEC (The Contract)

> **Role: Planning**

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

> **Role: Planning**

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
- **Backlog Sync**:
  - `[M]` / `[L]`: write all tasks to `.ai-backlog/tasks.md` under `## Backlog` with `[TODO]`; move first to `## Active` as `[IN_PROGRESS]`.
  - `[S]`: skip `tasks.md` — update only `context.md ## Now` at END.
- **Hard Rule**: You **MUST STOP** and wait for explicit Developer approval before proceeding.
  > </rule>

## Phase: CODE (The Execution)

> **Role: Fast**

> <rule name="PhaseCODE">
> [!IMPORTANT]
> Follow the approved plan strictly.

### Instructions

- **Context Load**: Before writing any code, load based on domain scope:
  - `engineering-standards.md` and `code-style.md` — always required
  - `competencies/backend.md` — if domain includes backend
  - `competencies/frontend.md` — if domain includes frontend
  - `flavor/principles.md` — if architectural pattern is relevant to the task

- **Narrative Gate (hard gate — output before writing each function)**:
  Output this checklist with ✅/❌ before writing any function body.
  Any ❌ = redesign first. This gate cannot be skipped or internalized.

  _Structure_
  - [ ] **Stepdown Rule** — entry point is topmost; callers above callees in the file
  - [ ] **SLA** — this function orchestrates OR implements, never both in the same body
  - [ ] **Guard Clauses** — all nested conditionals replaced with early returns
  - [ ] **Lexical Scoping** — one-off helpers defined inside their only caller, not at module level

  _Expression_
  - [ ] **Explaining Returns** — return value assigned to a named `const`; no bare `return ok(...)` or anonymous inline objects
  - [ ] **Shallow Boundaries** — no property chain deeper than 3 levels; extract a named `const` slice first
  - [ ] **Vertical Density** — related variables grouped together; single blank line between logical blocks

  _Naming_
  - [ ] **Expressive Names** — every name reveals its role without needing a comment
  - [ ] **Boolean Prefix** — `isLoading`, `hasError`, `isActive`; never bare `loading`, `error`, `active`
  - [ ] **No Abbreviations** — `request`/`response`; never `req`/`res`; no framework exception

  _Documentation_
  - [ ] **Code as Documentation** — no "what" comments; only `// why:` for non-obvious constraints or deliberate trade-offs

  _Module (per file)_
  - [ ] **Revealing Module Pattern** — named object + named export at file footer; no `export default`
  - [ ] **No God Modules** — no `helpers.js`, `utils.js`, `common.js`; name files by domain + operation

- **Result Pattern**: Prefer `Result<T>` when it meaningfully clarifies the happy/failure split — do not force it where idiomatic error handling is already clear.
- **YAGNI**: No features or refactors outside the approved SPEC.
- **Blockers**: Surface issues immediately; do not work around them silently.
  > </rule>

## Phase: TEST (The Verification)

> **Role: Fast**

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

> **Role: Planning**

> <rule name="PhaseEND">
> [!NOTE]
> Close the cycle and sync documentation. **No delivery without explicit curation and authorization.**

### END Checklist (mandatory — execute in order, mark each before proceeding)

- [ ] **SUMMARIZE** — one sentence per completed PLAN task written in response
- [ ] **CHANGELOG** — Prepare your technical narrative in the `CHANGELOG.md` under `## [Unreleased]`. This MUST be done before bumping.
- [ ] **BUMP** — run \`npm run bump <feat|fix>\` to promote CHANGELOG and package.json version. Skip if not applicable.
- [ ] **BACKLOG: tasks.md** — all completed tasks moved to `## Done` with `[DONE]` status
- [ ] **BACKLOG: context.md** — \`## Now\` updated with next objective or cleared
- [ ] **KNOWLEDGE** — Log any patterns, findings, or rework discovered during this cycle. Update \`.ai-backlog/learned.md\` (for successful feats) or \`.ai-backlog/troubleshoot.md\` (for fixed incidents). Curate stale or irrelevant items.
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
   - **If missing**: analyze the project (read `package.json`, `README.md`, `CHANGELOG.md`, entry points, folder structure) and generate `.ai-backlog/context.md` using the bootstrap template below. Announce: _"context.md created with initial analysis. Review and adjust as needed."_ Never overwrite an existing file.
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

**Hard Rule**: Never interpret a conversational message as a new `land:`, `feat:`, or `fix:` while a cycle is active. The cycle closes only at END.

> </rule>

## Rule: Token Discipline 2.0 (GSD + Caveman)

> <rule name="TokenDiscipline">
> [!IMPORTANT]
> **Maximize technical density. Minimal linguistic fluff.**
> Follow `.ai/skill/CAVEMAN.md` (Caveman Full) for all chat interactions.

- **GSD (Fresh Contexts)**: After atomic task `END`, suggest new chat session to purge context rot.
- **Mouth Smaller**: No articles, fillers, or hedging. Start with conclusions.
- **Pedagogical on Demand**: Use "Writing Soul" for project docs; use Caveman for chat.
- **No Slop**: No "Certainly!", "Great question", or re-summarizing unchanged code.
- **File:Line References**: Use `file:line` instead of code snippets where possible.
- **Circuit Breaker**: Stop if same error repeats 3 times or no progress in 3 turns.
  > </rule>

</ruleset>

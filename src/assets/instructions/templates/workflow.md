# Working Protocol (Spec Driven Design + Token Discipline)

<ruleset name="WorkingProtocol">

> [!NOTE]
> Standard operational workflow for AI agents. This is the **Single Source of Truth** for the context-driven lifecycle.

## 5 Steps

A practical workflow for every development cycle:

- **SPEC (THE CONTRACT)**: Write down what you're building and why. No code until there's a clear agreement.
- **PLAN (THE STRATEGY)**: Break the work into ordered steps. Small and clear enough that anyone can follow.
- **CODE (THE EXECUTION)**: Follow the plan. Write what was agreed, nothing more.
- **TEST (THE VERIFICATION)**: Check that what was built matches what was agreed. Catch problems before they ship.
- **END (THE DELIVERY)**: Close the cycle: update the changelog, sync the backlog, and move on.

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

## Phase: SPEC (The Contract) — MODE: PLANNING

> <rule name="PhaseSPEC">
> [!IMPORTANT]
> Structure the intent before any implementation. **Stop and wait for approval.**
>
> 1. **Intent Classification**: Reads the request and identifies the intent: `land:`, `feat:`, `fix:`, `docs:` or `end:`.
> 2. **Goal Definition**: Writes one sentence describing what will be built and why.
> 3. **Domain & Contracts**: Defines the domain (Backend / Frontend / Fullstack) and the inputs and outputs.
> 4. **Verification Checklist**: Creates up to 5 yes/no checkpoints to confirm the work is done right.
> 5. **Approval Gate**: Stops and waits for your approval before writing any code.
>    </rule>

## Phase: PLAN (The Strategy) — MODE: PLANNING

> <rule name="PhasePLAN">
> [!NOTE]
> After spec is approved, produce a numbered task list ordered by logical execution sequence. **Stop and wait for approval.**
>
> 1. **Task Breakdown**: Breaks the spec into concrete tasks. Each one starts with an action verb.
> 2. **Logical Sequencing**: Orders tasks by dependency: what needs to exist first, goes first.
> 3. **Effort Tagging**: Tags each task by size: `[S]` small · `[M]` medium · `[L]` large (must be split).
> 4. **Sub-task Split**: Breaks every `[L]` task into numbered steps: 1.1, 1.2...
> 5. **Backlog Sync**: Saves all tasks to `.ai-backlog/tasks.md` and marks the first one as in progress.
> 6. **Approval Gate**: Stops and waits for your approval before writing any code.
>    </rule>

## Phase: CODE (The Execution) — MODE: FAST

> <rule name="PhaseCODE">
> [!IMPORTANT]
> Follow the approved plan strictly.
>
> 1. **Context Load**: Reads the project's standards and style guide before writing anything (read `engineering-standards.md`, `code-style.md`, and competencies).
> 2. **Quality Gate**: Reviews every function against the guide's readability rules before moving on.
>
> _Narrative Gate Checklist:_
>
> - [ ] **Stepdown Rule** — entry point is topmost; callers above callees in the file
> - [ ] **SLA** — this function orchestrates OR implements, never both in same body
> - [ ] **Guard Clauses** — all nested conditionals replaced with early returns
> - [ ] **Lexical Scoping** — one-off helpers defined inside their only caller
> - [ ] **Explaining Returns** — return value assigned to a named `const`; no bare returns
> - [ ] **Boolean Prefix** — `isLoading`, `hasError`, `isActive`; never bare `loading`, `error`
> - [ ] **Code as Documentation** — no "what" comments; only `// why:` for non-obvious constraints
>
> 3. **Plan Adherence**: Follows the agreed plan. No extra features or refactors outside what was approved.
> 4. **Blocker Surface**: Raises blockers immediately. Never quietly works around them.
>    </rule>

## Phase: TEST (The Verification) — MODE: FAST

> <rule name="PhaseTEST">
> [!IMPORTANT]
> Check that what was built matches what was agreed.
>
> 1. **Checklist Verification**: Goes through every item on the Spec's Verification Checklist.
> 2. **Regression Check**: For `fix:` cycles: confirms the bug is gone and nothing else broke.
> 3. **Fix Loop**: If something fails: fix and re-run. Up to 3 attempts before escalating.
> 4. **Lint Fix**: Runs the linter and fixes what it can before wrapping up.
> 5. **Report**: Reports the result of each checklist item and lint status before moving on.
>    </rule>

## Phase: END (The Delivery) — MODE: PLANNING

> <rule name="PhaseEND">
> [!NOTE]
> Close the cycle: update the changelog, sync the backlog, and move on.
>
> 1. **Task Summary**: Writes one sentence per completed task.
> 2. **Changelog**: Adds an entry under `## [Unreleased]`: `### Added` for feat · `### Fixed` for fix.
> 3. **Backlog Sync**: Moves all finished tasks to `## Done` in `tasks.md`.
> 4. **Context Update**: Updates `## Now` in `context.md` with the next objective or clears it.
> 5. **Lint**: Runs the linter, fixes what's possible, and blocks the commit if errors remain.
> 6. **Commit**: Proposes a commit message and waits for your approval.
> 7. **Next step**: Suggests what comes next: push · deploy · or a new task.
>
> [!WARNING]
> Do NOT perform `git commit` autonomously. Always **PROPOSE** and **WAIT**.
> </rule>

## Rule: Task Handoff (Cross-Session & Cross-Agent Continuity)

> <rule name="TaskHandoff">
> [!IMPORTANT]
> `.ai-backlog/tasks.md` is the single source of truth for work state. Any agent, any session, any model can continue from it.

### Session Start

1. **Terminal Sanity Check**: Run `node -v` and `npm -v` (or the project's primary toolchain) to "wake up" the terminal and confirm execution capabilities in the current shell.
2. Read `.ai-backlog/context.md` — understand the project brief.
   - **Local Priority**: Always look for the `.ai-backlog/` folder in the current directory first to avoid redundancy.
   - **If missing**: analyze the project (read `package.json`, `README.md`, `CHANGELOG.md`, entry points, folder structure) and generate `.ai-backlog/context.md` using the bootstrap template below. Announce: _"context.md created with initial analysis. Review and adjust as needed."_ Never overwrite an existing file.
3. Read `.ai-backlog/tasks.md` — check for `[IN_PROGRESS]` tasks before accepting new work.
4. If an `[IN_PROGRESS]` task exists: resume it. Announce what was in progress and continue from the checkpoint.

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

**State Recovery**: After any conversational interruption, explicitly state your current position before continuing.
_Example: "Resuming Cycle Feat — Phase: SPEC — Step 3 (Domain & Contracts)."_

**Hard Rule**: Never interpret a conversational message as a new `land:`, `feat:`, or `fix:` while a cycle is active. The cycle closes only at END.

> </rule>

## Rule: Token Discipline 2.0 (GSD + Caveman)

> <rule name="TokenDiscipline">
> [!IMPORTANT]
> **Maximize technical density. Minimal linguistic fluff.**
> Follow `.ai/instructions/core/caveman.md` (Caveman Full) for all chat interactions.

- **GSD (Fresh Contexts)**: After atomic task `END`, suggest new chat session to purge context rot.
- **Mouth Smaller**: No articles, fillers, or hedging. Start with conclusions.
- **Pedagogical on Demand**: Use "Writing Soul" for project docs; use Caveman for chat.
- **No Slop**: No "Certainly!", "Great question", or re-summarizing unchanged code.
- **File:Line References**: Use `file:line` instead of code snippets where possible.
- **Circuit Breaker**: Stop if same error repeats 3 times or no progress in 3 turns.
  > </rule>

</ruleset>

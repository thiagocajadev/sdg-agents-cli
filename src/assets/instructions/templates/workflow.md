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

| Signal                    | Cycle                                                                                  |
| :------------------------ | :------------------------------------------------------------------------------------- |
| `land: ...`               | Read `.ai/commands/sdg-land.md` → Follow **Land Cycle** (inception only)               |
| `feat: ...`               | Read `.ai/commands/sdg-feat.md` (Context Charge) → Follow **Feature Cycle**            |
| `fix: ...`                | Read `.ai/commands/sdg-fix.md` (Context Charge) → Follow **Fix Cycle**                 |
| `docs: ...`               | Read `.ai/commands/sdg-docs.md` (Context Charge) → Follow **Docs Cycle**               |
| `end:`                    | Read `.ai/commands/sdg-end.md` → Execute **END Phase** checklist (no argument)         |
| `audit:`                  | Read `.ai/commands/sdg-audit.md` → Run `npx sdg-agents audit` → Follow **Audit Cycle** |
| No prefix, intent unclear | Ask once: "land, feat, fix, docs, or audit?" — then proceed                            |

> **Mid-cycle messages**: classify as Q&A (answer + resume), adjustment (update plan + continue), pivot (re-spec), or out-of-scope (defer). Never interpret as a new cycle while one is active.

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
> 5. **Context Report**: Run `wc -c` on the command file and backlog files read (`context.md`, `tasks.md`). Sum bytes ÷ 4, add 4K for base instructions. Show inline: `📊 ~N tokens loaded`.
> 6. **Approval Gate**: Stops and waits for your approval before writing any code.
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
> 6. **Impact Map**: Write `.ai-backlog/impact-map.md`. Run `git diff --name-only HEAD` (fallback: `git status --short`) to list changed files. For each, trace imports to find dependents (Blast Radius) and test files at risk. Sections: `## Changed`, `## Blast Radius`, `## Tests at Risk`, `## Safe`. This map is the agent's read-list for Phase CODE — skip everything outside it.
> 7. **Cost Estimate**: Run `wc -c` on all files in `## Changed` + `## Blast Radius`. Sum bytes ÷ 4, add context already loaded + 8K for conversation overhead. Show before approval:
>    > 📊 Task estimate: ~N tokens
> 8. **Approval Gate**: Stops and waits for your approval before writing any code.
>    </rule>

## Phase: CODE (The Execution) — MODE: FAST

> <rule name="PhaseCODE">
> [!IMPORTANT]
> Follow the approved plan strictly.
>
> 1. **DNA-GATE & MENTAL RESET [LOCKED]**: Before starting, explicitly list which **Engineering Laws (staff-dna.md)** apply to the current task and why. Confirm mental alignment.
> 2. **Context Load**: Reads the project's standards and style guide before writing anything (read `engineering-standards.md`, `code-style.md`, and competencies).
> 3. **Quality Gate**: Apply Narrative Gate against every modified function (laws defined in `staff-dna.md`).
> 4. **Plan Adherence**: Follows the agreed plan. No extra features or refactors outside what was approved.
> 5. **Blocker Surface**: Raises blockers immediately. Never quietly works around them.
>    </rule>

## Phase: TEST (The Verification) — MODE: FAST

> <rule name="PhaseTEST">
> [!IMPORTANT]
> Check that what was built matches what was agreed.
>
> 1. **Checklist Verification**: Goes through every item on the Spec's Verification Checklist.
> 2. **Regression Check**: For `fix:` cycles: confirms the bug is gone and nothing else broke.
> 3. **Audit Gate (Confirmation)**: Analyzes the modified files against the Engineering Laws. The audit is the final confirmation that the **Phase: CODE** quality was maintained.
> 4. **Lint Fix**: Runs the linter and fixes what it can before wrapping up.
> 5. **Fix Loop (Circuit Breaker)**: If anything fails (Tests, Lint, or Audit): fall back to Phase CODE to fix, then re-run TEST. Max 3 attempts total. Upon the 3rd failure, STOP the cycle immediately and generate an explicit Failure Report for the developer so you can jointly explore alternatives.
> 6. **Report**: Reports the result of each checklist item, linting, and audit status before moving on.
>    </rule>

## Phase: END (The Delivery) — MODE: PLANNING

> <rule name="PhaseEND">
> [!NOTE]
> Close the cycle: update the changelog, sync the backlog, and move on.
>
> 1. **Task Summary**: Writes one sentence per completed task.
> 2. **Changelog**: Adds ONE entry for EVERY completed task. Every cycle that produces artifacts must be recorded — no commit is valid without a CHANGELOG entry.
>
>    | Cycle   | Section     | Use for                                   |
>    | :------ | :---------- | :---------------------------------------- |
>    | `feat:` | `### Added` | New feature or capability                 |
>    | `fix:`  | `### Fixed` | Bug resolved or behavior corrected        |
>    | `docs:` | `### Fixed` | Documentation corrected or aligned        |
>    | `land:` | `### Added` | New project backlog and inception context |
>
> 3. **Backlog Sync**: Moves all finished tasks to `## Done` in `tasks.md`.
> 4. **Context Update**: Updates `## Now` in `context.md` with the next objective or clears it.
> 5. **Map Reset**: Overwrite `.ai-backlog/impact-map.md` with the idle state below. If the file does not exist, skip (idempotent).
>
>    ```md
>    # Impact Map — No active cycle
>
>    > Volatile file. Created at Phase PLAN. Cleared at Phase END.
>    ```
>
> 6. **Lint**: Runs the linter, fixes what's possible, and blocks the commit if errors remain.
> 7. **Commit [LOCKED: COMMIT-GATE]**: If `package.json` has a `bump` script, execute `npm run bump <feat|fix|docs|land>` matching the active cycle type. Then audit workspace with `git add .` and propose the release commit (Pattern: `<intent>: release v<version> - <description>`).
>
>    [!CAUTION]
>    **STOP IMMEDIATELY.** You are forbidden from running `git commit` autonomously. You must present the proposed commit message to the user and await explicit verbal approval before proceeding.
>
> 8. **Session Gate [HARD STOP]**: Write one-line next objective to `.ai-backlog/context.md` under `## Now`. Then stop completely: _"Cycle complete. Context exhausted — **open a new session** to continue. Next: [objective]."_ Do not accept new work in this session.
>
> [!CAUTION]
> **SOVEREIGN GATE**: Never bypass human verification for commits. Autonomous commits are a violation of Law 0.
> </rule>

## Rule: Task Handoff (Cross-Session & Cross-Agent Continuity)

> <rule name="TaskHandoff">
> [!IMPORTANT]
> `.ai-backlog/tasks.md` is the single source of truth for work state. Any agent, any session, any model can continue from it.

### Checkpoint (after each atomic task)

- Mark the completed task as `[DONE]` and move it to `## Done`.
- Move the next task to `## Active` as `[IN_PROGRESS]` with a one-line context note: what was done and what comes next.

### Proactive Handoff (approaching token/context limit)

- Stop proactively. Write checkpoint to `tasks.md` (current task `[IN_PROGRESS]` + where it stopped + next step).
- Announce: _"Approaching context limit. Saved checkpoint. Start a new session to continue."_

### Recovery (if tasks.md is lost)

- Run `git log --oneline -20` to reconstruct. Rebuild `tasks.md` from commit history.
  > </rule>

## Rule: Token Discipline

> <rule name="TokenDiscipline">
> [!IMPORTANT]
> Maximize technical density. No filler. Start with conclusions.

- After `END`, suggest new chat session to clear context rot.
- No "Certainly!", "Great question", or re-summarizing unchanged code.
- Use `file:line` references instead of repeating code.
- Circuit Breaker: stop if same error repeats 3 times or no progress in 3 turns.
  > </rule>

</ruleset>

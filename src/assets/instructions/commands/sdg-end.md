# Cycle Terminator — END Phase

This command has no arguments. Type `end:` to close the active cycle.

Executing the **Phase: END** checklist from the **Working Protocol** in strict order. Each item must be completed before advancing to the next.

---

## Step 1 — SUMMARIZE

Write one sentence per completed PLAN task. If no PLAN existed (e.g. `[S]` tasks), write a one-line summary of what changed.

## Step 2 — CHANGELOG

Prepare your technical narrative in the `CHANGELOG.md`.

1. **Identify Strategy**:
   - **Automated**: If `auto-bump.mjs` exists, you **MUST** first manually populate the `## [Unreleased]` section with your technical narrative. The automated pipeline will promote this content to the new version header during the commit. **DO NOT commit with an empty [Unreleased] section.**
   - **Manual**: If no automation is present, you must promote the header manually (e.g., `## [1.2.0] - 2026-04-11`) or run the designated `bump` script.

2. **Append Entry**:
   - `feat:` cycle → Add under `### Added`
   - `fix:` cycle → Add under `### Fixed`
   - `docs:` cycle → Optional (for major architectural docs)
   - `land:` cycle → Skip

3. **Verify Header**: Ensure `## [Unreleased]` exists at the top. If missing, create it above the most recent version entry.

## Step 3 — BACKLOG: tasks.md

- Move all `[DONE]` tasks to `## Done`.
- If no active `tasks.md` existed (`[S]` cycle), skip.

## Step 4 — BACKLOG: context.md

Update `## Now` with the next objective, or set it to `Ready for next instruction.` if nothing is pending.

## Step 5 — KNOWLEDGE (INSIGHTS)

Log any patterns, findings, or rework discovered during this cycle. Curate stale or irrelevant entries.

- **feat:** cycle → Update `.ai-backlog/learned.md` with success patterns and research findings.
- **fix:** cycle → Update `.ai-backlog/troubleshoot.md` with the Root Cause Analysis (RCA) and "gotchas" discovered.
- **Other:** If specific insights exist but don't fit the above, announce them or update `.ai-backlog/learned.md`.

## Step 6 — CURATE

Scan all changed files for:

- Unfinished comments (`TODO`, `FIXME`, `...`)
- "AI-isms" or promotional language in docs/UI text
- Dead code introduced during the cycle

Run `git status` — confirm only intended files are staged.

## Step 7 — LINT

If a lint script exists (`lint`, `lint:fix`, `lint:all`, or a config file is detected):

- Run it and auto-fix what's possible.
- If non-auto-fixable violations remain, surface them explicitly.
- Block commit if errors remain.

## Step 8 — COMMIT & RELEASE

Propose the commit message and **WAIT** for explicit Developer approval before committing.

- **Option A (Manual)**: If you just want to save progress without a version bump, commit with `feat:` or `fix:`. Remember you **MUST** have content in `[Unreleased]`.
- **Option B (End Cycle)**: If the cycle is complete, run `npm run bump <fix|feat|major>` to consolidate the narrative and bump the version.

## Step 9 — PUSH

**ASK** for explicit permission before pushing to remote.
The `pre-push` hook will **BLOCK** the push if any `[Unreleased]` narrative remains (preventing unversioned leaks to main).

---

> [!WARNING]
> The cycle is **INCOMPLETE** until all applicable steps above are checked.
> Do not accept new work until END is fully executed.

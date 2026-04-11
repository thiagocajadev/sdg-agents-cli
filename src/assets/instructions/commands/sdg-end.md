# Cycle Terminator — END Phase

This command has no arguments. Type `end:` to close the active cycle.

Executing the **Phase: END** checklist from the **Working Protocol** in strict order. Each item must be completed before advancing to the next.

---

## Step 1 — SUMMARIZE

Write one sentence per completed PLAN task. If no PLAN existed (e.g. `[S]` tasks), write a one-line summary of what changed.

## Step 2 — CHANGELOG

- Append an entry under `## [Unreleased]` in `CHANGELOG.md`:

1. **Identify Version**: Check `package.json` (or equivalent) for the current version.
2. **Calculate Next**: Determine the next version (patch/minor) based on the cycle type (`feat` → minor/patch, `fix` → patch).
3. **Update Header**:
   - If the project uses auto-bump or a release is intended: Create/Update the header to `## [NEXT_VERSION] - YYYY-MM-DD`.
   - Otherwise: Append under `## [Unreleased]`.
4. **Append Entry**:
   - `feat:` cycle → `### Added`
   - `fix:` cycle → `### Fixed`
   - `docs:` cycle → skip this step
   - `land:` cycle → skip this step

If `## [Unreleased]` (or the appropriate version header) does not exist, create it above the most recent entry.

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

## Step 8 — COMMIT

Propose the commit message and **WAIT** for explicit Developer approval before committing.

## Step 9 — PUSH

**ASK** for explicit permission before pushing to remote.

---

> [!WARNING]
> The cycle is **INCOMPLETE** until all applicable steps above are checked.
> Do not accept new work until END is fully executed.

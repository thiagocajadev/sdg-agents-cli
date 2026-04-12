# Phase: END (The Delivery) — MODE: PLANNING

This command closes the current development cycle and is the **Ultimate Guarantor of Zero Context Leak**. Follow all 7 steps with total rigor.

---

## Step 1 — Task Summary

Write a concise summary of the work performed.

- One sentence per completed task from `.ai-backlog/tasks.md`.
- Focus on technical outcomes.

## Step 2 — Changelog Narrative

Update `CHANGELOG.md` to maintain the project's technical history.

- **Action**: Add entries under `## [Unreleased]`.
- **Categorization**: Use `### Added` for `feat:` or `### Fixed` for `fix:`.
- **Integrity**: Ensure the narrative allows for a professional semantic release.

## Step 3 — Backlog Sync & Catch-all Staging

Synchronize state and ensure ALL side-effects are captured.

- **Backlog**: Move all `Active` tasks to `Done` in `.ai-backlog/tasks.md`.
- **Catch-all Stage**: Run `git add .` to capture metadata updates (package-lock.json, manifests) and any uncommitted side-effects.
- **Audit**: Perform a **Zero Context Leak** check: no `TODO` remnants or internal-only files.

## Step 4 — Context Resilience (Bootstrap & Update)

Update the project context. If the project state is lost, this is the healing moment.

- **Self-Healing**: If `.ai-backlog/context.md` is missing, analyze the project and **Bootstrap** it using the template from `workflow.md`.
- **Update**: Set `## Now` to `Ready for next instruction.`.

## Step 5 — Technical Quality (Self-Healing Lint)

Perform a final quality sweep. No delivery with broken quality.

- **Lint**: Run the project's linting script.
- **Self-Healing**: If lint fails, you **MUST** run a one-time repair attempt (e.g., `npm run lint -- --fix`) before reporting a failure.
- **Blocker**: If non-auto-fixable errors remain, you **MUST** report them and stop.

## Step 6 — Semantic Release (Audit & Commit)

Execute the delivery using the automated semantic pipeline.

1. **Identify**: Determine if the cycle was a `feat` or `fix`.
2. **Execute**: Run `npm run bump <feat|fix>`.
3. **Workspace Audit**: Run `git status` to ensure the staging area is 100% clean and nothing was left behind after the bump. Stage any remaining metadata changes with `git add .`.
4. **Semantic Commit**: Propose exactly: `git commit -m "<feat|fix>: release v<version>"`.
5. **Approval**: **PROPOSE** and **WAIT** for explicit Developer authorization.

## Step 7 — Final Stroke (Push & Purge)

Complete the delivery cycle.

- **Push**: Propose `git push` to synchronize remote.
- **GSD**: Suggest starting a brand new chat session to purge the current context and prevent token rot.

---

> [!WARNING]
> The cycle is **INCOMPLETE** until all 7 steps are checked.
> You are **FORBIDDEN** from accepting new work until this phase is finalized and the workspace is clean.

---

> Read `.ai/instructions/core/agent-roles.md` for the multi-agent handoff protocol (Planning + Fast roles).

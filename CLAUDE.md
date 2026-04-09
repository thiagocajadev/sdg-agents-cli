# SDG Agents — Claude Code Governance

> [!IMPORTANT]
> This file is read automatically by Claude Code on every session start.
> Do not edit manually — regenerate with `npx sdg-agents init --claude`.

## Auto-Load: Governance Context

@.ai/skill/AGENTS.md

## Session Start Protocol

On every new session, execute in order:

1. **Check backlog**: Read `.ai-backlog/context.md` — understand the project brief. **Priority**: Always check the local directory first to avoid redundant scans.
2. **Check tasks**: Read `.ai-backlog/tasks.md` — resume any `[IN_PROGRESS]` task before accepting new work.
3. **Bootstrap if missing**: If `.ai-backlog/context.md` does not exist, follow the **Context Bootstrap** defined in the Working Protocol (loaded via `@.ai/skill/AGENTS.md` above).

## Intent Routing (quick reference)

| Prefix      | Action                                          |
| :---------- | :---------------------------------------------- |
| `land: ...` | Land Cycle — read `.ai/commands/sdg-land.md`    |
| `feat: ...` | Feature Cycle — read `.ai/commands/sdg-feat.md` |
| `fix: ...`  | Fix Cycle — read `.ai/commands/sdg-fix.md`      |
| `docs: ...` | Docs Cycle — read `.ai/commands/sdg-docs.md`    |
| `end:`      | END Phase — read `.ai/commands/sdg-end.md`      |

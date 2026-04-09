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
3. **Bootstrap if missing**: If `.ai-backlog/context.md` does not exist, run the Context Bootstrap below.

## Context Bootstrap (run only when .ai-backlog/context.md is absent)

Analyze the project silently and generate `.ai-backlog/context.md` using this template:

```md
# <project-name> — <one-line description derived from package.json or README>

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

**Rules:**

- Read: `package.json`, `README.md`, entry points, folder structure, `CHANGELOG.md`
- Only record what can be proven with evidence — never invent
- After generating, announce: _"context.md created with initial analysis. Review and adjust as needed."_
- If `context.md` already exists: **never overwrite it**

## Intent Routing (quick reference)

| Prefix         | Action                                          |
| :------------- | :---------------------------------------------- |
| `feat: ...`    | Feature Cycle — read `.ai/commands/sdg-feat.md` |
| `fix: ...`     | Fix Cycle — read `.ai/commands/sdg-fix.md`      |
| `docs: ...`    | Docs Cycle — read `.ai/commands/sdg-docs.md`    |
| Trivial change | CODE directly → END (no CHANGELOG)              |

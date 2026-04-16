# Land Cycle — Project Inception

Landing on project: $ARGUMENTS. Runs once before the first `feat:` — turns raw vision into a grounded, sequenced backlog.

> **Load now**: `.ai/instructions/templates/workflow.md`

## Outputs

- `## Vision` section → `.ai-backlog/context.md`
- Ordered epics → `.ai-backlog/tasks.md`
- STOP — explicit approval required before any `feat:`

## Phase: VISION — MODE: PLANNING

Parse input. Extract only what was explicitly stated:

- **What** is being built
- **For whom**
- **Core problem** (one sentence)
- **Signal**: greenfield (no code) or legacy (existing project)

If too vague → ask one clarifying question.

## Phase: SURVEY — MODE: PLANNING (legacy only, skip if greenfield)

Read silently: `package.json`, `README.md`, entry points, folder structure, `git log --oneline -10`. Identify stack, architecture pattern, pain points.

## Phase: SCOPE — MODE: PLANNING

Define MVP boundary:

- Constrain vision to realistic first release
- Explicitly list **out of scope** (name it — vague exclusions don't count)
- Legacy: diagnosis before new features
- **Max 7 epics** — merge or defer if more

Present scope boundary before generating backlog. If overambitious, say so and propose realistic MVP cut.

## Phase: BACKLOG — MODE: PLANNING

### 1. Update `context.md`

Add `## Vision` section (never overwrite existing content):

```md
## Vision

**Product:** [what] · **User:** [whom] · **Problem:** [one sentence]
**MVP Scope:** [in] · **Out of scope:** [deferred]
```

### 2. Write `tasks.md`

**Ordering (non-negotiable)**:

1. Foundation (scaffolding, config, CI)
2. Data/domain (models, repos, core logic)
3. Integration (APIs, external services)
4. Application (use cases, orchestration)
5. Delivery (UI, CLI, endpoints)
6. Hardening (auth, errors, observability)
7. Polish (docs, migration, release)

Legacy: add diagnosis epic at position 0.

Format: `### Epic N — [Name]` with `- [TODO] feat: [atomic task]` items.

## Phase: STOP — MODE: PLANNING

Present: vision (3 lines), scope (in/out), epic list with task counts. Stop completely. No code. Wait for explicit approval.

> Read `.ai/instructions/templates/agent-roles.md` for multi-agent handoff protocol.

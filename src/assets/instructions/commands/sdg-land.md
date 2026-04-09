# Land Cycle — Project Inception

We are landing on a project: $ARGUMENTS. This command runs once, at the very beginning — before the first `feat:` — to turn a raw vision into a grounded, sequenced backlog.

---

## What this cycle produces

| Output                                               | Where                    |
| :--------------------------------------------------- | :----------------------- |
| `## Vision` section added to `context.md`            | `.ai-backlog/context.md` |
| Ordered epics decomposed into `feat:` tasks          | `.ai-backlog/tasks.md`   |
| STOP — explicit approval required before any `feat:` | —                        |

---

## Phase: VISION

Parse the input prompt. Extract only what was explicitly stated — no assumptions, no embellishments.

Identify:

- **What** is being built (the product or system)
- **For whom** (the target user or operator)
- **The core problem** it solves (one sentence)
- **Signal** — greenfield (no existing code) or legacy (existing project)

If the prompt is too vague to extract these three points, ask one clarifying question before proceeding.

---

## Phase: SURVEY (legacy only — skip if greenfield)

Read the project silently. Do not announce findings yet.

- Read `package.json`, `README.md`, entry points, top-level folder structure
- Run `git log --oneline -10` to understand recent activity
- Identify: stack, main architectural pattern, biggest pain points visible from code

If the project has no code at all, treat it as greenfield.

---

## Phase: SCOPE

Define the MVP boundary. This is the most important step.

**Rules:**

- Constrain the vision to what is realistic for the first meaningful release
- Explicitly list what is **out of scope** (name it — vague exclusions don't count)
- For legacy projects: diagnosis always comes before new features
- Maximum **7 epics** — if you have more, merge or defer. A 20-item backlog is a liability, not a plan

Present the scope boundary before generating the backlog. If the vision is clearly overambitious, say so directly and propose a realistic MVP cut.

---

## Phase: BACKLOG

Generate two outputs:

### 1. Update `context.md`

Add a `## Vision` section. **Never overwrite existing content** — only add or append.

```md
## Vision

**Product:** [what is being built]
**User:** [for whom]
**Problem:** [core problem in one sentence]
**MVP Scope:** [what is in for v1]
**Out of scope:** [what is explicitly deferred]
```

If `context.md` does not exist, create it using the bootstrap template from the Working Protocol before adding `## Vision`.

### 2. Write `tasks.md` backlog

Structure the backlog as ordered epics, each decomposed into concrete `feat:` tasks. Every task must be actionable on its own.

**Ordering rules (non-negotiable):**

1. Foundation first — scaffolding, config, CI
2. Data/domain layer — models, repositories, core logic
3. Integration layer — APIs, external services, adapters
4. Application layer — use cases, orchestration
5. Delivery layer — UI, CLI, endpoints
6. Hardening — auth, error handling, observability
7. Polish — docs, migration, release

**For legacy projects:** add a diagnosis epic at position 0 — read, map, and document before changing anything.

**Format:**

```md
## Backlog

### Epic 1 — [Name]

- [TODO] feat: [atomic task]
- [TODO] feat: [atomic task]

### Epic 2 — [Name]

- [TODO] feat: [atomic task]
```

Move the first task of Epic 1 to `## Active` as `[IN_PROGRESS]` only after the developer approves.

---

## Phase: STOP

Present a summary of what was produced:

- The vision statement (3 lines)
- The scope boundary (in / out)
- The full epic list with task count per epic

Then stop completely. Do not begin any `feat:` — do not write any code. Wait for explicit developer approval.

**Hard Rule:** The Land Cycle ends here. The developer decides what comes next.

---

> [!TIP]
> **Multi-Agent Optimization (Claude Code only)**
>
> The Land Cycle is entirely strategic — all phases run under the **Planning** role. There is no CODE phase, so Fast is never invoked.
>
> | Phase                                    | Role         | Why                                            |
> | :--------------------------------------- | :----------- | :--------------------------------------------- |
> | VISION + SURVEY + SCOPE + BACKLOG + STOP | **Planning** | Pure analysis and decomposition — no execution |
>
> The output of this cycle (context.md + tasks.md) becomes the handoff document that Planning will use in future `feat:` cycles to brief Fast agents with precise, grounded context.
>
> Read `.ai/instructions/core/agent-roles.md` for the full protocol.

# Project Structure

This document describes every directory and file installed by `sdg-agents init`.

## Installed Tree

```text
your-project/
├── .ai/                         ← Instruction set (committed)
│   ├── skills/                  ← Engineering skills (loaded on-demand per cycle phase)
│   │   ├── AGENTS.md            ← Main entry point + skill registry
│   │   ├── code-style.md        ← Code style + Pre-Code Checklist + Pre-Finish Gate (Phase CODE core)
│   │   ├── testing.md           ← Test principles (loaded in Phase CODE/TEST)
│   │   ├── security.md          ← Security boundaries + pipeline rules
│   │   ├── api-design.md        ← API contracts and envelopes
│   │   ├── data-access.md       ← Repository layer and persistence boundaries
│   │   ├── observability.md     ← Logging, metrics, tracing
│   │   ├── ci-cd.md             ← Pipelines and deployment
│   │   ├── cloud.md             ← Cloud & containers
│   │   ├── sql-style.md         ← SQL query rules
│   │   └── ui-ux.md             ← Design thinking, presets, standards, architecture
│   ├── instructions/
│   │   ├── templates/           ← Working protocol (workflow.md), agent roles, context + stack + tasks seeds
│   │   ├── flavors/             ← Architectural patterns (vertical-slice, mvc, lite, legacy)
│   │   └── competencies/        ← Delivery contract — BFF envelope + UI contract execution (fused)
│   ├── commands/                ← Cycle command files (feat/fix/docs/audit/land/end)
│   └── backlog/                 ← Harness Engineering (Memory) — gitignored, local working state
│       ├── context.md           ← Project brief: vision, decisions, current state
│       ├── stack.md             ← Developer-declared languages/runtimes/versions (populated by land:)
│       ├── tasks.md             ← Task list (TODO / IN_PROGRESS / DONE)
│       ├── learned.md           ← Lessons learned: success patterns and research findings
│       ├── troubleshoot.md      ← Troubleshooting: RCA logs and critical failure records
│       └── impact-map.md        ← Blast-radius map: volatile, created at PLAN, cleared at END
└── (agent-specific root files — see below)
```

Agent-specific root files are also written based on which agents are selected during init: `CLAUDE.md` (Claude Code), `.cursor/rules/` (Cursor), `.windsurfrules` (Windsurf), `.github/copilot-instructions.md` (GitHub Copilot), `AGENTS.md` (Codex), `GEMINI.md` (Gemini), `.roo/rules/` (Roo Code).

---

## .ai/skills/ — Engineering Skills (on-demand)

The skill directory is the **canonical Single Source of Truth** for engineering rules. Each file is a self-contained skill unit with a defined load convention (most load in Phase CODE; `testing.md` also loads in Phase TEST).

### skills/AGENTS.md

The main entry point. Referenced by `CLAUDE.md` (and equivalent files for other agents) so it loads automatically at session start. It is a **minimal router**: header + session start checklist + semantic router + skill registry. It does not contain knowledge — it tells the agent which skill to load for the current task.

### skills/code-style.md

The **Phase CODE core**. Two-line Security-First block, code-style rules (naming, narrative, comments, tests, dependencies, structure, formatting, logging), and the two gates the agent must recite:

- **Pre-Code Checklist** (Phase CODE entry, before the first `Edit` / `Write`) — Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers.
- **Pre-Finish Gate** (Phase TEST) — eight binary items wired to narrative heuristic validators in `governance.mjs` (Stepdown, SLA, Explaining Returns, banned abbreviations, Boolean prefix, Revealing Module Pattern, Vertical Density, No section banners).

### skills/testing.md

Test principles: structure, regression requirements, red-green-refactor, integration vs. unit boundaries.

### skills/security.md

Security rules: configuration isolation, PII handling, secret management, and the security pipeline (pre-commit hooks, dependency scanning, static analysis).

### skills/api-design.md · data-access.md · observability.md · ci-cd.md · cloud.md · sql-style.md · ui-ux.md

Domain skills. Each covers its concern end-to-end — for example, `api-design.md` defines the response envelope, error code table, REST hierarchy, and standardization protocols. Loaded only when the current task touches the relevant domain.

---

## .ai/instructions/ — Non-skill rulesets

### instructions/templates/

- `workflow.md` — The 5-phase Working Protocol (SPEC → PLAN → CODE → TEST → END), Task Handoff rule, Token Discipline rule. This is the **only** file that is always in context beyond `AGENTS.md`.
- `agent-roles.md` — Multi-agent handoff protocol (Planning + Fast roles).
- `context.md`, `tasks.md`, `learned.md`, `troubleshoot.md` — Templates for the `.ai/backlog/` files.

### instructions/flavors/

Rules for the project's architectural pattern. Defines where logic belongs — for example, whether business logic lives in UseCases, Services, or Controllers. One flavor per project: `vertical-slice`, `mvc`, `lite`, `legacy`.

### instructions/competencies/

A single file, `delivery.md`, covering both sides of the delivery contract with internal discriminators:

- `## Backend (load if the task is server-side)` — BFF response envelope (SSOT), execution flow (Validate → Load Dep → Business Rules → Core Logic → Persist → Filter → Envelope), typed layer results, entry-point discipline.
- `## Frontend (load if the task is UI)` — Design Thinking, wireframe discipline, visual layers, HTTP integration via `apiClient → Service → useApi → Component`, component hierarchy rules.

Loaded on demand by the SPEC phase of a `feat:` cycle when the cycle command requests it. The agent picks whichever half matches the task.

> **Stack specificity.** Static language idiom catalogs were retired in v5.0. Stack lives in `.ai/backlog/stack.md`, written by the `land:` cycle — the agent reads it on every session to know which languages/versions the project actually uses.

---

## .ai/commands/ — Cycle Command Files

Context files loaded on demand when a specific cycle is triggered:

- `sdg-feat.md` — loaded when the agent enters a `feat:` cycle
- `sdg-fix.md` — loaded when the agent enters a `fix:` cycle
- `sdg-docs.md` — loaded when the agent enters a `docs:` cycle
- `sdg-audit.md` — loaded when the agent enters an `audit:` cycle
- `sdg-land.md` — loaded when the agent enters a `land:` cycle
- `sdg-end.md` — loaded when the agent enters the `end:` phase

These files are not loaded on session start — only when the relevant cycle begins.

---

## .ai/backlog/

Gitignored. Persists project state across sessions so any agent — in any session — can pick up where the last one stopped.

**context.md** — written on first run, maintained by the agent at the END of each cycle. Captures:

- Vision, architectural decisions, and their rationale
- Current objective (`## Now`)
- Developer metadata (`## Partner`)

**stack.md** — placeholder written on install, populated by the `land:` cycle. Single source of truth for project stack (languages, runtimes, frameworks, versions) grouped by role (Backend / Frontend / Data / Scripts). Phase CODE reads this file on every session.

**tasks.md** — the task list. Tracks atomic units of work across sessions:

- `[TODO]` — pending
- `[IN_PROGRESS]` — the active task (only one at a time)
- `[DONE]` — completed (kept for reference)

The agent reads this at session start before accepting new work.

**learned.md** — the "Brain" of successful patterns. Captures:

- Research findings and validated hypotheses
- Reusable architecture patterns that worked well for this project
- Specialized terminology and "Staff" level engineering insights

**troubleshoot.md** — the "Immune System" of the project. Captures:

- **Root Cause Analysis (RCA)** for every fix executed
- Failure logs and "gotchas" discovered during development
- Technical debt and fragile areas to be avoided in future cycles

**impact-map.md** — the "Blast-Radius Filter" of the active cycle. Volatile by design:

- **Created** at Phase PLAN via `git diff --name-only HEAD` + import scanning
- **Read** at Phase CODE — the agent loads only the files listed here, ignoring the rest of the codebase
- **Cleared** at Phase END — reset to an idle state so the next cycle starts clean
- **Regenerated** at Session Start if missing — the agent rebuilds it from `git diff` if an `[IN_PROGRESS]` task is detected in `tasks.md`

The map contains three sections: `## Changed` (files directly modified), `## Blast Radius` (files that import or call a changed file), and `## Tests at Risk` (test files covering blast-radius files). A `## Safe` section optionally marks directories that can be skipped entirely.

This design is inspired by the structural philosophy of [code-review-graph](https://github.com/tirth8205/code-review-graph) — a knowledge graph tool that uses Tree-sitter ASTs and MCP to give AI agents precise context. Instead of parsing ASTs or running a Python server, the Impact Map achieves the same goal through a lightweight protocol: the agent uses `git diff` and import scanning to build a minimal read-list at the start of every cycle. No external tools, no extra dependencies — just a markdown file and a disciplined workflow.

---

## How the Files Are Used Per Phase

| Phase         | Files read                                                                                                 |
| :------------ | :--------------------------------------------------------------------------------------------------------- |
| Session Start | `.ai/backlog/context.md`, `.ai/backlog/stack.md`, `.ai/backlog/tasks.md`                                   |
| SPEC          | `commands/sdg-<cycle>.md`, `.ai/backlog/context.md`, `.ai/backlog/tasks.md`                                |
| PLAN          | `.ai/backlog/tasks.md`, `.ai/backlog/impact-map.md` (written here via `git diff`)                          |
| CODE          | `skills/code-style.md` + domain skills + `competencies/delivery.md` on demand, `.ai/backlog/impact-map.md` |
| TEST          | `skills/testing.md` — Includes **Audit Gate** (drift detection) and **Circuit Breaker** (3-strike rule)    |
| END           | `.ai/backlog/context.md`, `.ai/backlog/tasks.md`, `learned.md`, `troubleshoot.md`, `commands/sdg-end.md`   |

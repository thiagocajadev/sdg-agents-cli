# Project Structure

This document describes every directory and file installed by `sdg-agents init`.

## Installed Tree

```text
your-project/
├── .ai/                         ← Instruction set (committed)
│   ├── skill/
│   │   └── AGENTS.md            ← Main entry point — auto-loaded by agents
│   ├── instructions/
│   │   ├── core/                ← Base rules (security, style, naming, testing)
│   │   │   ├── ui/              ← UI-specific rules (design tokens, component standards)
│   │   │   ├── staff-dna.md     ← Engineering laws (the 7 principles)
│   │   │   └── engineering-standards.md ← Tactical rules (clean code, resilience, DoD)
│   │   ├── creative/            ← Creative Toolkit (Branding, Social Media, Landing Pages)
│   │   ├── flavors/             ← Architectural patterns (vertical-slice, mvc, etc.)
│   │   ├── idioms/              ← Language conventions (typescript, python, go, etc.)
│   │   ├── competencies/        ← Layer rules (frontend, backend)
│   │   └── templates/           ← Context and backlog templates
│   ├── commands/                ← Context files for feat/fix/docs cycles
│   ├── workflows/               ← Workflow protocol
│   └── dev-guides/              ← Reference files and guides
│       └── prompt-tracks/       ← SPEC phase prompt templates
└── .ai-backlog/                 ← Harness Engineering (Memory) — gitignored
    ├── context.md               ← Project brief: stack, tech decisions, current state
    ├── tasks.md                 ← Task list (TODO / IN_PROGRESS / DONE)
    ├── learned.md               ← Lessons learned: success patterns and research findings
    ├── troubleshoot.md          ← Troubleshooting: RCA logs and critical failure records
    └── impact-map.md            ← Blast-radius map: volatile, created at PLAN, cleared at END
```

Agent-specific root files are also written (`CLAUDE.md`, `.cursorrules`, `.windsurfrules`, etc.) based on which agents are detected or selected during init.

---

## .ai/ — Instruction Set

### skill/AGENTS.md

The main entry point. This file is referenced by `CLAUDE.md` (and equivalent files for other agents) so it loads automatically at session start. It contains the working protocol and links to all other instruction files.

### instructions/core/

Non-negotiable rules that apply to every project, regardless of stack or flavor:

| File                       | Purpose                                                        |
| :------------------------- | :------------------------------------------------------------- |
| `staff-dna.md`             | The 7 engineering laws (security, resilience, cascade, etc.)   |
| `engineering-standards.md` | Tactical clean code rules and definition of done               |
| `code-style.md`            | Narrative Cascade and Vertical Scansion conventions            |
| `naming.md`                | Naming rules (no abbreviations, banned verbs, etc.)            |
| `writing-soul.md`          | Communication rules (no filler, no AI-isms, technical density) |
| `security-pipeline.md`     | Prevents leaking PII and environment variable templates        |
| `testing-principles.md`    | Test structure and regression requirements                     |

### instructions/creative/

Specialized rules for creative and branding workflows. These include:

- **Branding**: Brand DNA, visual identity, and logo technical specs.
- **Social Media**: Platform-specific strategy (IG, TikTok, LinkedIn, YouTube) including safe zones and prompt logic.
- **Landing Pages**: Conversion-focused blueprints and conversion structural patterns.
- **Tactic Guides**: Pro-level creative prompting and platform engagement rules.

### instructions/flavors/

Rules for the project's architectural pattern. Defines where logic belongs — for example, whether business logic lives in UseCases, Services, or Controllers.

### instructions/idioms/

Language-specific conventions. Each idiom file covers patterns, anti-patterns, and idiomatic usage for that stack (TypeScript, Python, Go, etc.).

### instructions/competencies/

Layer-specific rules for frontend and backend work — data flow, component boundaries, API contract rules.

### commands/

Context files loaded on demand when a specific cycle is triggered:

- `sdg-feat.md` — loaded when the agent enters a `feat:` cycle
- `sdg-fix.md` — loaded when the agent enters a `fix:` cycle
- `sdg-docs.md` — loaded when the agent enters a `docs:` cycle
- `sdg-audit.md` — loaded when the agent enters an `audit:` cycle
- `sdg-land.md` — loaded when the agent enters a `land:` cycle
- `sdg-end.md` — loaded when the agent enters the `end:` phase

These files are not loaded on session start — only when the relevant cycle begins.

### dev-guides/prompt-tracks/

Prompt templates for authoring the SPEC phase (replaces the legacy `prompts/` directory):

- `00-lite-mode` — single-file or isolated changes
- `01-new-evolution` — multi-layer features
- `02-legacy-modernization` — refactoring existing code

---

## .ai-backlog/

Gitignored. Persists project state across sessions so any agent — in any session — can pick up where the last one stopped.

**context.md** — written on first run, maintained by the agent at the END of each cycle. Captures:

- Stack and frameworks used
- Architectural decisions and their rationale
- Current objective (`## Now`)
- Developer metadata (`## Partner`)

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

| Phase | Files read                                                                                                          |
| :---- | :------------------------------------------------------------------------------------------------------------------ |
| SPEC  | `dev-guides/prompt-tracks/`, `commands/sdg-feat.md` (or fix/docs/audit/land)                                        |
| PLAN  | `.ai-backlog/tasks.md`, `.ai-backlog/impact-map.md` (written here via `git diff`)                                   |
| CODE  | `core/code-style.md`, `core/engineering-standards.md`, `learned.md`, `troubleshoot.md`, `.ai-backlog/impact-map.md` |
| TEST  | `core/testing-principles.md` — Includes **Audit Gate** (drift detection) and **Circuit Breaker** (3-strike rule)    |
| END   | `.ai-backlog/context.md`, `.ai-backlog/tasks.md`, `learned.md`, `troubleshoot.md`, `commands/sdg-end.md`            |

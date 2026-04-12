# Project Structure

This document describes every directory and file installed by `sdg-agents init`.

## Installed Tree

```text
your-project/
├── .ai-backlog/                 ← Harness Engineering (Memory) — gitignored
│   ├── context.md               ← Project brief: stack, tech decisions, current state
│   ├── tasks.md                 ← Task list (TODO / IN_PROGRESS / DONE)
│   ├── learned.md               ← Lessons learned: success patterns and research findings
│   └── troubleshoot.md          ← Troubleshooting: RCA logs and critical failure records
└── .ai/                         ← Instruction set (committed)
    ├── skill/
    │   └── AGENTS.md            ← Main entry point — auto-loaded by agents
    ├── instructions/
    │   ├── core/                ← Base rules (security, style, naming, testing)
    │   │   ├── ui/              ← UI-specific rules (design tokens, component standards)
    │   │   ├── staff-dna.md     ← Engineering laws (the 7 principles)
    │   │   └── engineering-standards.md ← Tactical rules (clean code, resilience, DoD)
    │   ├── flavors/             ← Architectural patterns (vertical-slice, mvc, etc.)
    │   ├── idioms/              ← Language conventions (typescript, python, go, etc.)
    │   ├── competencies/        ← Layer rules (frontend, backend)
    │   └── templates/           ← Context and backlog templates
    ├── commands/                ← Context files for feat/fix/docs cycles
    ├── workflows/               ← Workflow protocol
    └── prompts/
        └── dev-tracks/          ← SPEC phase prompt templates
```

Agent-specific root files are also written (`CLAUDE.md`, `.cursorrules`, `.windsurfrules`, etc.) based on which agents are detected or selected during init.

---

## .ai-backlog/

Gitignored. Persists project state across sessions so any agent — in any session — can pick up where the last one stopped.

**context.md** — written on first run, maintained by the agent at the END of each cycle. Captures:

- Stack and frameworks used
- Architectural decisions and their rationale
- Current objective (`## Now`)

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

These files are not loaded on session start — only when the relevant cycle begins.

### prompts/dev-tracks/

Prompt templates for authoring the SPEC phase:

- `00-lite-mode` — single-file or isolated changes
- `01-new-evolution` — multi-layer features
- `02-legacy-modernization` — refactoring existing code

---

## How the Files Are Used Per Phase

| Phase | Files read                                                                             |
| :---- | :------------------------------------------------------------------------------------- |
| SPEC  | `prompts/dev-tracks/`, `commands/sdg-feat.md` (or fix/docs)                            |
| PLAN  | `.ai-backlog/tasks.md`                                                                 |
| CODE  | `core/code-style.md`, `core/engineering-standards.md`, `learned.md`, `troubleshoot.md` |
| TEST  | `core/testing-principles.md`                                                           |
| END   | `.ai-backlog/context.md`, `.ai-backlog/tasks.md`, `learned.md`, `troubleshoot.md`      |

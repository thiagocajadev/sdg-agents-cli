<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/docs/img/sdg-agents-icon-light.svg" alt="SDG Agents" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide — Agents</h1>
  <p align="center">
    A CLI that installs a structured instruction set for AI agents into your project.<br>
    <a href="docs/README.pt-BR.md">Versão em Português (Brasil)</a>
  </p>
  <p align="center">
      Read the manifesto and visual guide at <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D24-brightgreen?style=flat-square&logo=nodedotjs" alt="Node" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
</div>

<br>

`sdg-agents` installs a set of markdown instruction files into your project. AI agents (Claude Code, Cursor, Windsurf, Copilot, Codex, and others) read these files and follow the defined protocol for every task.

> **Note:** If your agent does not pick up the rules automatically, reference `.ai/skills/AGENTS.md` at the start of the session.

The instruction set covers:

- **Working protocol**: a 5-phase cycle (SPEC → PLAN → CODE → TEST → END) that structures how the agent handles any task. Includes **Quality Gate** (CODE), **Audit Gate** (TEST), and a 3-strike **Circuit Breaker** (STOP) to prevent regression loops.
- **Engineering Laws**: 8 universal laws (Protocol, Hardening, Resilience, Narrative Cascade, Visual Excellence, Boundaries, Reflection, Contextual Efficiency) loaded only in Phase CODE.
- **Skills, on-demand**: code style, testing, security, API design, data access, observability, CI/CD, cloud, SQL style, UI/UX — each a self-contained skill unit loaded only when the current cycle needs it.
- **Language idioms**: idiomatic conventions for your specific stack (JS, TS, Python, C#, Java, Kotlin, Go, Rust, Swift, Flutter, SQL, VB.NET).
- **Architectural flavors**: rules for your project's structural pattern (vertical slice, MVC, lite, legacy).
- **Any-agent compatible**: a single canonical `.ai/skills/AGENTS.md` that any AI agent (Claude Code, Cursor, Windsurf, Copilot, Codex, Gemini, Cline/Roo) can reference. `CLAUDE.md` is auto-generated at the repo root for Claude Code; other tools are wired up by a one-line pointer (see "Using with other IDEs" below).
- **Harness Engineering (Memory)**: a `.ai-backlog/` folder that persists context and task state across sessions.
- **Impact Map**: a volatile blast-radius file (`.ai-backlog/impact-map.md`) created at Phase PLAN and cleared at Phase END — tells the agent exactly which files to load for the current cycle, keeping context lean and focused.

---

## Quick Start

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/docs/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI in action" /></kbd>
</p>

The interactive wizard guides you through selecting an architectural flavor and one or more language idioms. For non-interactive use:

```bash
# Zero-prompt install (lite + JS/TS defaults)
npx sdg-agents init --quick

# TypeScript + Vertical Slice
npx sdg-agents init --flavor vertical-slice --idiom typescript

# Multi-idiom
npx sdg-agents init --flavor mvc --idiom typescript,python
```

---

## What Gets Installed

After running `init`, your project receives:

```
your-project/
├── .ai/                         ← Instruction set (committed)
│   ├── skills/                  ← Engineering skills (loaded on-demand per cycle phase)
│   │   ├── AGENTS.md            ← Main entry point + skill registry
│   │   ├── staff-dna.md         ← 8 Engineering Laws (loaded in Phase CODE)
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── ... (api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux)
│   ├── instructions/            ← Flavors, idioms, competencies, templates
│   └── commands/                ← Cycle commands (feat/fix/docs/audit/land/end)
└── .ai-backlog/                 ← Harness Engineering (Memory) — gitignored
    └── ...                      ← (See docs/PROJECT-STRUCTURE.md for details)
```

`.ai/skills/AGENTS.md` is a minimal router: it lists all available skills and loads them on demand. Only `workflow.md` (the 5-phase protocol) is always in context — everything else activates only when the current cycle needs it.

`CLAUDE.md` at the repo root is a thin pointer that `@`-imports `.ai/skills/AGENTS.md`, so Claude Code auto-loads the governance on every session. Other IDEs are wired up by pointing their native config file at the same canonical file — see "Using with other IDEs" below.

> For a detailed breakdown of each file's role, see [Project Structure](docs/PROJECT-STRUCTURE.md).

---

## How the Protocol Works

When you prefix a message to the agent, it enters the corresponding cycle:

| Trigger               | Cycle   | What happens                                                                                                                                        |
| :-------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `land: <description>` | Land    | Agent turns a raw vision into a grounded backlog of sequenced `feat:` tasks — runs before any code is written                                       |
| `feat: <description>` | Feature | Agent runs SPEC → PLAN → CODE → TEST → END                                                                                                          |
| `fix: <description>`  | Fix     | Agent runs SPEC → PLAN → CODE → TEST → END with RCA focus                                                                                           |
| `docs: <description>` | Docs    | Agent updates changelogs, ADRs, or specs                                                                                                            |
| `audit: <scope>`      | Audit   | Agent verifies project alignment against rulesets (drift detection)                                                                                 |
| `end:`                | —       | Close the active cycle — runs the END Phase checklist (changelog, backlog, commit). Also recovers a cycle if the agent loses track mid-conversation |
| No prefix             | —       | Agent asks: "land, feat, fix, docs, or audit?" — then proceeds                                                                                      |

The agent **stops and waits for your approval** at SPEC and PLAN before writing any code.

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

> Type `end:` to close the active cycle. The agent runs the full END checklist — changelog, backlog sync, commit proposal. If the agent loses track mid-conversation, `end:` also recovers the cycle.

For a detailed walkthrough of each phase and its rules, see [Spec-Driven Development Guide](docs/SPEC-DRIVEN-DEV-GUIDE.md).
For a visual breakdown of the internal decision gates and loops, see [Agent Deep-Flow](docs/AGENT-DEEP-FLOW.md).

---

## Architectural Flavors

Select the flavor that matches your project's structure:

| Flavor           | Pattern                                 | Use when                     |
| :--------------- | :-------------------------------------- | :--------------------------- |
| `vertical-slice` | Feature-driven vertical cuts            | Monorepo or domain-heavy API |
| `mvc`            | Classic layered (Model-View-Controller) | Standard REST service        |
| `lite`           | Minimal scaffold                        | Scripts, CLIs, utilities     |
| `legacy`         | Refactor-safe bridge patterns           | Migrating existing codebases |

For the data flow diagram of each flavor, see [Architectural Pipelines](docs/PIPELINES.md).

---

## Language Idioms

Install language-specific patterns alongside the protocol:

`typescript` · `javascript` · `python` · `csharp` · `java` · `kotlin` · `go` · `rust` · `swift` · `flutter` · `sql` · `vbnet`

```bash
# Single idiom
npx sdg-agents init --idiom typescript

# Multi-idiom (polyglot projects)
npx sdg-agents init --idiom typescript,python,go
```

To add or extend support for a language, paste the idiom skill file into your agent via prompt — no CLI subcommand needed.

---

## Using with other IDEs

`sdg-agents` generates a single canonical governance file at `.ai/skills/AGENTS.md` and a `CLAUDE.md` pointer at the repo root. Claude Code auto-loads it with no extra step. For other tools, add a one-line pointer in your IDE's native rules file:

| Agent            | Native config file                 | How to wire it                                                                   |
| :--------------- | :--------------------------------- | :------------------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (root, auto-generated) | Auto-loaded. No action required.                                                 |
| Cursor           | `.cursor/rules/sdg-agents.mdc`     | Create the file with a single line: `Read .ai/skills/AGENTS.md before any task.` |
| Windsurf         | `.windsurfrules`                   | Same pointer line.                                                               |
| GitHub Copilot   | `.github/copilot-instructions.md`  | Same pointer line.                                                               |
| Codex CLI        | `AGENTS.md` (root)                 | Already at repo root via `.ai/skills/AGENTS.md`; or create a thin pointer file.  |
| Gemini CLI       | `GEMINI.md`                        | Same pointer line.                                                               |
| Cline / Roo Code | `.clinerules`                      | Same pointer line.                                                               |

> **Prefer a custom preset, voice, or skill?** Paste the skill content into your agent as a prompt — the same way `docs/REFERENCES.md` documents external influences. Custom skills do not require a CLI subcommand.

---

## Maintenance

```bash
npx sdg-agents review    # Detect drift between local rules and source
npx sdg-agents sync      # Update rulesets from source
npx sdg-agents update    # Refresh the LTS version registry
npx sdg-agents audit     # Run governance audit (law violations, drift)
npx sdg-agents clear     # Remove the .ai/ folder
```

---

## Reference

- [Quick Reference (CHEATSHEET)](docs/CHEATSHEET.md) — all CLI flags and agent triggers
- [Project Structure](docs/PROJECT-STRUCTURE.md) — detailed breakdown of every generated file
- [Architectural Pipelines](docs/PIPELINES.md) — data flow diagrams for each flavor
- [Engineering Laws (CONSTITUTION)](docs/CONSTITUTION.md) — the principles behind the rules
- [UI/UX System](docs/UI-UX.md) — design philosophy, hierarchy, surface tonal scale, presets, and external research references
- [Roadmap](docs/ROADMAP.md) — planned work
- [Changelog](CHANGELOG.md) — release history
- [Token Optimization](docs/TOKEN-OPTIMIZATION.md) — cost model, compaction process, and routing efficiency
- [Migration v2 → v3](docs/MIGRATION-v3.md) — breaking changes and step-by-step migration guide
- [Credits and Philosophies](docs/REFERENCES.md) — project influences and research credits

---

> **Warning:** This project is in early development. Review and adjust the installed rules to fit your team's standards before relying on them.

_Balance is the key._

SDG is in constant evolution. There is no perfect solution, only continuous improvement. Feel free to contribute, fork, and share.

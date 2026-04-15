<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/src/assets/img/sdg-agents-icon-light.svg" alt="SDG Agents" width="480" height="480" style="border-radius: 1rem;">
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

> **Note:** If your agent does not pick up the rules automatically, reference `.ai/skill/AGENTS.md` at the start of the session.

The instruction set covers:

- **Working protocol**: a 5-phase cycle (SPEC → PLAN → CODE → TEST → END) that structures how the agent handles any task. Includes **Quality Gate** (CODE), **Audit Gate** (TEST), and a 3-strike **Circuit Breaker** (STOP) to prevent regression loops.
- **Engineering rules**: naming, code style, clean code standards, security boundaries
- **Language patterns**: idiomatic conventions for your specific stack
- **Architectural guidance**: rules for your project's structural pattern (vertical slice, MVC, etc.)
- **Creative Design Toolkit**: specialized instructions for branding, social media strategy, and landing page blueprints
- **Harness Engineering (Memory)**: a `.ai-backlog/` folder that persists context and task state across sessions
- **Impact Map**: a volatile blast-radius file (`.ai-backlog/impact-map.md`) created at Phase PLAN and cleared at Phase END — tells the agent exactly which files to load for the current cycle, keeping context lean and focused

---

## Quick Start

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/src/assets/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI in action" /></kbd>
</p>

The interactive wizard guides you through selecting an architectural flavor and one or more language idioms. For non-interactive use:

```bash
# Zero-prompt install (lite + JS/TS defaults)
npx sdg-agents init --quick

# TypeScript + Vertical Slice
npx sdg-agents init --flavor vertical-slice --idiom typescript

# Multi-idiom
npx sdg-agents init --flavor mvc --idiom typescript,python

# Add a language idiom to an existing project
npx sdg-agents add
```

---

## What Gets Installed

After running `init`, your project receives:

```
your-project/
├── .ai/                         ← Instruction set (committed)
│   ├── skill/AGENTS.md          ← Main entry point
│   ├── instructions/            ← Core logic, flavors, and idioms
│   ├── commands/                ← Context for cycles (feat/fix/docs/audit/land)
│   ├── workflows/               ← Process protocol
│   └── dev-guides/              ← Spec templates and guides
└── .ai-backlog/                 ← Harness Engineering (Memory) — gitignored
    └── ...                      ← (See docs/PROJECT-STRUCTURE.md for details)
```

`dev-guides/` is always included. It contains the 5-phase cycle guide, the internal decision-gate flow, SDLC reference, UI prompt guide, and spec templates (`prompt-tracks/`) for authoring the SPEC phase of any task.

Agent-specific entry files (`CLAUDE.md`, `.cursorrules`, `.windsurfrules`, etc.) are also written to the project root.

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

For a detailed walkthrough of each phase and its rules, see [Spec-Driven Development Guide](src/assets/dev-guides/spec-driven-dev-guide.md).
For a visual breakdown of the internal decision gates and loops, see [Agent Deep-Flow](src/assets/dev-guides/agent-deep-flow.md).

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
# Add an idiom to an existing project
npx sdg-agents add
```

---

## Maintenance

```bash
npx sdg-agents review    # Detect drift between local rules and source
npx sdg-agents sync      # Update rulesets from source
npx sdg-agents update    # Refresh the LTS version registry
npx sdg-agents clear     # Remove the .ai/ folder
```

---

## Reference

- [Quick Reference (CHEATSHEET)](docs/CHEATSHEET.md) — all CLI flags and agent triggers
- [Project Structure](docs/PROJECT-STRUCTURE.md) — detailed breakdown of every generated file
- [Architectural Pipelines](docs/PIPELINES.md) — data flow diagrams for each flavor
- [Engineering Laws (CONSTITUTION)](docs/CONSTITUTION.md) — the principles behind the rules
- [UI/UX System](docs/UI-UX.md) — design hierarchy, surface tonal scale, presets, and single source of truth map
- [Roadmap](docs/ROADMAP.md) — planned work
- [Changelog](CHANGELOG.md) — release history
- [Credits and Philosophies](docs/REFERENCES.md) — project influences and research credits

---

> **Warning:** This project is in early development. Review and adjust the installed rules to fit your team's standards before relying on them.

_Balance is the key._

SDG is in constant evolution. There is no perfect solution, only continuous improvement. Feel free to contribute, fork, and share.

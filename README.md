<div align="center">
  <img src="packages/cli/src/assets/img/sdg-agents-icon-light.svg" alt="SDG Icon" width="480" height="480" style="border-radius: 1rem; opacity: 0.95;">
  <h1 align="center">Spec Driven Guide</h1>
  <p align="center">
    Your guide to Spec-Driven Development with AI Agents<br>
    <a href="docs/README.pt-BR.md">Versão em Português (Brasil)</a>
  </p>
  <a href="https://github.com/thiagocajadev/sdg-agents/actions/workflows/ci.yml"><img src="https://github.com/thiagocajadev/sdg-agents/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square&logo=nodedotjs" alt="Node" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
  <img src="https://img.shields.io/badge/idioms-14%20stacks-purple?style=flat-square" alt="Idioms" />
  <img src="https://img.shields.io/badge/agents-5%20supported-orange?style=flat-square" alt="Agents" />
</div>
<p align="center"><b><a href="https://sdg-agents.vercel.app">Try the Web Prompt Generator (Preview)</a></b></p>
<br>

> **SDG** is a **Standardized Architectural Governance** framework for AI-native repositories. It serves as a guide for both **AI Assistants** and **Developers** to work under strict process orientation. By bridging fundamental engineering concepts with applied intelligence, SDG ensures Staff-level execution through integrated instructions and automated cycles.
> **"Balance is the key."**

<p align="center">
  <kbd><img src="packages/cli/src/assets/sdg-agents-menu.png" alt="Spec Driven Guide CLI in action" /></kbd>
</p>

---

## Quick Start (CLI)

Inject Staff-level engineering rules and prompts directly into your project:

```bash
npx sdg-agents
```

### Quick Reference

For a complete map of all available CLI commands and AI instruction triggers, check the [**Quick Reference Cheat Sheet (docs/CHEATSHEET.md)**](docs/CHEATSHEET.md).

### Standard Modes

1. **SDG - Agents**: Injects instructions for AI Agents (Claude, Cursor, Windsurf, etc.).
2. **SDG - Prompts**: Injects **Specification Pipeline** templates for Developers.
3. **Quick Setup**: Standard choice. Injects both Agent rules and Prompts in one go.

### Generated Structure

After initialization, your project receives a standardized governance structure:

```
├── .ai/               ← Governance (instructions, commands, prompts)
└── .ai-backlog/       ← Task Memory (gitignored context & tasks)
```

> [!TIP]
> **Technical Deep Dive**: For a detailed breakdown of each folder, artifact role, and the **Specification Pipeline**, check our [**Project Structure Guide (docs/PROJECT-STRUCTURE.md)**](docs/PROJECT-STRUCTURE.md).

### IDE Integration

SDG auto-loads rules for **Claude Code** (`CLAUDE.md`), **Antigravity (Gemini)**, **Codex**, **Copilot**, **Cursor** (`.mdc`), **Windsurf** (`.windsurfrules`), and more.

---

## Agent-Led Engineering

Instead of writing every line yourself, you set the direction and let the Agent handle execution. It reads the codebase, proposes a structured plan, writes the code, and runs the tests, stopping at the key checkpoints for your approval before moving on.

You stay in control of the decisions that need real judgment. The Agent handles the rest.

---

## Architectural Flavors & Multi-Stack

During initialization, you select the **Architectural Flavor** that best fits your project. This ensures the AI Agent understands the data flow and structural rules of your codebase.

`Vertical Slice` → Feature-driven development with independent vertical verticals.  
`MVC` → Classic layered architecture (Model-View-Controller).  
`Frontend` → Standard client-side data flow for modern SPAs.  
`UI Component` → Atomic design and state-driven component flows.  
`Legacy` → Specialized refactoring patterns for bridging old code.

> [!TIP]
> **View Architectural Pipelines**: For a detailed breakdown of each flavor's data path, check the [**Architectural Pipelines (docs/PIPELINES.md)**](docs/PIPELINES.md).

SDG supports **14+ stacks** out of the box, including:  
`C#` · `TypeScript` · `JavaScript` · `Python` · `Go` · `Rust` · `Java` · `Kotlin` · `Swift` · `Flutter` · `SQL` · `VB.NET`

---

## The 5-Phase Spec-Driven Lifecycle

Every task follows a high-discipline cycle to ensure architectural alignment and zero technical debt:

| Phase    | Goal         | Key Outcome                                                         |
| :------- | :----------- | :------------------------------------------------------------------ |
| **SPEC** | Contract     | Formal request spec & checklist (using **Specification Pipeline**). |
| **PLAN** | Strategy     | Numbered plan approved and written to `.ai-backlog/tasks.md`.       |
| **CODE** | Execution    | Clean implementation following the approved plan.                   |
| **TEST** | Verification | All checklist items passed (Fix loop if needed).                    |
| **END**  | Delivery     | Changelog updated, tasks cleared, context synced.                   |

> [!TIP]
> **Staff-Level Flow**: The Agent stops for **Developer approval** at every critical junction (Spec and Plan).
> [**Read the Full Spec-Driven Development Guide**](packages/cli/src/assets/dev-guides/spec-driven-dev-guide.md).

---

## Governance & The SDG Constitution

The core of SDG is built on the [**Standard Engineering Laws**](docs/CONSTITUTION.md), ensuring every change is hardened and resilient:

`Hardening` · `Resilience` · `The Cascade` · `Visual Excellence` · `Boundaries` · `Reflection` · `The Writing Soul`

### Technical Blueprints

- [**SDLC (Developer's Architectural Trail)**](packages/cli/src/assets/dev-guides/software-development-lifecycle-sdlc.md) → _A handbook for developers to monitor and audit large evolutions._
- [**The SDG Constitution (Engineering Laws)**](docs/CONSTITUTION.md) → _The philosophical foundation and non-negotiable standards of the project._
- [**Technical Project Structure**](docs/PROJECT-STRUCTURE.md) → _Detailed breakdown of Governance, Task Memory, and local paths._

---

## Advanced Maintenance

```bash
npx sdg-agents review    # Compare local rules vs source
npx sdg-agents sync      # Update patterns via web
npx sdg-agents clear     # Removes the .ai/ folder (Governance)
```

---

## Project State

- [**Roadmap**](docs/ROADMAP.md) → Future vision and strategic milestones.
- [**CHANGELOG**](CHANGELOG.md) → Full technical history and past releases.

---

> [!WARNING]
> **Experimental Project**: This project is in its early stages. Use it with care and adapt the rules to your requirements.

SDG is in constant evolution. There is no 100% perfect solution, our goal is to continuously improve the development process.

Feel free to contribute, fork, and share!

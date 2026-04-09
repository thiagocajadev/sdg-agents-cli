# Technical Blueprint: Project Structure & Governance

SDG implements a multi-layered governance engine. This document provides a deep dive into the technical role of every directory and artifact injected during initialization.

## The Governance Tree

```text
your-project/
├── .ai-backlog/                 ← Task Memory (gitignored)
│   ├── context.md               ← Cross-session Project Brief
│   └── tasks.md                 ← Operational state (TODO/Active/Done)
└── .ai/                         ← Governance & Automation (Generated)
    ├── skill/
    │   └── AGENTS.md            ← The Universal Entry Point
    ├── instructions/            ← The Instruction Engine
    │   ├── core/                ← Base DNA (Security, Style, Testing)
    │   │   ├── ui/              ← UI Standards and Architecture
    │   │   ├── staff-dna.md     ← Philosophical & Technical Laws
    │   │   └── engineering-standards.md ← Tactical execution (Clean Code, Resilience, DoD)
    │   ├── flavors/             ← Architectural Patterns (Vertical Slice, MVC)
    │   ├── idioms/              ← Language-specific Syntax (TS, Python, C#)
    │   └── competencies/        ← Layer Expertise (Frontend, Backend)
    ├── commands/                ← Context Charges (/sdg-feat, /sdg-fix)
    ├── workflows/               ← Governance Protocol (governance.md)
    └── prompts/
        └── dev-tracks/          ← Specification Pipeline (Lite, New Evolution)
```

---

## 💾 .ai-backlog/ (Task Memory Engine)

This directory ensures **Cross-Session Continuity**. It overcomes the "forgetfulness" of AI Agents by persisting the project's state.

- **context.md** → **The Technical Brief**. Injected on the first run, it captures:
  - **Stack**: Detected languages and frameworks.
  - **Patterns**: Identified architectural choices.
  - **Decisions**: A running log of technical trade-offs.
- **tasks.md** → **The Operational Ledger**. A numbered list of atomic tasks.
  - `[TODO]` → Pending work.
  - `[IN_PROGRESS]` → The current focus (prevents context drift).
  - `[DONE]` → Completed items (for historical reference).

---

## 🛡️ .ai/ (The Governance Engine)

### 1. The Core DNA (`instructions/core/`)

These are the non-negotiable standards of the project.

- **staff-dna.md**: Defines the **Universal Engineering Laws** (Hardening, Resilience, Cascade, Visual Excellence).
- **engineering-standards.md**: **The project's most critical tactical guide**. It defines strict rules for Clean Code, Resilience Patterns, the Result Pattern, and the final Definition of Done (DoD).
- **writing-soul.md**: Enforces high-density, "AI-slop free" communication.
- **security-pipeline.md**: Prevents the leakage of PII and environment variable templates.
- **code-style.md**: Mandates the **Narrative Cascade** and **Vertical Scansion**.

### 2. Architectural Flavors (`instructions/flavors/`)

Flavors define the **Path of Data**. Selecting a flavor (e.g., `vertical-slice`) injects specific rules about where logic belongs (UseCases vs Services vs Controllers).

### 3. Language Idioms (`instructions/idioms/`)

Specific best practices for the chosen stack. For example, `idioms/typescript/patterns.md` ensures the agent uses modern TS features (Enums, Types vs Interfaces) correctly.

### 4. Cycle Commands (`commands/`)

SDG uses **Context Charges** to load relevant instructions only when needed:

- `/sdg-feat` → Loads expansion rules and domain modeling.
- `/sdg-fix` → Loads Root-Cause Analysis (RCA) and regression testing rules.
- `/sdg-docs` → Loads technical accuracy and structural rules.

### 5. Specification Pipeline (`prompts/dev-tracks/`)

This is the **Developer's Toolkit**. It contains nested prompt tracks that help you author the **SPEC** phase:

- **00-lite-mode**: For fast, single-file iterations.
- **01-new-evolution**: For complex, multi-layer features.
- **02-legacy-modernization**: For refactoring old code with zero regression.

---

## 🔄 Artifact Lifecycle

Every file in the `.ai/` structure is used strategically during the **5-Phase Lifecycle**:

1. **SPEC** → Uses `prompts/dev-tracks/` templates.
2. **PLAN** → Syncs with `.ai-backlog/tasks.md`.
3. **CODE** → Validates against `core/code-style.md` and `idioms/`.
4. **TEST** → Follows `core/testing-principles.md`.
5. **END** → Updates `context.md` and generates the **Semantic Commit**.

> [!IMPORTANT]
> **Single Source of Truth**: This structure ensures that both **Developers and Agents** share the same mental model of the project, eliminating "context drift" and technical debt.

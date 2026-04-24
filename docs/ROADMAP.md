# Roadmap

This document traces the evolution of **sdg-agents-cli** from foundation to a closed core, and lists the companion **extensions** that will grow around it — not inside it.

## Milestones

| Target   | Focus                                                                                                                                                                                                                                                                                                                                             | Status     |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- |
| **v1.0** | **Foundation**: CLI, 5-phase protocol, multi-stack, initial idioms.                                                                                                                                                                                                                                                                               | ✅ Shipped |
| **v1.x** | **Resilience & Hardening**: SSOT, Token Discipline, Universal Cycle Coverage.                                                                                                                                                                                                                                                                     | ✅ Shipped |
| **v2.0** | **Governance Observability**: Formal auditing via `audit:` and Circuit Breaker logic.                                                                                                                                                                                                                                                             | ✅ Shipped |
| **v3.0** | **Reformulation & Multi-Agent**: Semantic router, skills on-demand, multi-agent, multi-idiom, token compaction (~25K tokens saved).                                                                                                                                                                                                               | ✅ Shipped |
| **v4.0** | **Narrative Heuristics Maturity**: Vertical Density detector (double-blank + Explaining Return Tight + Orphan-of-1), logic-in-return classifier, 12-token banned abbreviations, multi-language section banners, three-form Pedagogical Tone + Default Content Structure.                                                                          | ✅ Shipped |
| **v4.1** | **Governance Slim-Down**: `staff-dna.md` removed, `code-style.md` rewritten in Akita shape, `PreCodeChecklist` + `PreFinishGate` consolidated (8 + 8 items), audit Law 1/Law 8 validators retired.                                                                                                                                                | ✅ Shipped |
| **v5.0** | **Dynamic Stack Context**: Static idiom catalog (15 dirs, ~50KB) removed. Stack is now developer-declared during `land:` in `.ai/backlog/stack.md`, optionally enriched via an allow-listed doc-fetch. `competencies/{backend,frontend}.md` fused into single `delivery.md`. Major bump due to removed CLI surface (`--idiom`, `update`, `sync`). | ✅ Shipped |

> **Core is closed.** Further growth happens via **separate extension packages**, not core bloat. The CLI, the 5-phase protocol, the narrative heuristics, the gate + audit suite, the `land:`-driven stack context — this is the finished product. See [Extensions](#extensions) below for companion projects.

---

## Detailed Vision

### v1.x — Resilience & Hardening

Transformed the CLI into an industrial-grade tool. Implemented the **Single Source of Truth (SSOT)** architecture centralized in `AGENTS.md`, introduced **Token Discipline 2.0** (Caveman/Soul duality), and expanded to universal cycles (`land:`, `docs:`, `fix:`), ensuring no development activity escapes governance.

### v2.0 — Governance Observability

A major leap in technical maturity. Introduced the `audit:` command to detect "governance drift" and the **Circuit Breaker** safety mechanism to prevent infinite refactoring loops. The CLI actively analyzes project alignment against rulesets, making governance visible and enforceable.

### v3.0 — Reformulation & Multi-Agent

Complete architectural reformulation. `AGENTS.md` became a **semantic router** (~2.8KB) instead of a knowledge dump — skills load on-demand per cycle phase, not at session start. Multi-agent support (Claude Code, Cursor, Windsurf, Copilot, Codex, Gemini, Roo Code) with agent stubs under `.ai/<agent>/`. Multi-idiom install (`--idiom typescript,python,go`). Engineering Laws renumbered 1–8. Token compaction across 39 files saved ~25K tokens (~118KB, 50% reduction). See [Token Optimization](guides/TOKEN-OPTIMIZATION.md) and [Migration v2 → v3](guides/MIGRATION-v3.md).

### v4.0 — Narrative Heuristics Maturity

Six narrative detectors upgraded from skeleton to production-grade enforcement. `Vertical Density` promoted from no-op to a triple sub-detector (double blank lines, Explaining Return Tight, Orphan-of-1 atomic). `No Logic in Return` classifies offenders into specific hints (Ternary / Template literal / Arithmetic / Constructor / String interpolation). `No framework abbreviations` covers the complete twelve-token banned set (`req, res, ctx, idx, tmp, arr, val, cb, mgr, ctrl, svc, prev`) with word-boundary regex plus adjacency lookahead. `No section banners` now spans JavaScript, Python/shell, and SQL comment styles. Writing Soul Pedagogical Tone gained three distinct first-occurrence formats (acronym / non-acronym / heading) and a `Default Content Structure` section mandating an intro paragraph after the H1 and a `## Fundamental concepts` glossary table when a doc introduces 3+ technical terms. All narrative validators extracted into a dedicated sibling module under `config/heuristics/`, keeping the governance SSOT thin.

### v4.1 — Governance Slim-Down

Shed the last of the ceremonial governance layer. `staff-dna.md` was deleted entirely; `code-style.md` was rewritten in Akita shape (16.7KB → 5.8KB, −65%) with a two-line Security-First block plus a consolidated `PreCodeChecklist` (8 binary items) and `PreFinishGate` (8 items wired to narrative heuristic validators). The workflow template lost the DNA-GATE supreme block; `audit-bundle.mjs` lost the Law 1 and Law 8 validators that inspected for removed vocabulary. Tests were rewritten lockstep. 206/206 tests passing, audit 100%, drift 0.

### v5.0 — Dynamic Stack Context (Current)

The static idiom catalog (fifteen language subdirectories under `src/assets/instructions/idioms/`, ~50KB, plus its `stack-versions.mjs` registry and the `update` maintenance command) was removed. Stack specificity is no longer installed — it is **declared**, once, during the `land:` cycle. The agent elicits languages/runtimes/frameworks in free-form, classifies entries by role (Backend/Frontend/Data/Scripts), optionally enriches via an allow-listed doc fetch (12 canonical sources), and persists the result in `.ai/backlog/stack.md`. Phase CODE reads that file on every session. The twin `competencies/{backend,frontend}.md` files were fused into a single `competencies/delivery.md` with internal discriminators (`## Backend (load if server-side)` / `## Frontend (load if UI)`). The `--idiom` CLI flag, the `codeStyle` selection, the `update-versions` command, and the `sync-rulesets` command are all retired. Migration is silent — a stale `.ai/instructions/` tree is wiped on the next `init`. Released as v5.0 (major) due to the removed CLI surface.

With this release the **core is considered closed**. The CLI ships a 5-phase protocol, narrative heuristics, a gate + audit suite, and a `land:`-driven stack declaration — enough to govern any project. Further ambitions live as extensions, not as creep into the core.

---

## Extensions

Companion projects that sit on top of the core CLI. Each is a separate package with its own release cycle — the core does not take a dependency on any of them.

### `sdg-registry` — Remote Instruction Imports

Ecosystem expansion. With `sdg-registry use <owner/repo>`, teams can import remote instruction sets — e.g. `security/owasp` or `airbnb/javascript` — instantly injecting community-validated competencies and patterns into a local project. Lives as a plug-in, not as a core feature, so registries can evolve without forcing CLI releases.

### `sdg-mcp` — Deep Context Intelligence

Token optimization via **MCP (Model Context Protocol)**. Instead of loading entire competency files, the companion indexes the skill tree and serves semantic lookups to the agent per file being edited. Keeps the core CLI free of vector-store concerns and lets the retrieval layer evolve independently.

### `sdg-visual` — Visual Governance

Auto-generation of diagrams (Mermaid/SVG) that reflect the true state of a project's rules and dependencies. Reads `AGENTS.md` + `stack.md` + skill catalog and emits dependency maps and decision flows. Separate toolchain (Mermaid-CLI, browser render) kept out of the core install.

### `sdg-pedagogy` — Documentation Detectors

The documentation-oriented narrative detectors that were considered for v4.0 (three-form first-occurrence, glossary table enforcement, intro-paragraph rule) but deliberately deferred from the core gate. Belongs in a separate linting companion aimed at `/docs` folders, not at source code.

---

> For the full technical history, see [CHANGELOG.md](../CHANGELOG.md).

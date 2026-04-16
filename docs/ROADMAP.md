# Roadmap

This document outlines the future vision of **sdg-agents-cli**, tracing the path from foundation to autonomous governance and deep agent observability.

## Milestones

| Target   | Focus                                                                                                                               | Status     |
| :------- | :---------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| **v1.0** | **Foundation**: CLI, 5-phase protocol, multi-stack, initial idioms.                                                                 | ✅ Shipped |
| **v1.x** | **Resilience & Hardening**: SSOT, Token Discipline, Universal Cycle Coverage.                                                       | ✅ Shipped |
| **v2.0** | **Governance Observability**: Formal auditing via `audit:` and Circuit Breaker logic.                                               | ✅ Shipped |
| **v3.0** | **Reformulation & Multi-Agent**: Semantic router, skills on-demand, multi-agent, multi-idiom, token compaction (~25K tokens saved). | ✅ Shipped |
| **v4.1** | **Global Instruction Registry**: Remote pattern import via `sdg use`.                                                               | 📅 Backlog |
| **v4.2** | **Deep Context Intelligence**: Semantic indexing with MCP support.                                                                  | 📅 Backlog |
| **v4.3** | **Visual Governance**: Auto-generated architecture flow diagrams.                                                                   | 📅 Backlog |

---

## Detailed Vision

### v1.x — Resilience & Hardening

Transformed the CLI into an industrial-grade tool. Implemented the **Single Source of Truth (SSOT)** architecture centralized in `AGENTS.md`, introduced **Token Discipline 2.0** (Caveman/Soul duality), and expanded to universal cycles (`land:`, `docs:`, `fix:`), ensuring no development activity escapes governance.

### v2.0 — Governance Observability

A major leap in technical maturity. Introduced the `audit:` command to detect "governance drift" and the **Circuit Breaker** safety mechanism to prevent infinite refactoring loops. The CLI actively analyzes project alignment against rulesets, making governance visible and enforceable.

### v3.0 — Reformulation & Multi-Agent (Current)

Complete architectural reformulation. `AGENTS.md` became a **semantic router** (~2.8KB) instead of a knowledge dump — skills load on-demand per cycle phase, not at session start. Multi-agent support (Claude Code, Cursor, Windsurf, Copilot, Codex, Gemini, Roo Code) with agent stubs under `.ai/<agent>/`. Multi-idiom install (`--idiom typescript,python,go`). Engineering Laws renumbered 1–8. Token compaction across 39 files saved ~25K tokens (~118KB, 50% reduction). See [Token Optimization](TOKEN-OPTIMIZATION.md) and [Migration v2 → v3](MIGRATION-v3.md).

### v3.1 — Global Instruction Registry

Ecosystem expansion. With `sdg use <owner/repo>`, teams can import remote instruction sets — e.g. `sdg use security/owasp` or `sdg use airbnb/javascript` — instantly injecting community-validated competencies and idioms into a local project.

### v3.2 — Deep Context Intelligence

Radical token optimization via **MCP (Model Context Protocol)**. Instead of loading entire competency files, the agent will use semantic search to "pull" only the relevant paragraphs for the specific file being edited, increasing precision while reducing operational costs and noise.

### v3.3 — Visual Governance

Governance becomes visible. Auto-generation of diagrams (Mermaid/SVG) that reflect the true state of the project's rules. A living documentation that draws dependency maps and decision flows, serving as a visual contract for both humans and agents to validate their actions.

---

> For the full technical history, see [CHANGELOG.md](../CHANGELOG.md).

# Roadmap

This document outlines the future vision of **sdg-agents-cli**, tracing the path from foundation to autonomous governance and deep agent observability.

## Milestones

| Target   | Focus                                                                                 | Status     |
| :------- | :------------------------------------------------------------------------------------ | :--------- |
| **v1.0** | **Foundation**: CLI, 5-phase protocol, multi-stack, initial idioms.                   | ✅ Shipped |
| **v1.x** | **Resilience & Hardening**: SSOT, Token Discipline, Universal Cycle Coverage.         | ✅ Shipped |
| **v2.0** | **Governance Observability**: Formal auditing via `audit:` and Circuit Breaker logic. | ✅ Shipped |
| **v2.1** | **Global Instruction Registry**: Remote pattern import via `sdg use`.                 | 📅 Backlog |
| **v2.2** | **Deep Context Intelligence**: Semantic indexing with MCP support.                    | 📅 Backlog |
| **v2.3** | **Visual Governance**: Auto-generated architecture flow diagrams.                     | 📅 Backlog |

---

## Detailed Vision

### v1.x — Resilience & Hardening (Current)

The current stage focused on transforming the CLI into an industrial-grade tool. We implemented the **Single Source of Truth (SSOT)** architecture centralized in `AGENTS.md`, introduced **Token Discipline 2.0** (Caveman/Soul duality), and expanded to universal cycles (`land:`, `docs:`, `fix:`), ensuring no development activity escapes governance.

### v2.0 — Governance Observability (Current Baseline)

A major leap in technical maturity. We introduced the `audit:` command to detect "governance drift" and the **Circuit Breaker** safety mechanism to prevent infinite refactoring loops. The CLI now actively analyzes project alignment against rulesets, making governance visible and enforceable.

### v2.1 — Global Instruction Registry

Ecossystem expansion. With `sdg use <owner/repo>`, teams can import remote instruction sets. Imagine initializing a project with `sdg use security/owasp` or `sdg use airbnb/javascript`, instantly injecting community-validated competencies and idioms into your local project.

### v2.2 — Deep Context Intelligence

Radical token optimization via **MCP (Model Context Protocol)**. Instead of loading entire competency files, the agent will use semantic search to "pull" only the relevant paragraphs for the specific file being edited, increasing precision while reducing operational costs and noise.

### v2.3 — Visual Governance

Governance becomes visible. Auto-generation of diagrams (Mermaid/SVG) that reflect the true state of the project's rules. A living documentation that draws dependency maps and decision flows, serving as a visual contract for both humans and agents to validate their actions.

---

> For the full technical history, see [CHANGELOG.md](../CHANGELOG.md).

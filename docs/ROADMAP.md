# Roadmap

## Milestones

| Target   | Focus                                                              | Status     |
| :------- | :----------------------------------------------------------------- | :--------- |
| **v1.0** | Foundation: CLI, instruction set, 5-phase protocol, multi-stack.   | ✅ Shipped |
| **v1.1** | Plugin Core: support for custom idioms and local flavor patterns.  | 📋 Planned |
| **v1.2** | MCP Integration: semantic search over installed instruction files. | 📋 Backlog |
| **v1.3** | Visual Governance: auto-generation of architecture flow diagrams.  | 📋 Backlog |

---

## What's Next

### v1.1 — Plugin Core

Allow teams to define their own idioms and flavors with the same structure as the built-in templates. The goal is for any engineering team to extend the instruction set without forking the package.

### v1.2 — MCP Integration

Implement Model Context Protocol support so agents can query the installed instruction files semantically, surfacing only the rules relevant to the current task rather than loading everything up front.

### v1.3 — Visual Governance

Auto-generate architecture flow diagrams from the installed flavor and idiom configuration, keeping visual documentation in sync with the rules the agent is actually following.

---

> For the full technical history, see [CHANGELOG.md](../CHANGELOG.md).

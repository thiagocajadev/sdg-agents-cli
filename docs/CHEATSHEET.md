# Quick Reference: Commands & Triggers

---

## Quick Setup

The fastest paths from zero to a governed project:

```bash
# Interactive wizard — guides you through flavor and idiom selection
npx sdg-agents

# Non-interactive: TypeScript + Vertical Slice (most common)
npx sdg-agents init --flavor vertical-slice --idiom typescript

# Non-interactive: full-stack with multiple idioms
npx sdg-agents init --flavor vertical-slice --idiom typescript,javascript

# Preview what would be written without touching the filesystem
npx sdg-agents init --flavor mvc --idiom python --dry-run
```

---

## Architecture Flavors (`--flavor`)

Select the flavor that matches your project's data flow and structure:

| Flavor           | Pattern                                 | Use When                       |
| :--------------- | :-------------------------------------- | :----------------------------- |
| `vertical-slice` | Feature-driven vertical cuts            | Monorepo or domain-heavy API   |
| `mvc`            | Classic layered (Model-View-Controller) | Standard REST service          |
| `lite`           | Minimal governance scaffold             | Small scripts, CLIs, utilities |
| `legacy`         | Refactor-safe bridge patterns           | Migrating existing codebases   |

```bash
npx sdg-agents init --flavor vertical-slice --idiom typescript
npx sdg-agents init --flavor mvc --idiom java
npx sdg-agents init --flavor lite --idiom python
npx sdg-agents init --flavor legacy --idiom csharp
```

---

## Language Idioms (`--idiom`)

Inject language-specific patterns alongside the governance rules. Repeatable or comma-separated:

| Idiom        | Stack                                       |
| :----------- | :------------------------------------------ |
| `typescript` | TypeScript (React / Angular / Node / Astro) |
| `javascript` | JavaScript (Vanilla / ESM)                  |
| `python`     | Python                                      |
| `csharp`     | C# / .NET                                   |
| `java`       | Java / Spring                               |
| `kotlin`     | Kotlin                                      |
| `go`         | Go                                          |
| `rust`       | Rust                                        |
| `swift`      | Swift / iOS                                 |
| `flutter`    | Flutter / Dart                              |
| `sql`        | SQL                                         |
| `vbnet`      | VB.NET                                      |

```bash
# Single idiom
npx sdg-agents init --flavor vertical-slice --idiom go

# Multiple idioms — comma-separated or repeated flag
npx sdg-agents init --flavor mvc --idiom typescript,python
npx sdg-agents init --flavor mvc --idiom typescript --idiom python
```

---

## Maintenance Commands

```bash
npx sdg-agents review    # Detect drift between local rules and source engine
npx sdg-agents sync      # Update rulesets from the source (web-assisted)
npx sdg-agents update    # Refresh the LTS version registry
npx sdg-agents clear     # Remove the entire .ai/ governance layer
```

---

## Instruction Triggers (AI Agent)

Prefix your message to the AI Agent to activate the corresponding governance cycle:

| Trigger               | Cycle   | Intent                                                                                                                                               |
| :-------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `land: <description>` | Land    | Project inception — vision to sequenced `feat:` backlog, no code written.                                                                            |
| `feat: <description>` | Feature | New implementation — requires SPEC and PLAN approval before any code.                                                                                |
| `fix: <description>`  | Fix     | Bug resolution — Root Cause Analysis and regression test mandatory.                                                                                  |
| `docs: <description>` | Docs    | Technical memory sync — Changelogs, ADRs, Specs.                                                                                                     |
| `audit: <scope>`      | Audit   | Verify project alignment against rulesets (drift detection).                                                                                         |
| `end:`                | —       | Close the active cycle — runs the END Phase checklist (changelog, backlog, commit). Also recovers a cycle if the agent loses track mid-conversation. |
| No prefix             | —       | Agent asks: "land, feat, fix, docs, or audit?" — then proceeds.                                                                                      |

> `end:` takes no argument. Type it to close the active cycle — the agent runs the full END checklist (changelog, backlog sync, commit proposal). If the agent loses track mid-conversation, `end:` also recovers the cycle.

---

## Standard Lifecycle

Every `feat:`, `fix:`, and `docs:` task follows this sequence:

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

The Agent **stops and waits for explicit Developer approval** at SPEC and PLAN before proceeding.

---

## Developer vs AI Agent

| Responsibility                          | Developer | AI Agent |
| :-------------------------------------- | :-------: | :------: |
| Run CLI commands (`init`, `sync`, etc.) |    ✅     |    —     |
| Approve SPEC and PLAN                   |    ✅     |    —     |
| Execute CODE and TEST phases            |     —     |    ✅    |
| Update CHANGELOG and backlog            |     —     |    ✅    |
| Propose commit message                  |     —     |    ✅    |
| Authorize commit and push               |    ✅     |    —     |

---

> Developers approve decisions. Agents execute them.

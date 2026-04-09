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

# Add an idiom to an existing project (interactive prompt)
npx sdg-agents add
```

---

## Maintenance Commands

```bash
npx sdg-agents review    # Detect drift between local rules and source engine
npx sdg-agents sync      # Update rulesets from the source (web-assisted)
npx sdg-agents update    # Refresh the LTS version registry
npx sdg-agents add       # Inject a new language idiom into an existing project
npx sdg-agents clear     # Remove the entire .ai/ governance layer
```

---

## Instruction Triggers (AI Agent)

Prefix your message to the AI Agent to activate the corresponding governance cycle:

| Trigger                    | Cycle   | Intent                                                                   |
| :------------------------- | :------ | :----------------------------------------------------------------------- |
| `feat: <description>`      | Feature | New implementation — requires SPEC and PLAN approval before any code.    |
| `fix: <description>`       | Fix     | Bug resolution — Root Cause Analysis and regression test mandatory.      |
| `docs: <description>`      | Docs    | Technical memory sync — Changelogs, ADRs, Specs.                         |
| Trivial change (no prefix) | Direct  | Single isolated edit with no new behavior — CODE directly, no CHANGELOG. |

---

## Standard Lifecycle

Every `feat:`, `fix:`, and `docs:` task follows this sequence:

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑
  Wait        Wait
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

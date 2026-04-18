# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

## [3.5.0] - 2026-04-18

### Added

- **`sdg-agents gate` — language-agnostic pre-commit code review gate**: new command `sdg-agents gate --prompt | --check` that pipes `git diff --staged` through any LLM CLI and blocks commits on BLOCK-tier violations. Architecture is agent-neutral: `--prompt` builds a structured review prompt from `sdg-rules.json` and prints it to stdout; `--check` reads the LLM JSON response and exits 0 (pass) or 1 (block). No Anthropic SDK dependency. Includes `src/assets/rules/sdg-rules.json` as SSOT with 7 rules (5 BLOCK, 2 WARN): `explaining-returns`, `taboo-verbs`, `boolean-prefix`, `inline-assertion-literals`, `named-const-before-call`, `taboo-nouns`, `sla-violation`, `arrow-antipattern`, `visual-density`. Template hook at `src/assets/hooks/pre-commit.sh` wires any LLM CLI in one line. 14 fixture-based tests across `rules-loader`, `gate-prompt`, and `gate-checker` modules. 154/154 tests green, lint PASS.

### Added

### Fixed

## [3.4.0] - 2026-04-18

### Added

- **Dark Theme Calibration (Phase 0.7) in `ui-ux.md`**: new rule maps dark mode surfaces to the existing Zinc/OKLCH scale (950→700), applies chroma reduction via C×0.80–0.90 instead of raw hex overrides, anchors text opacity to semantic tokens (`text-foreground` at 87%, `text-muted-foreground` at 65%, disabled at 45%), replaces `rgba(0,0,0,0.6)` overlay pattern with `bg-background/70`, and adds three perceptual heuristics (heavy→lighten, vibrating→desaturate, faded→increase contrast). Perception beats math principle made explicit.
- **String Density rule in `code-style.md`**: new rule in Part 2 (Visual Aesthetics) governs long Tailwind class strings and `cva` usage. Monolithic class strings >5 tokens must be split into named groups by semantic concern (layout, surface, typography, state). `cva` is a composition layer, not a string dump. Anti-fragmentation constraint: no single-token lines. PreStartGate updated with binary String Density check.
- **`writing-soul.md` as standalone skill**: Writing Soul extracted from `ui-ux.md` Part 5 into its own file at `src/assets/skills/writing-soul.md`. Adds explicit **no-dash rule** (never use em dash — use comma, parentheses, or sentence split). `ui-ux.md` Part 5 replaced with a load reference.
- **Writing Soul coverage across all flows**: `sdg-docs.md`, `sdg-end.md`, and `sdg-land.md` now load `writing-soul.md` at entry. `AGENTS.md` Frontend section updated to list writing-soul as a separate load target from ui-ux. Covers changelog entries, commit messages, backlog content, and READMEs across every cycle type.

## [3.3.1] - 2026-04-18

### Added

### Fixed

- **Supreme Gate — Law 1 hardening blocks training-default drift in Phase CODE**: agents were entering Phase CODE and writing code in default LLM style (dense walls, no vertical scansion, no "Paragraphs of Intent") because the existing DNA-GATE was declarative prose, not a binary ceremony. Three coupled changes close the loop: (1) [staff-dna.md:7-19](src/assets/skills/staff-dna.md#L7-L19) Law 1 gets a third subrule **Recited Gate (SUPREME BLOCK)** — agent MUST emit a `DNA-GATE CONFIRMED` block with Mental Reset + Laws Applied + Pre-Start Checklist + Target Files + Blockers before the first `Edit`/`Write`/`NotebookEdit`; missing block = Law 1 violation. (2) [workflow.md:57-71](src/assets/instructions/templates/workflow.md#L57-L71) Phase CODE step 1 promoted to **BLOCKING** with a Circuit Breaker clause that auto-fails Phase TEST if the block was skipped. (3) [code-style.md:261-289](src/assets/skills/code-style.md#L261-L289) new `PreStartGate` rule with 17 binary items (twin of the existing `EnforcementChecklist` at Pre-Finish), with **"Paragraphs of Intent"** promoted from diluted `VerticalScansion` prose to an explicit binary item: _"a blank line separates logical groups; NO blank lines within a group"_. Coverage: 9 characterization tests in new [skill-content.test.mjs](src/engine/lib/domain/skill-content.test.mjs) reproduce the bug class (missing gate text in the 3 skill files). 137/137 tests green, lint PASS, audit 100%.

## [3.3.0] - 2026-04-17

### Added

- **Auto-prune of `tasks.md ## Done` at Phase END**: new binary [prune-backlog.mjs](src/engine/bin/lifecycle/prune-backlog.mjs) + `npm run prune` script truncates the Done section to the last 3 entries after each cycle closes. Pure function `pruneBacklog(content, keepCount)` is deterministic, idempotent, preserves `## Active`/`## Backlog` and any sections after `## Done`. Wired into [workflow.md](src/assets/instructions/templates/workflow.md) Phase END step 3 so every agent, every session, ends with a clean backlog — `CHANGELOG.md` + `git log` remain the authoritative history trail. Rationale: backlog is ephemeral working state, not archive; bloat in `## Done` was costing ~6K tokens per session start for redundant context. Covered by 6 tests (truncation, no-op under threshold, missing-section handling, trailing-section preservation, idempotency, single-blank-line formatting).

### Fixed

## [3.2.4] - 2026-04-17

### Added

### Fixed

- **`npm test` glob silently dropped 10/11 test files**: [package.json:19-20](package.json#L19-L20) `test` and `test:watch` scripts used unquoted `src/engine/**/*.test.mjs`. npm executes scripts via `sh`, where `globstar` is off by default, so `**` collapsed to single-level `*` and matched only `src/engine/config/governance.test.mjs` (1 of 11 files = 3 of 122 tests). [audit-bundle.mjs:260](src/engine/bin/audit/audit-bundle.mjs#L260) Code Hygiene gate spawned `npm test` and reported PASS over the 3-test slice — masking potential law-compliance regressions in the other 119 tests. Fix: quote the pattern (`"src/engine/**/*.test.mjs"`) so Node ≥22 resolves it via its native `--test` glob, shell-independent. Verified: `npm test` now reports `tests 122`; audit Code Hygiene PASS over full suite.

## [3.2.3] - 2026-04-17

### Added

### Fixed

- **D1 — `sync-rulesets.mjs` template literals dedented**: two left-flushed templates at [sync-rulesets.mjs:104-109](src/engine/bin/maintenance/sync-rulesets.mjs#L104-L109) (section render) and [:120-148](src/engine/bin/maintenance/sync-rulesets.mjs#L120-L148) (sync prompt) broke narrative flow with surrounding 2-space code. Extracted 3 pure render helpers (`renderTargetSection`, `renderMaintainerNote`, `renderSyncPrompt`) using `dedent` (already an in-project dep). Output byte-shape preserved; function body now reads with natural indentation.
- **F4 — Sovereign Protocol validator contradiction resolved**: [audit-bundle.mjs:198-205](src/engine/bin/audit/audit-bundle.mjs#L198-L205) required AGENTS.md to contain `DNA-GATE & MENTAL RESET [LOCKED]` — directly contradicting the M1.1 router-identity design enforced by 4 tests in [instruction-assembler.test.mjs](src/engine/lib/domain/instruction-assembler.test.mjs) (minimal registry, ≤2600 bytes, no inline DNA-GATE ceremony). Removed the AGENTS.md check; Sovereign Protocol coverage remains intact via the existing `staff-dna.md` Law 1 + Law 8 validators ([:186-196](src/engine/bin/audit/audit-bundle.mjs#L186-L196)). Reconciles architectural drift between validator and router-identity tests.
- **F3 — Named Expectations triad applied to `clear-bundle.test.mjs`**: refactored all 5 test cases to the `input` → `expected` → `actual` pattern required by [testing.md:47-66](src/assets/skills/testing.md#L47-L66). Previously magic-literal assertions (`assert.deepEqual(actual, [])`) replaced with named `expected` variables. Test Expectations gate now ✅.
- **Audit report (2026-04-17)**: sweep of `src/engine/` with the active Laws Compliance gate (v3.2.2) surfaced **zero** real law violations across 25 non-test files, confirming the v3.2.2 restoration was not masking silent regressions. Only 2 governance gaps (F3 + F4) and 1 code-quality item (D1) were found, all resolved in this cycle.

## [3.2.2] - 2026-04-17

### Added

### Fixed

- **Laws Compliance gate restored (5 coupled bugs)**: previously inert because `NARRATIVE_CHECKLIST.length === 0`. Five coupled defects in [governance.mjs](src/engine/config/governance.mjs) addressed:
  - **Bug X (parser)**: regex required `**bold**` markers around checklist labels, but [code-style.md:267-280](src/assets/skills/code-style.md#L267-L280) uses plain text. Relaxed to `(?:\*\*)?` optional + handle trailing parenthetical (`No section banners (...)`, `Reads like a short story (...)`).
  - **Bug Y (label drift)**: 5/12 strategy keys diverged from real labels (`'SLA applied'`→`SLA`, `'Vertical Density applied'`→`Vertical Density`, `'Boolean names carry a prefix'`→`Boolean prefix`, `'No Section Banners'`→`No section banners`, `'Code reads like a "Short Story"'`→`Reads like a short story`). Realigned.
  - **Bug Z (missing mappings)**: 2/14 checklist items had no strategy entry. Added `Destructuring inside function body, not in parameters` and `Pure entry point` (the latter aliases `validateSlaCompliance`).
  - **Bug W (canonical entry-point form)**: previous v3.2.1 fix collapsed `run()` to a single-line ternary, which violated **Explaining Returns** (no logic/ternary on return line, [code-style.md:134](src/assets/skills/code-style.md#L134)). Established canonical form `const X = call(); return X;` and applied to 4 entry points: [check-sync.mjs:17](src/engine/bin/audit/check-sync.mjs#L17) (with guard clause moved into `orchestrateSyncCheck`), [sync-rulesets.mjs:22](src/engine/bin/maintenance/sync-rulesets.mjs#L22), [review-bundle.mjs:22](src/engine/bin/maintenance/review-bundle.mjs#L22), [index.mjs:24](src/engine/bin/index.mjs#L24).
  - **Bug V (validator misalignment)**: `validateSlaCompliance` enforced strict 1-line bodies, falsely flagging the new canonical 2-line form. Replaced length check with shape detector: accepts (a) single-statement bodies (side-effect form), (b) canonical `const X = call(); return X;` (2 statements). Rejects ternaries and any other multi-statement shape.
  - **Cleanup**: removed `SLA Exemption` hack in `validateExplainingReturns` (`if (functionContext === 'run') continue;`) — entry points now follow Explaining Returns universally. Removed orphan `scanForFunctionHeader` helper.
- **Regression test added** ([governance.test.mjs](src/engine/config/governance.test.mjs)): 3 cases covering `NARRATIVE_CHECKLIST.length === 14`, no orphan rules, and presence of `SLA`/`Pure entry point`/`Explaining Returns` labels. 122/122 tests green.

## [3.2.1] - 2026-04-17

### Added

### Fixed

- **One-Line Entry Point Mandate restored on `check-sync.mjs`**: `function run()` collapsed from a 6-line `if`-guard / early-return / orchestrate / return block to a single ternary delegation: `return isMaintainerMode() ? orchestrateSyncCheck() : success();`. Aligns the synchronous sync checker with Law 4 (Pure Entry Point), now matching the 9 other `bin/` entry points already compliant.
- **Audit blind spot in `validateSlaCompliance`**: both regexes in [governance.mjs](src/engine/config/governance.mjs) (entry-point matcher at line 69 and `run()`-body matcher at line 88) required an `async` prefix and silently skipped synchronous declarations like the one above. Made the prefix optional via `(?:async\s+)?`. Restores SLA enforcement coverage for sync entry points. (NOTE: full Laws Compliance gate restoration depends on a separate critical fix logged to backlog — `NARRATIVE_CHECKLIST` currently loads zero rules due to a parser/label drift in the same file.)

## [3.2.0] - 2026-04-17

### Added

- **SSOT alignment cycle (`audit:`)** — ruleset realigned with user-declared governance across 3 conflicts, 6 duplications, 5 gaps, and 11 partial items (16 total changes). Net delta +2KB / ~500 tokens after compaction pass.
  - **Conflicts resolved**: entry point mandate unified to **1 line** (`backend.md`); HTTP Envelope canonicalized in `backend.md` with `code-style.md` + `api-design.md` reduced to pointers; comment stance tightened to `// why:` only for hidden constraints.
  - **Duplications consolidated**: NarrativeCascade canonical in `code-style.md` (staff-dna Law 4 shrunk to pointer); Health/RED/structured logging canonical in `observability.md` (cloud.md references); PII/secret redaction canonical in `security.md` (observability references); abstract env naming + no `.env.example` canonical in `security.md` (`code-style.md` + `cloud.md` reference); Conventional Commits canonical in `code-style.md` (ci-cd references).
  - **Gaps filled**: `Migrations` rule in `data-access.md` (Rails `YYYYMMDDHHMMSS_*` naming + forward-only + idempotent guards); `Delivery Strategy` in `ci-cd.md` (trunk-based, short-lived branches, deploy ≠ release, feature flags off by default, post-deploy validation); `Part 3 — Incident Correction Strategy` in `security.md` (fix-forward preference, rollback as critical exception, flag-based safety, main consistency); `Builder/Options via extension methods` in `code-style.md` AbstractConfig rule.
  - **Partial items enriched**: `code-style.md` gained explicit `LanguagePurity` rule (English-only, small functions, immutability default, CQS, explicit dependencies, async I/O, ≤3 params/line); `sql-style.md` gained `Query Discipline` (early filtering, descriptive aliases, named parameters, explicit `ORDER BY`) and `CTE vs Temp Table` decision rule; `ui-ux.md` gained `Structured Components` (steps/tabs/modals + progression + error prevention), `Anti-Patterns (UI/UX)` block (information overload, uncontrolled tables, visual noise, decorative motion, fixed-layout bias, platform bias), and Lucide as canonical icon library.
  - **Token efficiency**: compaction pass removed `<rule>` cerimonial wrappers on new sections and densified prose; net addition ~500 tokens for 16 new/consolidated rules (~31 tokens per governance change). `.ai/` regenerated from `src/assets/`; Instruction Sync passes.

### Fixed

## [3.1.1] - 2026-04-17

### Added

### Fixed

- **Docs folder restructured**: 14 flat files in `docs/` regrouped into thematic subfolders — `docs/concepts/` (CONSTITUTION, SPEC-DRIVEN-DEV-GUIDE, AGENT-DEEP-FLOW, SOFTWARE-DEVELOPMENT-LIFECYCLE-SDLC), `docs/reference/` (PROJECT-STRUCTURE, CHEATSHEET, PIPELINES, REFERENCES), `docs/guides/` (MIGRATION-v3, TOKEN-OPTIMIZATION, UI-UX), `docs/i18n/` (README.pt-BR). ROADMAP stays at `docs/` root. All cross-links updated in `README.md`, `docs/i18n/README.pt-BR.md`, and internal doc-to-doc references. Maintainer-mode file check in `audit-bundle.mjs` repointed to the new pt-BR path.
- **CHANGELOG history split**: Entries `< v3.0.0` (v1.0.0 → v2.16.0, 63 releases) moved verbatim to `docs/CHANGELOG-archive.md`. Main `CHANGELOG.md` kept lean (Unreleased + 3.x only) with a footer link to the archive. `bump.mjs` regex still matches `[Unreleased]` at the top (verified).
- **Version correction (`3.0.1` → `3.1.1`)**: The prior fix cycle produced a misordered patch (`3.0.1` released after `3.1.0`, violating semver). Merged the content of `[3.0.1]` into `[Unreleased]` and deleted the misordered block so the next release promotes cleanly to `3.1.1`. The local commit `281fc13` labeled `v3.0.1` stays as historical record — the release never reached npm, so no external breakage.
- **Backlog folder relocated**: `.ai-backlog/` → `.ai/backlog/`. Removes a top-level directory from project root; backlog now lives inside the governance tree as local working state. All SSOT references updated (`templates/workflow.md`, `commands/sdg-end.md`, `commands/sdg-land.md`), engine paths repointed (`instruction-assembler.mjs` `writeBacklogFiles` + `writeGitignore` BLOCKS, `audit-bundle.mjs:checkBacklogHealth`, `ui-utils.mjs` success log), docs aligned (README, README.pt-BR, PROJECT-STRUCTURE, REFERENCES). Consumer `.gitignore` generator now writes `.ai/backlog/` (was `.ai-backlog/`). CHANGELOG history left untouched (historical accuracy).
- **Clear-bundle backlog-loss guard**: `clear-bundle.mjs` now performs a second confirmation when `.ai/backlog/` contains files (tasks/learned/troubleshoot are not in git and have no remote recovery). Pure predicate `Cleaner.findBacklogsAtRisk(items)` extracted for testability; covers root projects and monorepo `packages/*` layouts. New regression suite: 5 tests in `clear-bundle.test.mjs`. Test glob widened to `src/engine/**/*.test.mjs` to discover bin-level tests.

## [3.1.0] - 2026-04-15

### Added

- **Part 0 — Visual Architecture Principles**: new foundational section in `ui-ux.md` covering solution-first stance, interface structure, themes/depth philosophy, styling/implementation, interaction/experience, accessibility as default, and anti-patterns. Frames the WHY before the tactical Parts 1–5.
- **"Using with other IDEs" section**: both READMEs now include a pointer-line table for Cursor, Windsurf, Copilot, Codex, Gemini, and Cline/Roo — replacing the old multi-agent wizard section.
- **`docs/UI-UX.md` rewrite**: now a reader overview with narrated map of the skill file and external research references (Shadcn/UI, Tailwind v4, Radix, OKLCH, Refactoring UI, WCAG 2.2, Bento Grid patterns, and more).

### Changed

- **Single canonical output**: `writeAgentConfig` now produces only `.ai/skills/AGENTS.md` + root `CLAUDE.md` pointer. Removed IDE selection step, `getActiveAgents`, `buildAgentStub`, `--agents`/`--ide` CLI flags, and all multi-agent stub generation (Cursor `.mdc`, Gemini `GEMINI.md`, Codex root `AGENTS.md`, Windsurf `.windsurfrules`, Roo `.clinerules`, Copilot `.github/copilot-instructions.md`).
- **Design preset removed from wizard**: `DESIGN` step and `designPreset` field purged from wizard, assembler, CLI parser, UI utils, and tests. Presets remain in the `ui-ux.md` skill — agents apply them at runtime, not at install time.
- **Docs filenames uppercased**: `agent-deep-flow.md` → `AGENT-DEEP-FLOW.md`, `software-development-lifecycle-sdlc.md` → `SOFTWARE-DEVELOPMENT-LIFECYCLE-SDLC.md`, `spec-driven-dev-guide.md` → `SPEC-DRIVEN-DEV-GUIDE.md`. All internal cross-references updated.
- **Images moved**: `src/assets/img/` → `docs/img/`. README image paths updated.

### Fixed

## [3.0.0] - 2026-04-15

> **Major release: Reformulation & Multi-Agent Support.** `sdg-agents` shifts from a knowledge-dump model to a router model — `AGENTS.md` is now a minimal registry and skills load on demand per cycle phase. Multi-agent and multi-idiom generation are first-class. The 8 Engineering Laws are renumbered 1–8 (was 0–7). See [docs/guides/MIGRATION-v3.md](docs/guides/MIGRATION-v3.md) for the v2→v3 migration guide.

### Added

- **Router identity (`.ai/skills/` + on-demand load)**: `.ai/skill/` → `.ai/skills/` (plural); canonical Single Source of Truth for all engineering rules. 11 skill units: `staff-dna`, `code-style`, `testing`, `security`, `api-design`, `data-access`, `observability`, `ci-cd`, `cloud`, `sql-style`, `ui-ux`. Each loads only when the current cycle phase needs it (`staff-dna.md` always activates in Phase CODE; `testing.md` in Phase CODE and TEST; domain skills when the task touches the relevant domain).
- **Multi-agent support**: single `init` run writes entry files for every selected agent. `cli-parser.mjs` gained `--all-agents` and `--idioms` (alias for `--idiom`, back-compat preserved). Wizard's single-select IDE step became a multi-select covering Claude Code, Cursor, GitHub Copilot, Gemini, Codex, Windsurf, and Roo Code. `writeAgentConfig` now targets `GEMINI.md` (Gemini), root `AGENTS.md` stub (Codex), and adds `alwaysApply: true` to Cursor frontmatter. New `buildAgentStub()` renders thin 5-line pointer files for Codex and Gemini. `getActiveAgents` dedupes and excludes the `none` sentinel.
- **Multi-idiom support**: `--idiom typescript,python,go` in a single command; wizard multi-select for polyglot projects.
- **8 Engineering Laws (renumbered 1–8)**: Law 1 Protocol · Law 2 Hardening · Law 3 Resilience · Law 4 Narrative Cascade · Law 5 Visual Excellence · Law 6 Boundaries · Law 7 Reflection · Law 8 Contextual Efficiency. Law 1 (Protocol) formalizes the DNA-GATE and Mental Reset that must be crossed before any code modification. Law 8 (Contextual Efficiency) formalizes Token Discipline (Smart Truncation, Programmatic Analysis, Reference-Based Snapshots, Self-Purge).
- **Minimal `AGENTS.md` template**: `buildMasterInstructions()` in `instruction-assembler.mjs` rewritten to emit a ~83-line minimal output (manifesto + DNA-GATE + Session Start + Cycle Protocol + Agent Roles + dynamic Skill Registry + Cycle Commands). Removed 7 routing functions (UI/UX, creative toolkit, core governance table, architectural, technical, working cycles, project context) that previously inlined knowledge.
- **Terse Mode as default output**: 6 rules from the legacy `core/caveman.md` migrated into `templates/workflow.md` `TokenDiscipline` rule as the new "Terse Mode (Default)" sub-section. Pedagogical Mode is now opt-in (previously default). Tonal tables in `skills/ui-ux.md` and `writing-soul` updated to reflect the flip.
- **Assembler single source of truth**: `instruction-assembler.mjs` refactored to a single `SKILL_CATALOG` constant (13 entries) as the source for the dynamic Skill Registry; `buildSkillRegistry` filters by category and renders grouped output.
- **`docs/guides/MIGRATION-v3.md`**: v2→v3 migration guide with breaking changes table, step-by-step instructions, and v2→v3 file mapping.
- **`README.md` v3 updates**: new "Multi-Agent Support" section, new "Multi-Idiom" examples, v3 feature block replacing the Creative Design Toolkit bullet, fixed broken links to `src/assets/dev-guides/*` (moved to `docs/`), and updated "What Gets Installed" tree to show `.ai/skills/` layout. `docs/README.pt-BR.md` mirrors all changes.
- **`docs/CONSTITUTION.md` rewrite**: now presents all 8 Laws (was 7), includes Protocol (Law 1) and Contextual Efficiency (Law 8), fixes broken `staff-dna.md` pointer.
- **`docs/PROJECT-STRUCTURE.md` rewrite**: reflects the v3 tree (`.ai/skills/` on-demand, no `core/`, no `creative/`, no `workflows/`, no `dev-guides/`), documents load conventions per phase, and lists every skill file with its purpose.
- **`docs/UI-UX.md` update**: the four UI concerns (design thinking, standards, presets, architecture) are now top-down sections within the single consolidated `.ai/skills/ui-ux.md` skill, not four separate files.

### Changed

- **BREAKING — Engineering Laws renumbered 0–7 → 1–8**: `src/assets/skills/staff-dna.md`, `api-design.md`, `cloud.md`, `instructions/templates/workflow.md`, `src/engine/config/governance.mjs` (`GOVERNANCE_RULES` label shift), `src/engine/lib/core/display-utils.mjs`, `src/engine/bin/audit/check-narrative.mjs`, and `src/engine/bin/audit/audit-bundle.mjs` (sovereign check pattern strings shift from "Law 0"/"Law 7" to "Law 1"/"Law 8"). `src/engine/lib/domain/instruction-assembler.mjs` now emits "8 Engineering Laws" (was "6+ Engineering Laws") in the DNA-GATE Law Activation step.
- **BREAKING — `.ai/skill/` → `.ai/skills/`** (plural): all cross-references updated across the engine, the 11 skill files, templates, and command files. `ruleset-injector.mjs` now copies `src/assets/skills/` → `.ai/skills/` (this copy was missing in v2.x — generated AGENTS.md referenced skill files that were never populated in consumer projects).
- **BREAKING — `src/assets/instructions/core/` deleted** (16 files, ~90KB). Content dissolved into `.ai/skills/*`: `staff-dna` → `skills/staff-dna.md`; `code-style` + `naming` + `engineering-standards` → `skills/code-style.md`; `testing-principles` → `skills/testing.md`; `security` + `security-pipeline` → `skills/security.md`; `sql-style` → `skills/sql-style.md`; `api-design` → `skills/api-design.md`; `data-access` → `skills/data-access.md`; `observability` → `skills/observability.md`; `ci-cd` → `skills/ci-cd.md`; `cloud` + `containers` → `skills/cloud.md`; `ui/*` (4 files) + `writing-soul` → `skills/ui-ux.md` + Law 4 of `staff-dna.md`. `governance.mjs` `STANDARDS_PATH` repointed from `core/code-style.md` to `skills/code-style.md`. `audit-bundle.mjs` sovereign check repointed to `.ai/skills/staff-dna.md`.
- **BREAKING — `agent-roles.md` moved**: from deprecated `core/` to `src/assets/instructions/templates/agent-roles.md`. All 6 cycle command files (`sdg-feat.md`, `sdg-fix.md`, `sdg-docs.md`, `sdg-audit.md`, `sdg-land.md`, `sdg-end.md`) repointed.
- **BREAKING — multi-agent entry files**: `GEMINI.md` replaces the legacy `AI_INSTRUCTIONS.md` Gemini target. Codex adds an `AGENTS.md` stub. Cursor entry files now carry `alwaysApply: true` in the frontmatter.
- **BREAKING — agent stubs live under `.ai/<agent>/`**: all multi-agent entry files are now written inside namespaced subfolders of `.ai/` for reference and organization (`.ai/cursor/rules/sdg-agents.mdc`, `.ai/copilot/copilot-instructions.md`, `.ai/gemini/GEMINI.md`, `.ai/codex/AGENTS.md`, `.ai/windsurf/.windsurfrules`, `.ai/roocode/.clinerules`). `CLAUDE.md` at repo root is the **sole exception** — Claude Code auto-loads it natively and its single `@`-import points back at `.ai/skills/AGENTS.md`. Downstream projects using Cursor/Copilot/Gemini/Codex/Windsurf/Roo must either symlink the file to the native root location or reference the `.ai/<agent>/` path manually; native auto-discovery at the repo root no longer applies. Affected: `instruction-assembler.writeAgentConfig()` `ideTargets` map and `ui-utils.renderPreviewIdeTargets()` dry-run preview.
- **package.json description** rewritten for v3: "AI-Native Governance Framework: router-model instruction set with on-demand skills, 8 Engineering Laws, and multi-agent support for Claude, Cursor, Copilot, Gemini, Codex, Windsurf, and Roo Code."

### Removed

- **BREAKING — Creative Design Toolkit**: `src/assets/dev-guides/prompt-tracks/` and `src/assets/creative/*` deleted. Out of scope for v3. The `src/engine/bin/init/creatives-bundle.mjs` binary, the `injectCreativeToolkit` and `injectPrompts` engine functions, the `--dev-guides`/`--no-dev-guides` flags, and the `prompts`/`creatives` wizard modes are all gone.
- **BREAKING — `.ai/workflows/governance.md`**: the 01–08 roadmap was unused operationally and the 7 Laws it restated live canonically in `skills/staff-dna.md`. Working Protocol now lives exclusively in `.ai/instructions/templates/workflow.md`.
- **BREAKING — `core/caveman.md`**: 6 rules migrated to `templates/workflow.md` TokenDiscipline as "Terse Mode (Default)".
- **BREAKING — `.ai/dev-guides/`**: removed from the generated `.ai/` tree. Reference versions (`spec-driven-dev-guide.md`, `agent-deep-flow.md`, `software-development-lifecycle-sdlc.md`) now live in `docs/` of this repository only.
- **`add-idiom` subcommand**: removed (scope cut — idioms are now selected via the wizard checkbox or `--idiom` flag).
- **`.ai/last-prompt.md`** feature removed.

### BREAKING CHANGES

1. **`.ai/` layout changed.** Run `npx sdg-agents clear` before upgrading, then re-run `npx sdg-agents init` to write the new layout.
2. **`core/` directory is gone.** Local edits under `.ai/instructions/core/` must be migrated to the corresponding `.ai/skills/*` file. See [docs/guides/MIGRATION-v3.md](docs/guides/MIGRATION-v3.md) §5 for the mapping table.
3. **Engineering Laws renumbered.** Any project documentation that references "Law 0", "Law 1", …, "Law 7" by number (not by name) must shift by +1. Referencing by name (Protocol, Hardening, Resilience, Narrative Cascade, Visual Excellence, Boundaries, Reflection, Contextual Efficiency) remains stable.
4. **Creative Toolkit removed.** Projects that used `injectCreativeToolkit` or `--dev-guides` will fail on upgrade. Remove those references.
5. **`.ai/skill/` → `.ai/skills/`.** Any custom tooling that hardcoded the singular path must be updated.
6. **Gemini entry file renamed.** `AI_INSTRUCTIONS.md` → `GEMINI.md`. Delete the old file manually if your project retained it.
7. **Agent stubs relocated under `.ai/<agent>/`.** Only `CLAUDE.md` remains at repo root. If you rely on native auto-discovery for Cursor/Copilot/Gemini/Codex/Windsurf/Roo Code, you must symlink the generated file to the native path (`.cursor/rules/sdg-agents.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`, `AGENTS.md`, `.windsurfrules`, `.clinerules`) after running `init`, or configure your agent to read from `.ai/<agent>/` directly.

### Fixed

- **`ruleset-injector` skills copy gap**: skills are now copied to `.ai/skills/` during init. In v2.x the `.ai/skill/AGENTS.md` referenced skill files that were never populated in generated projects — this silent gap is now closed.
- **`manifest-utils.computeHashes`** swapped its `core/` scan for a `skills/` scan — hashes now reflect canonical SSOT.

---

> **Older entries (v0.x–v2.x):** see [docs/CHANGELOG-archive.md](docs/CHANGELOG-archive.md) — preserved verbatim for historical accuracy.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

## [2.9.2] - 2026-04-15

### Added

### Fixed

- **Consumer Mode Audit Isolation**: Implemented `isMaintainerMode()` in `fs-utils.mjs` to distinguish between the core `sdg-agents` repo and consumer projects. The Instruction Sync check is now automatically skipped in consumer projects, Laws Compliance scans `src/**/*.mjs` instead of hardcoded internal paths, and Writing Soul only requires `README.md` (making `docs/` files optional). Eliminates false-positive "Drift detected" and "Instruction Sync" errors when running `npx sdg-agents audit` in any downstream project.

## [2.9.1] - 2026-04-14

### Added

- **Hardened Changelog Gate**: Updated the audit engine to detect and block commits when staged changes exist but the `[Unreleased]` section of the changelog is empty, ensuring all code changes are documented.

### Fixed

- **Auditor Naming Compliance**: Fixed Law 2 (No Abbreviations) violations in the audit engine's internal scansion logic.

## [2.9.0] - 2026-04-14

### Added

- **Stricter Commit Approval Gate**: Implemented a mandatory `[LOCKED: COMMIT-GATE]` in `workflow.md` and `agent-roles.md` that explicitly forbids autonomous `git commit` actions and requires verbal human approval.

### Fixed

- **Creative Toolkit Zero-Project Support**: Hardened the creative injection flow to provide core governance rules and backlog files even in empty project states.
- **Resilient Instruction Assembly**: Fixed malformed tables and broken links in `AGENTS.md` for projects without a tech stack.

## [2.8.1] - 2026-04-14

### Added

- _Internal release synchronization._

### Fixed

- **Creative Bundle Pure Entry Point**: Fixed a missing `return` in `Creatives.run` and refactored it to a one-line delegator to satisfy SLA governance.

## [2.8.0] - 2026-04-14

### Added

- **Engineering Laws Semantic Refactor**: Decoupled law numbering project-wide to ensure future scalability and resilience.
- **Project References & Credits**: Created `docs/REFERENCES.md` to acknowledge external philosophies (Caveman, Context-mode, Writing Soul) and UI research (UI/UX Pro Max, TypeUI, Tweak/Shadcn).
- **DNA-GATE & MENTAL RESET [LOCKED]**: Formalized mandatory mental reset step in `workflow.md` and `AGENTS.md` to satisfy Sovereign Protocol (Law 0) requirements.

- **Test Suite Governance Hardening**: Total refactor of `fs-utils.test.mjs` to satisfy Testing Principles (Atomic Actions, Triad Pattern, Vertical Scansion).

### Fixed

- **Test Suite Alignment**: Refactored `package.json` and unit tests (`fs-utils`, `cli-parser`) to achieve 100% compliance with recursive basin architecture and naming standards.
- **Audit Consistency**: Resolved sync drift between `.ai/` instructions and source assets.

## [2.7.0] - 2026-04-14

### Added

- **Sovereign Protocol (Law 0)**: Hardened governance by introducing Law 0, establishing project instructions as the ultimate authority over general AI training bias.
- **DNA-GATE [LOCKED]**: Implemented a mandatory 'Mental Reset' gateway at the start of Phase: CODE to ensure strict adherence to engineering laws.
- **Contextual Efficiency (Law 7)**: Integrated project philosophies for token reduction, including Smart Truncation (60/40 Split) and Reference-Based Snapshots.
- **Backlog Health Audit**: Added automated detection for context bloat in `.ai-backlog/` directories.

### Fixed

- **Explaining Returns (Law 3)**: Refactored engine utilities and audit runner to eliminate literal/bare returns and satisfy scansion laws.
- **Named Expectations**: Hardened unit tests to eliminate magic values and enforce the `actual`/`expected` triad.

## [2.6.0] - 2026-04-13

### Added

- **Laws Compliance Protocol**: Renamed "Law 3 compliance" to "Laws Compliance" and hardened the auditor's symbol scansion to 100% strictness.
- **Smart-Strict Scansion**: New auditor logic that enforces Explaining Returns even for literal objects and multi-line assignments.
- **High-Visibility Auditing**: Updated the audit runner to report all violations in a single pass, eliminating "blind spots" in governance.

### Fixed

- **Narrative Cascade (Law 3)**: Eliminated 15+ bare and literal returns across `fs-utils.mjs`, `ui-utils.mjs`, `wizard.mjs`, and all engine binaries.
- **SLA Drift**: Standardized all CLI entry points to a strict One-Line Pure Entry Point pattern.
- **Governance Engine Hardening (`init/`)** — refactored the project initialization and injection binaries (`add-idiom`, `build-bundle`, `creatives-bundle`) to satisfy the One-Line Entry Point mandate (v2.4.3).
- **Core Binary Resilience** — extracted logic from `runIfDirect` entry points into local sibling helpers, achieving 100% SLA compliance in the init domain basin.
- **Narrative scansion alignment** — standardized return patterns across the `init/` basin for improved vertical scansion.

## [2.5.2] - 2026-04-13

### Added

### Fixed

- **Governance Engine Hardening (`audit/`)** — refactored the audit bundle and checkers to achieve 100% compliance with the One-Line Entry Point mandate (v2.4.3).
- **Audit Tool Scansion** — hardened internal scansion logic and return narratives in `audit-bundle.mjs`, ensuring the governance engine satisfies its own strict scansion laws.

## [2.5.1] - 2026-04-13

### Added

- **Hardened Naming Governance** — updated the `audit` engine with programmatically enforced heuristics to block single-letter variables (`a, b, i, v`) and abbreviations across all engine basins.
- **Improved Heuristic Depth** — increased the Explaining Returns scansion depth and refined regex to ignore template interpolations (`${`), eliminating false positives in heavy template orchestrations.
- **Narrative Siblings Refactor** — refactored the central `NARRATIVE_VALIDATION_STRATEGIES` engine to adopt a delegator pattern with local sibling helpers, achieving 100% SLA and Law 3 compliance within the governance config itself.

### Fixed

- **Naming Discipline Debt** — resolved residual single-letter variable violations in `wizard.mjs`, `cli-parser.mjs`, and `version-utils.mjs`.
- **Governance Drift Prevention** — synchronized all core instruction assets (`code-style.md`) to ensure perfect alignment between the generator and the auditor.

## [2.5.0] - 2026-04-13

### Added

- **0-Drift Governance Achievement** — hardened all engine basins (`src/engine/lib/`) and binaries (`src/engine/bin/`) to reach 100% compliance with Law 3 (Narrative Cascade) and Explaining Returns.
- **Audit Tool Self-Hardening** — refactored the governance engine and audit runner (`governance.mjs`, `audit-bundle.mjs`) to satisfy the same strict engineering standards they enforce on the project.
- **Unified Lifecycle Hardening** — standardized `auto-bump`, `clear-bundle`, `review-bundle`, and `sync-rulesets` to follow the Pure Entry Point pattern and Narrative Siblings architecture.

### Fixed

- **Engine Structural Debt** — resolved residual bare returns and entry point violations across the maintenance and lifecycle basins, achieving a total 0-drift status.

## [2.4.3] - 2026-04-13

### Added

- **One-Line Entry Point Mandate** — formalized the rule that `run()`, `start()`, and `init()` must be limited to a single line of delegation.
- **Automated SLA Heuristics** — updated the governance auditor to programmatically detect Pure Entry Point violations and enforce Explaining Returns Project-wide.

### Fixed

- **Narrative Cascade (Law 3) in index.mjs** — refactored the main CLI entry point to 100% compliance, implementing a pure one-line `run()` delegator and narrative sibling patterns.
- **Audit Tool Blind Spots** — expanded scansion scope to include the project root bin and hardened regex-based heuristics for complex multi-line orchestrations.

## [2.4.2] - 2026-04-13

### Added

### Fixed

## [2.4.1] - 2026-04-13

### Added

- **Narrative Siblings Pattern (Law 3 Evolution)** — redefined the Lexical Scoping rule to favor local module-level functions (siblings) over nested functions. This transition standardizes function placement immediately following their caller (Stepdown Rule) to eliminate nesting debt and simplify maintenance of growing logic.

### Fixed

## [2.4.0] - 2026-04-13

### Added

- **Domain-Driven Basin Architecture (src/engine/)** — refactored the entire engine into logical basins: `bin/` (orchestrators for init, audit, maintenance, lifecycle) and `lib/` (core, infra, and domain layers), improving scannability and modularity.
- **Narrative Cascade (Law 3) Hardening** — achieved 100% compliance by enforcing the **Pure Entry Point** pattern across all binaries and systematically eliminating shorthand variables (`targetDir`, `pkg`, etc.) in favor of narrative identifiers.
- **Improved Governance Observability** — updated the `audit` suite to support the new basin structure and implemented self-detection resilience for engineering law enforcement.

### Fixed

- **Engine Structural Debt** — resolved fragmented logic and naming inconsistencies across 40+ files, achieving 100% compliance in the Governance Audit.
- **Audit Runner Stability** — fixed a critical syntax error and variable scope issue in the narrative scansion loop.

## [2.3.1] - 2026-04-13

### Added

### Fixed

- **Audit Runner Stability** — resolved `DeprecationWarning: [DEP0190]` in `audit-bundle.mjs` by refactoring `spawnSync` calls to avoid `shell: true` with argument arrays.

## [2.3.0] - 2026-04-13

### Added

- **Markdown-Driven Governance SSOT** — refactored the governance engine to dynamically parse rules and checklists directly from `engineering-standards.md`, establishing the documentation as the single source of truth for automated audits.
- **Narrative Cascade (Law 3) Hardening** — implemented automated heuristics for "Revealing Module Pattern" enforcement and "Prefix-based Boolean Naming" within the audit suite.

### Fixed

- **Engine Refactoring (Law 3 Compliance)** — refactored 10+ core library files to adopt the `export const Module = { ... }` pattern, achieving 100% narrative compliance.
- **Audit Runner Stability** — fixed a `TypeError` in the `runIfDirect` utility and resolved linting regressions in the configuration manifest.

## [2.2.0] - 2026-04-13

### Added

- **Hardened Governance Audit** — implemented narrative slop detection in `audit-bundle.mjs` to flag structural meta-comments (`// Arrange/Act/Assert`) and non-descriptive numbered variables (`input1`, `actual2`).
- **Transformation Scansion Protocol** — formalized the `actualRaw` vs. `actual` pattern in `testing-principles.md` to separate computation from presentation check.

### Fixed

- **Narrative Debt Removal** — refactored the entire unit test suite (9 files) to eliminate structural meta-comments in favor of vertical scansion.
- **Expressive Test Naming** — refactored `auto-bump.test.mjs` and `fs-utils.test.mjs` to replace numbered input variables with intent-based identifiers.

## [2.1.0] - 2026-04-13

### Added

- **Governance Audit Command** — implemented a dedicated `audit` subcommand in the CLI that performs comprehensive project health checks, including drift detection, narrative health, and Law 3 compliance analysis.
- **Audit Runner** — created `src/engine/bin/audit-bundle.mjs` to consolidate all governance checks into a single reportable audit summary.

### Fixed

- **Law 3 Compliance (Lexical Scoping)** — refactored `FsUtils` to encapsulate internal versioning helpers inside `filterContentByVersion`, aligning with the project's Narrative Cascade standards.
- **FsUtils Test Regression** — refactored unit tests to cover internal logic via the public API after the Lexical Scoping refactor.

## [2.0.0] - 2026-04-13

### 🏆 Milestone: Governance Observability

This major release marks the transition from static instruction sets to active **Governance Observability**. With the introduction of the Audit Gate and Circuit Breaker, the SDG ecosystem now provides a feedback loop that proactively detects architectural drift and prevents infinite refactoring cycles, establishing a new industrial standard for AI-driven engineering.

### Added

- **Audit Instruction & QA Gate** — introduced `.ai/commands/sdg-audit.md` to trigger full governance audits, and integrated the "Audit Gate" directly into the TEST phase of the Working Protocol to act as a governance drift detector during `feat` and `fix` cycles.
- **Circuit Breaker Rule** — hardened the Working Protocol's Fix Loop by enforcing a 3-strike mechanism; agents must now explicitly STOP and deliver a Failure Report after 3 failures (test, lint, or audit) instead of looping endlessly.
- **Improved Project Structure** — Inverted the documentation hierarchy to prioritize instructions (`.ai/`) over backlog (`.ai-backlog/`) and simplified the root-level tree for enhanced readability.

## [1.24.0] - 2026-04-13

### Added

- **Writing Soul v2** — upgraded `writing-soul.md` with an explicit pedagogical tone as the default: technical terms are kept in English (when field-standard) and followed by a contextual explanation in parentheses describing what the term **does**, not just what the acronym expands to (e.g., `CI/CD (pipeline that automates build, test, and deploy on every commit)`). Added a 5-row context table under `## Mouth vs Soul` covering chat, Caveman, source code, code comments, and perennial artifacts. Integrated a curated `## Anti-Patterns Reference (Stop-Slop)` section with banned phrases, structural anti-patterns (false agency, narrator-from-a-distance, binary contrasts, passive voice, dramatic fragmentation), and an 11-point quick-checks checklist for pre-delivery self-review. Credits [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya.

### Fixed

## [1.23.0] - 2026-04-13

### Added

- **Impact Map Protocol** — introduced `.ai-backlog/impact-map.md`, a volatile blast-radius file created at Phase PLAN (via `git diff` + import scanning) and cleared at Phase END. The map restricts the agent's read-list to only the files affected by the current cycle — changed files, their dependents, and tests at risk — keeping context lean and focused. Includes regeneration logic at Session Start for backlog recovery scenarios. Inspired by the structural philosophy of [code-review-graph](https://github.com/tirth8205/code-review-graph).

## [1.22.0] - 2026-04-13

### Added

- **Standardized Release Commits** — updated workflow instructions to explicitly require the `<intent>: release v<version> - <description>` pattern for all automated bumps.

### Fixed

## [1.21.3] - 2026-04-13

### Added

### Fixed

- **Documentation Sync** — updated `README.md`, `docs/README.pt-BR.md`, and `docs/PROJECT-STRUCTURE.md` to reflect the new Creative Design Toolkit features, Item 4 menu logic, and centralized architecture.

## [1.21.2] - 2026-04-13

### Added

### Fixed

- **Shared Engine Logic** — Centralized `getActiveAgents` in `InstructionAssembler` to eliminate code duplication across injection bundles.
- **Toolkit Manifest Traceability** — Integrated `writeManifest` into the `creatives` flow to ensure CLI version and selections are recorded in `.sdg-manifest.json` after standalone injections.
- **Enriched Agent Routing** — Expanded the `AGENTS.md` Creative Toolkit table to include direct links to Templates and Tactic Guides, improving AI discoverability of specialized assets.
- **Local Asset Context** — Updated skill assets with explicit local path references for better multi-agent coordination.
- **Governance Resilience** — Removed `CLAUDE.md` from git tracking and enforced it via `.gitignore` to prevent IDE-specific meta-contamination in the repository.

## [1.21.1] - 2026-04-13

### Added

- **Creative Dev-Guides Hub** — added specialized guides for Instagram, TikTok, LinkedIn, and YouTube (including safe zones and prompt logic).
- **Hardened Ruleset Injection** — restored recursion for dev-guides subfolders in the injection engine.

### Fixed

- **Creative Toolkit Menu Navigation** — Moved the "Creative Design Toolkit" option from the main menu into the `Setup` submenu (Option 1) to align with standard project initialization workflows; removed the 🎨 emoji to maintain visual consistency.
- **Centralized Creative Assets** — Refactored the injection engine to centralize all toolkit assets under `.ai/instructions/creative/` (Skills, Templates, and Guides), eliminating fragmented directories in `prompts/` and `dev-guides/`.
- **Governance Path Synchronization** — Updated `AGENTS.md` and the internal assembler to reflect the new centralized paths; implemented automatic cleanup of legacy creative folders during new injections.

### Added

- **Creative Design Toolkit (Option 4)** — Implemented a specialized "Injection" flow for brand identity, logos, social media (IG, TikTok, LinkedIn, YouTube), and landing page blueprints; added `core/creative`, `prompts/creatives`, and specialized `dev-guides/creatives/` assets to the instruction ecosystem.

### Fixed

## [1.20.1] - 2026-04-13

### Added

- **Roadmap Revision (Vision 2.x)** — Updated `ROADMAP.md` to reflect `v1.20.0` resilience achievements and projected the next maturity stages: Governance Observability (`sdg audit`), Global Instruction Registry (`sdg use`), MCP Semantic Indexing, and Visual Governance.

### Fixed

## [1.20.0] - 2026-04-13

### Added

- **Partner Metadata Step** — Added Step 9 to the interactive wizard to capture developer name and role; implemented `## Partner` section in `context.md` with localized greetings (PT-BR/EN).
- **Hardened Input Sanitization** — Implemented `safeInput` with Unicode normalization, HTML/Script stripping, and Markdown escaping; enforced 2-50 character limits for developer names.
- **Wizard Architectural Refactor** — Replaced magic numbers with semantic `WIZARD_STEPS` identifiers and implemented an index-based `STEP_ORDER` for resilient navigation.
- **Intelligent Context Injection** — Upgraded the instruction assembler to safely inject the `## Partner` section into existing `context.md` files without overwriting user changes.
- **Backend-Only UI Optimization** — Modernized the wizard flow to automatically skip design-related presets when the project scope is set to Backend single-idiom.

### Fixed

## [1.19.2] - 2026-04-12

### Added

### Fixed

- **Harness Engineering (Memory) Label** — refined the terminology label from "Harness Engineering" to "Harness Engineering (Memory)" across all documentation for conceptual clarity.

## [1.19.1] - 2026-04-12

### Added

### Fixed

- **Harness Engineering Terminology** — updated `README.md`, `README.pt-BR.md`, and `PROJECT-STRUCTURE.md` to replace "Session memory & Expertise" with the official term "Harness Engineering" across all documentation.

## [1.19.0] - 2026-04-12

### Added

- **Universal Cycle Coverage** — extended `Phase: END` governance (`sdg-end.md`, `workflow.md`, `AGENTS.md`) to enforce CHANGELOG entries for all cycle types (`docs:` and `land:` now have explicit section mappings); bumped `scripts/bump.mjs` and template to accept `docs` and `land` as valid intents mapping to `patch`.
- **SSOT Consolidation** — refactored `sdg-end.md` from a full 7-step redefinition into a thin pointer to the canonical `Phase: END` in `workflow.md`/`AGENTS.md`, eliminating protocol duplication across governance files.

### Fixed

## [1.18.2] - 2026-04-12

### Added

### Fixed

- **Phase END: Dynamic Bump Protocol** — `workflow.md` and `AGENTS.md` updated to auto-detect the `bump` script and execute it before every release commit, eliminating pre-push narrative blockers across all cycle types.

## [1.18.1] - 2026-04-12

### Added

### Fixed

- **Dynamic Semantic Delivery** — hardened `Phase: END` instructions in `workflow.md` to autonomously verify the existence of a `bump` script in `package.json` and execute `npm run bump` before proposing commits, preventing `pre-push` narrative blockers.
- **Documentation Alignment** — updated `README.md`, `README.pt-BR.md`, and `PROJECT-STRUCTURE.md` to accurately reflect the `.ai/` tree structure, including the decoupled `.ai/instructions/templates/` and centralized `.ai/workflows/` directories.

## [1.18.0] - 2026-04-12

### Added

- **Micro-Governance Resilience** — Refactored FsUtils to use pure error bounds (`safeReadJson`); decoupled context templates into `src/assets/instructions/templates/backlog/` resolving script entanglement; optimized rule injection with substring fast-paths.

### Fixed

- **Wizard State Tracking** — Replaced fragile loops with an immutable `historyStack` in the CLI wizard to fix progression errors and state bleeding on back navigation.

## [1.17.1] - 2026-04-12

### Added

### Fixed

- **Single Source of Truth** — Centralized all Claude Code and multi-agent governance logic directly into `AGENTS.md` and `workflow.md`; migrated the "Terminal Sanity Check" to the universal Session Start protocol to enforce execution checks across all IDEs; replaced bloated `CLAUDE.md` generation with a minimal reference pointer.

## [1.17.0] - 2026-04-12

### Added

- **Agent Governance Refactor** — Hardened the SDG Agents CLI workflow instructions. Redefined the 6 core Staff DNA laws as the undisputed Single Source of Truth (SSOT), removing duplication from the Assembler.
- **Environment-Agnostic Roles** — Refactored `.ai/instructions/core/agent-roles.md` to define Single-Agent as the universal standard execution trace across IDEs, treating sub-agent orchestration (`claude`) strictly as an enhanced extension.
- **Token Discipline Consolidation** — Streamlined `CAVEMAN.md` generation to eliminate redundant path allocations within the workspace.

### Fixed

## [1.16.0] - 2026-04-12

### Added

- **Zero-Leak END Resilience** — hardened the delivery cycle with mandatory workspace audits and catch-all staging (`git add .`) to prevent uncommitted side-effects.
- **Self-Healing Technical Quality** — integrated automatic lint-repair (`lint --fix`) into the END phase to resolve formatting blockers without interrupting the delivery.
- **Automated Context Bootstrapping** — added fallback logic to the END cycle to automatically recreate `.ai-backlog/context.md` if it is missing or lost.
- **Contextual Narrative Guard** — refactored the engine to allow semantic release commits by validating against specifically promoted version headers.

### Fixed

## [1.15.0] - 2026-04-12

### Added

- **Hardened Action Workflow** — refactored the Working Protocol to a strict 5-phase execution flow (SPEC, PLAN, CODE, TEST, END) with mandatory manual approval gates for delivery.
- **Token Discipline 2.0** — retired upfront "Step 0" context loading in favor of just-in-time loading during SPEC and CODE phases based on specific demand.
- **Narrative Gate Restoration** — reintegrated the full function-level quality checklist into the CODE phase.
- **Official English Standardization** — synchronized all instruction assets with official English terminology and "MODE: PLANNING/FAST" mindset labels.

### Fixed

## [1.14.2] - 2026-04-11

### Fixed

- **Hardening Agent Governance** — decoupled versioning from committing in `bump.mjs` and `auto-bump.mjs`. All manual and automated bumps now require an explicit, approved commit after files are updated.
- **Protocol instructions update** — hardened `sdg-end.md` to reflect the decoupling of the release cycle.

## [1.14.1] - 2026-04-11

### Added

### Fixed

- **CHANGELOG Date Timezone Drift** — switched from UTC-based `toISOString()` to local `en-CA` formatting in all bump scripts and templates; ensures dates in promoted headers match the developer's machine clock instead of jumping +1 day ahead in late-night releases.

## [1.14.0] - 2026-04-11

### Added

- **UI/UX Governance Evolution** — formalized the "Elevation Stack" (S0-S3) to replace the basic theme inversion law; introduced dedicated logic for dark mode elevation where surfaces become lighter as they "ascend" towards the user.
- **Component Nesting (Anilhamento)** — codified the "Concentric Radius Rule" (Outer - Padding = Inner) and border hierarchy standards for complex structural interfaces.
- **OKLCH Adaptive Chroma** — refined the perceptual color progression scale with "Vibe Control" (Vibrant vs Muted) modifiers to prevent visual weight issues in dark themes.
- **Visual Density Standards** — quantified spacing levels L1 through L4 with specific pixel/Tailwind targets to ensure information density consistency.

### Fixed

## [1.13.0] - 2026-04-11

### Added

- **CLI Update Suggestion** — implemented a non-blocking check for new versions of `sdg-agents` on the npm registry; displays a professional "Update Available" notification when a newer version is detected during interactive sessions.

### Fixed

## [1.11.3] - 2026-04-11

### Added

### Fixed

- **Missing Skill Recovery** — Fixed a bug where `.ai/skill/CAVEMAN.md` was not generated during project initialization.

## [1.11.2] - 2026-04-11

### Added

- **Zero Context Leak Protocol** — Hardened `end:` cycle and bump scripts to enforce 100% workspace synchronization; switched to `git add .` in release commits to catch `package-lock.json` and mirrored assets automatically.

### Fixed

## [1.11.1] - 2026-04-11

### Added

### Fixed

- **Release Sync Recovery** — synchronized missing source assets in `src/assets/` and updated backlog context after metadata-only bump.

## [1.11.0] - 2026-04-11

### Added

- **Token Discipline 2.0** — Integrated **CAVEMAN Full** linguistic compression for chat interactions; hardened **GSD (Get Shit Done)** protocol with mandatory session purges in `sdg-end.md` to prevent "context rot".
- **Technical Density Poda** — Aggressively pruned instruction set to minimize token usage during cold-starts; reduced `engineering-standards.md`, `backend.md`, and `frontend.md` by approximately 70% in line count while maintaining core engineering constraints.
- **Mouth vs Soul Duality** — Formalized interaction style in `writing-soul.md`: high-density technical fragments for chat (The Mouth) and inviting engineering prose for project documentation (The Soul).

### Fixed

### Changed

- **AGENTS.md Context Core** — Consolidated Token Discipline into the working protocol template (v2.0).

## [1.10.4] - 2026-04-11

### Added

- **Gatekeeper Delivery Workflow** — Hardened the `pre-push` hook to block pushes when unversioned narratives exist in `CHANGELOG.md`; eliminated the automatic `post-commit` versioning loop to prevent history noise and race conditions.
- **Atomic Release Cycle** — Upgraded `scripts/bump.mjs` to perform an all-in-one release delivery (changelog promotion + version bump + release commit); formalized the use of `npm run bump` as the standard cycle termination tool.
- **Narrative Guard Refinement** — Updated `check-narrative.mjs` to support dual-mode validation (staged `commit-msg` and full-repo `pre-push` checks).

### Fixed

## [1.10.2] - 2026-04-11

### Added

### Fixed

## [1.10.1] - 2026-04-11

### Fixed

- **Indentation-Awareness & Idempotency** — hardened `package.json` and `.ai/.sdg-manifest.json` updates to detect and preserve project-specific indentation; implemented `writeJsonAtomic` to prevent redundant file rewrites when content is already in sync.
- **Husky Resilience** — fixed a bug in `.husky/pre-push` synchronization that caused redundant command appends; added explicit idempotency guards to agent configuration files (`CLAUDE.md`, etc.).

## [1.10.0] - 2026-04-11

### Added

- **Narrative Guard** — implemented a Husky `commit-msg` hook to prevent version-bumping commits when the `CHANGELOG.md` is empty.

### Fixed

## [1.9.0] - 2026-04-11

### Added

- **Maintainer Mode Sync** — integrated automatic drift detection and synchronization for the CLI project itself; when running in its own repository, the CLI now automatically ensures that core instructions in `src/assets/instructions` are reflected in the live `.ai/` directory and `AGENTS.md`.

### Fixed

## [1.8.0] - 2026-04-11

### Added

### Fixed

## [1.7.4] - 2026-04-11

### Added

- Narrative Discipline — hardened `sdg-end.md` to mandate populating the `[Unreleased]` section before every commit when automation is active.

### Fixed

- Changelog Narrative Restoration — retroactively added descriptions for versions 1.7.1 through 1.7.3.

## [1.7.3] - 2026-04-11

### Added

- Governance Hardening (Zero Mutation Push) — removed the `npm run bump` command from pre-push hooks to prevent workspace drift during the delivery cycle; enforced "Validate at Commit, Zero Mutation at Push" strategy.

## [1.7.2] - 2026-04-11

### Fixed

- Husky Shell Syntax — resolved shell compatibility issues in `.husky/pre-push` hooks caused by incorrect NVM shims and deprecated Husky boilerplate.

## [1.7.1] - 2026-04-11

### Fixed

- Automated Changelog Promotion — corrected the `auto-bump.mjs` script to properly read and migrate `[Unreleased]` content to the active version header.

## [1.7.0] - 2026-04-11

### Added

- Smart Auto-Bump — integrated `CHANGELOG.md` promotion into the automated versioning pipeline; the `post-commit` hook now automatically moves entries from `## [Unreleased]` to the new version header.

### Fixed

## [1.6.0] - 2026-04-11

### Added

- Pedagogical Writing Soul — refined `writing-soul.md` instruction set with inviting, prose-centric guidance; eliminated em dashes and negation-affirmation patterns in favor of direct engineering wisdom.
- Internal Governance Sync — automated the synchronization of project assets to the local `.ai/` directory via CLI `init` protocol.

## [1.4.0] - 2026-04-11

### Fixed

- Governance terminology synchronization in Portuguese and English documentation.

## [1.3.0] - 2026-04-11

### Added

- Automated Bump & Changelog Governance — integrated a standard semantic versioning strategy into the SDG ecosystem; added `scripts/bump.mjs` template and unconditional Husky `pre-push` integration for JS/TS projects.
- Interactive Bump Opt-out — added Step 8 to the `sdg init` wizard to allow users to toggle automated versioning.
- CLI `--no-bump` flag — support for bypassing automation in CI/CD or specialized environments.

## [1.2.3] - 2026-04-11

### Fixed

- Internal Terminal Resilience — hardened Husky hooks with a Path Discovery block to ensure `node`/`npm` availability in non-interactive agent shells; codified abstract "Toolchain Discoverability" principle in global engineering standards; added generic "Terminal Sanity Check" to agent session start protocol.
- Version-Aware CHANGELOG — hardened `Phase: END` instructions to include finding the next package version (patch/minor) instead of defaulting to generic `[Unreleased]` headers.
- npm publish `bin` validation — removed invalid relative `./` prefix from `package.json` bin path that was causing npm to remove the CLI executable.

## [1.2.0] - 2026-04-10

### Added

- AI Backlog Knowledge Triad — separated project state from technical expertise by introducing dedicated `.ai-backlog/learned.md` (success patterns and research) and `.ai-backlog/troubleshoot.md` (RCA and failure logs); implemented Selective Lazy Loading to inject knowledge into the agent's context only when relevant (`feat:` for learned, `fix:` for troubleshoot)
- `end:` intent prefix — universal cycle terminator that forces sequential execution of the END Phase checklist (SUMMARIZE → CHANGELOG → BACKLOG → CURATE → LINT → COMMIT → PUSH); adapts CHANGELOG category by active cycle type; accepts no argument
- `land:` intent prefix — inception cycle that turns a raw vision into a grounded backlog of sequenced `feat:` tasks before any code is written
- Multi-agent execution protocol — Planning (SPEC/PLAN/Review) and Fast (CODE/TEST) roles for Claude Code; auto-enabled when `ide: claude` or `ide: all`; graceful single-agent fallback for all other environments
- Scope rule for multi-agent handoff in `agent-roles.md` — `[S]` tasks run single-agent; `[M]`/`[L]` tasks always spawn Fast after PLAN approval

### Changed

- Governance consolidation — eliminated structural redundancies to reduce cold-context overhead per session: removed duplicate Session Start block, Governance Oath, and bootstrap template from `AGENTS.md`; converted verbose XML `<context_routing>` to markdown tables; removed redundant Phase: END sections from command files; trimmed multi-agent TIP blocks from all command files (now a single reference to `agent-roles.md`)
- Context Load in Phase: CODE is now domain-scoped — loads `backend.md`/`frontend.md` only when the task domain requires it, rather than always loading all competency files
- Bootstrap process now reads `CHANGELOG.md` in addition to `package.json`, `README.md`, and entry points

### Fixed

- `post-commit` hook path corrected from monorepo layout (`packages/cli/src/engine/bin/auto-bump.mjs`) to standalone repo path (`src/engine/bin/auto-bump.mjs`) — version bump was silently failing after every commit
- `auto-bump.mjs` `ROOT_DIR` traversal fixed (5 levels → 3) and `PACKAGE_PATHS` pruned to single root `package.json`; removed dead workspace-detection logic in `resolveRootPackagePath`

## [1.0.0] - 2026-04-08

### Added

- Interactive CLI (`sdg init`) to scaffold AI governance context into any project
- Governance instruction assembler — generates `.ai/skill/AGENTS.md` at runtime
- Asset bundle system — packages governance templates into a distributable bundle
- Support for backend, frontend, and fullstack competency profiles
- TypeScript and JavaScript idiom layers
- Multi-language support (EN/PT-BR) for governance assets
- Working Protocol: SPEC → PLAN → CODE → TEST → END lifecycle
- Feature, Fix, and Docs cycle commands (`sdg-feat.md`, `sdg-fix.md`, `sdg-docs.md`)
- Session backlog system (`.ai-backlog/context.md` + `tasks.md`) for cross-session continuity
- CLAUDE.md governance integration for Claude Code

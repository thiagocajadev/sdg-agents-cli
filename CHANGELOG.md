# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

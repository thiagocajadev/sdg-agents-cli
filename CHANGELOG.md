# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

## [5.0.0] - 2026-04-24

### Added

- **Dynamic stack context via `land:` phase (dynamize idioms + competencies; preserve flavors)**: retired the static idiom catalog in favor of developer-declared stack, persisted in `.ai/backlog/stack.md` and read by Phase CODE on every session. Demolished [`src/assets/instructions/idioms/`](src/assets/instructions/idioms/) (15 language subdirectories, ~50KB), [`src/engine/config/stack-display.mjs`](src/engine/config/stack-display.mjs), [`src/engine/config/stack-versions.mjs`](src/engine/config/stack-versions.mjs), and the `sdg-agents update` + `sdg-agents sync` maintenance commands that depended on them. Fused `competencies/backend.md` + `competencies/frontend.md` into a single [`competencies/delivery.md`](src/assets/instructions/competencies/delivery.md) with two internal discriminated sections (`## Backend (load if the task is server-side)`, `## Frontend (load if the task is UI)`) preserving the full BFF envelope SSOT and frontend contract execution content. Reshaped [`sdg-land.md`](src/assets/instructions/commands/sdg-land.md) with a new **Phase STACK** between SCOPE and BACKLOG: the agent elicits languages/runtimes/frameworks in a single free-form round, classifies entries by role (Backend / Frontend / Data / Scripts), and offers optional `WebFetch` enrichment from a fixed allow-list of 12 canonical doc sources (`tc39.es`, `typescriptlang.org`, `nodejs.org/api`, `react.dev`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`). Added [`src/assets/instructions/templates/backlog/stack.md`](src/assets/instructions/templates/backlog/stack.md) — placeholder seed with the four canonical role headers (`### Backend`, `### Frontend`, `### Data`, `### Scripts`), written by [`instruction-assembler.mjs`](src/engine/lib/domain/instruction-assembler.mjs) `writeBacklogFiles` on every install but never overwritten when present (developer state protected). [`wizard.mjs`](src/engine/lib/domain/wizard.mjs) collapsed from five steps to three (`INITIAL → FLAVOR → PARTNER → DONE`) — idiom multi-selects, code-style picker, and `versions`/`idioms`/`codeStyle` selection fields all removed; surface shrunk to `{ gatherUserSelections, validateSelections }`. [`cli-parser.mjs`](src/engine/lib/infra/cli-parser.mjs) dropped the `--idiom`/`--idioms` flags and their validation. [`instruction-assembler.mjs`](src/engine/lib/domain/instruction-assembler.mjs) SKILL_CATALOG refactored: idiom injection block removed; `delivery.md` placed in a new top-level `Delivery` category; backend/frontend/surgical skills always listed so the agent self-filters per task domain (no more stack-gated conditional loading). New helper `removeGeneratedInstructions(targetDirectory)` nukes `.ai/instructions/` on every regen so stale files from prior versions (including v4.1.0 idioms and split competencies) cannot survive — silent migration, no user prompt. Phase CODE header note points at `stack.md` loaded at Session Start, avoiding a duplicate path ref that would break the Token Budget Guard's no-duplicates assertion. Dependency demolition cascade: [`ruleset-injector.mjs`](src/engine/lib/domain/ruleset-injector.mjs) dropped the idiom-copy loop and the role-gated competency switch, now copies a single `delivery.md`; [`manifest-utils.mjs`](src/engine/lib/domain/manifest-utils.mjs) stopped hashing `instructions/idioms/` and the orphan `workflows/` directory; [`ui-utils.mjs`](src/engine/lib/core/ui-utils.mjs) dropped `STACK_DISPLAY_NAMES` import and the idioms build-summary row, gained a post-install hint "First task is `land:` — discover the project stack and seed backlog"; [`display-utils.mjs`](src/engine/lib/core/display-utils.mjs) reduced to flavor-only display names; [`fs-utils.mjs`](src/engine/lib/core/fs-utils.mjs) lost `filterContentByVersion` plus its helpers `parseVersionNumber` + `evaluateVersionCondition` (orphan after idiom version-filter removed) and their tests; [`bin/index.mjs`](src/engine/bin/index.mjs) dropped the `update` and `sync` subcommand dispatch cases and the idiom label from the `update-instructions` header; [`review-bundle.mjs`](src/engine/bin/maintenance/review-bundle.mjs) dropped idiom label rendering; [`check-sync.mjs`](src/engine/bin/audit/check-sync.mjs) `MIRRORED_DIRS` updated from `['core', 'idioms', 'templates', 'competencies']` to `['templates', 'competencies', 'commands', 'flavors']`. Documentation updated lockstep: [`README.md`](README.md) replaced the "Language Idioms" section with "Stack Declaration via `land:`", updated the Quick Start block (no `--idiom` examples), simplified the Maintenance Commands block; [`docs/reference/CHEATSHEET.md`](docs/reference/CHEATSHEET.md) rewritten with a WebFetch allow-list table and a `land:` usage section replacing the idiom table; [`docs/reference/PROJECT-STRUCTURE.md`](docs/reference/PROJECT-STRUCTURE.md) tree updated (no `idioms/` directory; `stack.md` added under `backlog/`), `instructions/competencies/` description rewritten to describe the single fused `delivery.md`; [`docs/ROADMAP.md`](docs/ROADMAP.md) gained `v4.1 Governance Slim-Down` (Shipped) and `v5.0 Dynamic Stack Context` (Current) milestone rows plus detailed-vision entries, declared the core **closed** with this release, and moved the former "v4.1/v4.2/v4.3" backlog items into a new **Extensions** section as companion packages (`sdg-registry` for remote instruction imports, `sdg-mcp` for semantic context retrieval, `sdg-visual` for auto-generated diagrams, `sdg-pedagogy` for documentation detectors); [`docs/guides/MIGRATION-v3.md`](docs/guides/MIGRATION-v3.md) gained a v4.1 → v5.0 migration section at the bottom with breaking-change table and step-by-step instructions. Test rewrites: [`wizard.test.mjs`](src/engine/lib/domain/wizard.test.mjs) rewritten from scratch around the new flavor-only surface (6 tests); [`cli-parser.test.mjs`](src/engine/lib/infra/cli-parser.test.mjs) dropped all `--idiom` cases and added a guard test asserting the `idioms` field is no longer exposed; [`instruction-assembler.test.mjs`](src/engine/lib/domain/instruction-assembler.test.mjs) dropped idiom-injection and split-competency assertions, added positive tests for `stack.md` seed-write + seed protection when pre-existing + `removeGeneratedInstructions` behavior; [`ruleset-injector.test.mjs`](src/engine/lib/domain/ruleset-injector.test.mjs) switched idiom/fullstack cases for a delivery-fusion case plus a negative "no idioms/ directory" case; [`skill-content.test.mjs`](src/engine/lib/domain/skill-content.test.mjs) gained three new describes covering Phase STACK shape (heading position between SCOPE and BACKLOG + doc-source allow-list + stack.md output ref), `stack.md` seed (four role headers + land hint), and `delivery.md` fusion (discriminated sections present). 187/187 tests green (net -19 idiom tests + 13 new stack/delivery/cleanup tests), audit 100%, lint pass, drift 0.

### Fixed

## [4.1.0] - 2026-04-24

### Added

- **Governance slim-down — Akita-shape code style + consolidated gates**: stripped the ceremonial governance layer in favor of a pragmatic, single-source code style. Deleted [`src/assets/skills/staff-dna.md`](src/assets/skills/staff-dna.md) (4.1KB, 8 Engineering Laws) and rewrote [`code-style.md`](src/assets/skills/code-style.md) from 16.7KB → 5.8KB (-65%) in an Akita-inspired shape: 2-line Security-First block at the top; seven lean sections (Code style / Comments / Tests / Dependencies / Structure / Formatting / Logging); a single `PreCodeChecklist` (8 binary items — Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers) replacing the old 17-item `PreStartGate`; and a single `PreFinishGate` (8 items wired to narrative heuristics) replacing the old 14-item `EnforcementChecklist`. [`workflow.md`](src/assets/instructions/templates/workflow.md) Phase CODE dropped the DNA-GATE SUPREME BLOCK ceremony — step 1 is now a direct "Pre-Code Checklist (BLOCKING)" pointer into `code-style.md`; Phase TEST Audit Gate now references `PreFinishGate` instead of "Engineering Laws". [`instruction-assembler.mjs`](src/engine/lib/domain/instruction-assembler.mjs) SKILL_CATALOG lost the `core: staff-dna` entry; the AGENTS.md header now points at `code-style.md` and `workflow.md` instead of the Universal Engineering Manifesto. [`audit-bundle.mjs`](src/engine/bin/audit/audit-bundle.mjs) lost `checkSovereignCompliance()` (Law 1 / Law 8 validators) and its dashboard row; `checkLawsCompliance()` renamed to `checkCodeStyleCompliance()` and labeled "Code Style Compliance" in the summary. [`governance.mjs`](src/engine/config/governance.mjs) lost the unused `GOVERNANCE_RULES` export (`LAW_2_HARDENING` / `LAW_3_RESILIENCE` / `LAW_4_NARRATIVE`) and the `loadDynamicRules()` regex updated to read `<rule name="PreFinishGate">` instead of `EnforcementChecklist`; a Revealing Module `Governance = { NARRATIVE_CHECKLIST }` footer added to satisfy the pattern heuristic. [`check-narrative.mjs`](src/engine/bin/audit/check-narrative.mjs) header and summary dropped "Law 4 Compliance" wording in favor of "Narrative Cascade Compliance". [`display-utils.mjs`](src/engine/lib/core/display-utils.mjs) docstring dropped "Follows Law 8". Tests rewritten in lockstep: [`skill-content.test.mjs`](src/engine/lib/domain/skill-content.test.mjs) replaced the Law 1 / PreStartGate / twin-gate describes with Security-First + PreCodeChecklist + PreFinishGate + "ban Laws vocabulary" assertions (8 tests total); [`manifest-utils.test.mjs`](src/engine/lib/domain/manifest-utils.test.mjs) fixture keys `core/staff-dna.md` → `core/code-style.md`; [`instruction-assembler.test.mjs`](src/engine/lib/domain/instruction-assembler.test.mjs) staff-dna expectation replaced with positive `code-style.md` + `workflow.md` header assertions plus a negative "must not reference staff-dna" guard; forbidden-patterns list in the Token Budget Guard now also bans `DNA-GATE` and `Engineering Laws`; [`ruleset-injector.test.mjs`](src/engine/lib/domain/ruleset-injector.test.mjs) expected skill file switched from `staff-dna.md` to `code-style.md`; [`governance.test.mjs`](src/engine/config/governance.test.mjs) checklist-size expectation `14 → 8`, required-labels set now `['Pure entry point', 'Explaining Returns', 'Boolean prefix']` (SLA dropped from the enforced set — still a concept in code-style, but no real heuristic behind it). Docs cleanup: [`README.md`](README.md), [`CONSTITUTION.md`](docs/concepts/CONSTITUTION.md), [`PROJECT-STRUCTURE.md`](docs/reference/PROJECT-STRUCTURE.md), [`UI-UX.md`](docs/guides/UI-UX.md), [`README.pt-BR.md`](docs/i18n/README.pt-BR.md) all trimmed — staff-dna tree entries removed, DNA-GATE phrasing replaced with "Pre-Code Checklist", "Engineering Laws" pointers now read as philosophical-only references into the surviving `CONSTITUTION.md` mental-model doc. Round-trip regen via `sdg-agents init --quick` verified the generated `.ai/` matches SSOT (drift = 0). 206/206 tests green, audit 100%, lint pass. Cycle 2 (next) will dynamize idioms / flavors / competencies via `land:` discovery — out of scope here to keep the governance-layer change atomic.

### Fixed

## [4.0.0] - 2026-04-23

### Added

- **Narrative heuristics back-port (patch bundle absorption)**: external dogfood project contributions absorbed into the seed. [writing-soul.md](src/assets/skills/writing-soul.md) Pedagogical Tone rewritten with three distinct first-occurrence formats (acronym with full English expansion + optional gloss, non-acronym term with short explanation, heading short form only) plus new `Default Content Structure` section mandating intro paragraph after H1 and `## Fundamental concepts` glossary table whenever a doc introduces 3+ technical terms. Narrative heuristics in [governance.mjs](src/engine/config/governance.mjs) expanded to the full patch spec: `validateNamingDiscipline` now covers the complete 12-token banned set (`req, res, ctx, idx, tmp, arr, val, cb, mgr, ctrl, svc, prev`) with word-boundary regex plus `[,)=:.]` lookahead (drops the noisy single-letter detector); `validateExplainingReturns` now classifies logic-in-return patterns into specific hints (Ternary / Template literal / Arithmetic / Constructor / String interpolation) via the new `classifyReturnLogic` helper; `validateVerticalDensity` promoted from no-op to real implementation covering three sub-detectors — (a) double blank lines, (b) Explaining Return Tight (no blank between canonical prep+return pair), (c) Orphan-of-1 (single atomic literal between blanks after a literal pair); `validateNoSectionBanners` rewritten with multi-language regex `/^\s*(\/\/|#|--)\s*[-=]{3,}/m` covering JS, Python/shell, and SQL banner styles. All narrative validators extracted into the new sibling module [heuristics/narrative-heuristics.mjs](src/engine/config/heuristics/narrative-heuristics.mjs) via Revealing Module Pattern; `governance.mjs` reduced to a thin strategy-map + loader. [ROADMAP.md](docs/ROADMAP.md) gained a `v4.0 — Narrative Heuristics Maturity` milestone row and detailed-vision entry describing this release. Patch 03 (pedagogy detectors for documentation artifacts) evaluated and routed to a future standalone package rather than into the CLI, to preserve mission focus on code governance. 206/206 tests green (+26 new positive/negative cases across the 6 expanded detectors), audit 100%, lint pass.

### Fixed

## [3.9.0] - 2026-04-18

### Added

- **Inert tooling catalog at `.ai/tooling/`**: `sdg-agents init` now copies a pre-made, non-invasive tooling bundle into every generated project: [prune-backlog.mjs](src/assets/tooling/scripts/prune-backlog.mjs) (trims `## Done` to last N via `--keep N`, default 3, idempotent), [bump-version.mjs](src/assets/tooling/scripts/bump-version.mjs) (minimal semver bump — only rewrites `package.json.version`, zero git/CHANGELOG side-effects), husky [pre-commit](src/assets/tooling/husky/pre-commit) + [commit-msg](src/assets/tooling/husky/commit-msg) templates, and a [README.md](src/assets/tooling/README.md) with activation recipes. New `writeToolingAssets()` function in [instruction-assembler.mjs](src/engine/lib/domain/instruction-assembler.mjs) performs recursive copy + `chmod 755` on hook templates; wired into both quick and agents pipelines in [build-bundle.mjs](src/engine/bin/init/build-bundle.mjs). Generated [context.md](src/assets/instructions/templates/backlog/context.md) now includes `## Tooling (optional)` section pointing developers to the bundle. Design principle: ship pre-made scripts as inert assets — no `package.json` edit, no `.husky/` creation, no devDep auto-install. Activation is agent-assisted on demand. Test glob expanded in `package.json` to include `src/assets/tooling/**/*.test.mjs`. 180/180 tests green (+17: 5 prune + 8 bump + 3 writeToolingAssets + 1 context hint assertion), audit 100%, lint pass.

### Fixed

## [3.8.0] - 2026-04-18

### Added

### Fixed

- **Engine full-scan fix sweep + `named-const-before-call` form (a) detector gap closure**: full manual audit of `src/engine/**` against the 10 SDG rules surfaced ~40 BLOCK sites uncaught by previous sweeps. Real bugs fixed: duplicate `console.log` at [clear-bundle.mjs:89](src/engine/bin/maintenance/clear-bundle.mjs#L89) (success message was printed twice). Boolean-prefix renames (leaf utilities, zero external callers): `missingVersion`/`sameVersion` → `is*` ([version-utils.mjs:41,45](src/engine/lib/domain/version-utils.mjs#L41)), `defaultMatch` → `isDefaultMatch` ([fs-utils.mjs:106](src/engine/lib/core/fs-utils.mjs#L106)), `abortSignal` → `isAborted` ([prompt-utils.mjs:44](src/engine/lib/infra/prompt-utils.mjs#L44)), `strictMagicMatch` → `hasStrictMagicMatch` ([audit-bundle.mjs:162](src/engine/bin/audit/audit-bundle.mjs#L162)). Taboo-verb function renames (single-file scope): `executeWizardStep` → `dispatchWizardStep`, `handleQuickSetup` → `buildQuickSetup` ([wizard.mjs:59,67,114,155](src/engine/lib/domain/wizard.mjs#L114)), `handleContextInjection` → `injectPartnerSection` ([instruction-assembler.mjs:292,311](src/engine/lib/domain/instruction-assembler.mjs#L311)). `dryRun` full-chain rename to `isDryRun` across cli-parser, bin/index, clear-bundle, build-bundle (10 sites) + test adjustment. Method-call-as-boolean-subject sweep across test files surfaced 27 hits of `assert.ok(x.includes(y))` / `.startsWith()` / `.endsWith()` / `.match()` — each extracted into a named const (`hasExpected`, `hasPrefix`, `hasSurgicalHeader`, etc.) before the call. Carve-outs respected per `feedback_audit_vs_tests_contradiction.md`: `fs.existsSync(path.join(...))` FP class and trivial-literal returns remain on the backlog queue.
- **`named-const-before-call` form (a) rule priming expanded**: [sdg-rules.json](src/assets/rules/sdg-rules.json) description now explicitly covers the high-frequency test idiom — `assert.ok(actual.includes(expected))` / `.startsWith()` / `.match()` / nested property paths like `obj.error.message.includes(text)` — with zero-tolerance wording ("MUST be extracted … even when the method argument is a plain literal"). `exampleViolation` + `exampleFix` extended with two new forms. Fixture [named-const-before-call.diff](tests/fixtures/gate/violations/named-const-before-call.diff) gained 2 lines covering non-negated method-call subjects. 2 new assertions: one in [gate-prompt.test.mjs](src/engine/lib/domain/gate-prompt.test.mjs) verifying the fixture case propagates to the LLM prompt, one in [rules-loader.test.mjs](src/engine/lib/domain/rules-loader.test.mjs) blinding the description fragment against regression. 163/163 tests green, audit 100%, lint pass.

## [3.7.0] - 2026-04-18

### Added

### Fixed

- **Full test-suite scan + inline-assertion-literals sanitization**: systematic audit of all 16 colocated `*.test.mjs` files against the 10 SDG rules surfaced 6 BLOCK violations clustered in [instruction-assembler.test.mjs](src/engine/lib/domain/instruction-assembler.test.mjs) — template-literals with interpolation passed directly as the message argument to `assert.ok` / `assert.deepEqual` (lines 278, 293-298, 310-314, 334-337, 351-354, 358). Extracted each interpolated message into a named const before the call (`sizeFailureMessage`, `tokenLeakMessage`, `duplicatesMessage`, `leakMessage`, `sectionBloatMessage`, `missingSectionMessage`). Bonus pass — extracted the assertion subjects that the rule description was silent about: `actualBytes < 2700` → `isUnderSmallBudget`, `actualBytes <= TOKEN_BUDGET_BYTES` → `isWithinTokenBudget`, `!actual.includes(pattern)` → `isPatternAbsent`, `h2Matches.length <= 5` → `isWithinH2Limit`. Remaining 15 test files clean — grep for taboo-verb prefixed methods, standalone taboo-nouns, and boolean-without-prefix returned zero hits.

- **`named-const-before-call` detector gap closed — forms (f) and (g) enumerated**: expanded [sdg-rules.json](src/assets/rules/sdg-rules.json) rule description to explicitly cover (f) binary-comparison expressions (`<`, `<=`, `>`, `>=`, `===`, `!==`, `==`, `!=`) passed as boolean subjects, and (g) unary-negation of a call or property access (`!fn(x)`, `!arr.includes(x)`) passed as boolean subjects — the patterns surfaced 6 live sites in the inline-assertion-literals sweep above. Added Test-framework title exemption clause (positional template-literal titles in consagrated APIs like `it(\`...\`)`/`describe(\`...\`)`are test-name composition, not process-narrative — do not extract; carve-out honors existing`feedback_printer_carveout.md`principle). Added requirement that extracted boolean consts must honor`boolean-prefix`(is/has/can/should/did/needs/supports/allows). Updated`exampleViolation`+`exampleFix`to show binary-comparison and unary-negation extractions. New fixture [named-const-before-call.diff](tests/fixtures/gate/violations/named-const-before-call.diff) covers the 3 patterns; 2 new loader assertions verify the rule description carries`binary-comparison`+`unary-negation`fragments and the test-framework title exemption; 2 new`GatePrompt` assertions wire the fixture (diff content propagates) and verify the rule id is injected into the gate prompt. 161/161 tests green, audit 100%, lint pass.

## [3.6.3] - 2026-04-18

### Added

### Fixed

- **Full-repo gate audit + 2 sanitization residuals closed**: audit sweep across `src/engine/lib/**` (14 files) and cross-grep of `bin/**` surfaced a ceremonial-void-return regression at [gate-bundle.mjs:21](src/engine/bin/maintenance/gate-bundle.mjs#L21) (`const usageResult = printUsage(); return usageResult;` — the `print*`-prefixed wrap missed in the previous sanitization sweep) and a real `named-const-before-call` hit at [wizard.mjs:373](src/engine/lib/domain/wizard.mjs#L373) (template literal `Unknown flavor: "..."` passed inline to `fail()`). Both sites now follow the established pattern: `gate-bundle` uses bare `printUsage();` terminator; `wizard` extracts the interpolated message into `invalidFlavorMessage` before calling `fail()`, mirroring the sibling shape at L386-388. Audit also enqueued two rule-precision follow-ups — `named-const-before-call` needs carve-outs for pure data-access composition (`path.*` / `JSON.parse(fs.readFileSync(...))` / read-or-default ternaries) and `explaining-returns` needs a trivial-literal carve-out (~30 `const X = <atomic>; return X;` sites surfaced, including an internal contradiction in `wizard.mjs` where `return 'fullstack';` is bare but `return defaultScope;` is extracted). 157/157 tests green, audit 100%.

## [3.6.2] - 2026-04-18

### Added

### Fixed

- **`ceremonial-void-return` detector + `explaining-returns` void-terminator exemption**: Audit sweep surfaced 11 `const X = console.log(...); return X;` wraps across `src/engine/bin/**` where the rule was being satisfied mechanically while destroying its intent. `explaining-returns` now carries an explicit carve-out — functions whose last statement is a void side-effect call (`console.*`, `process.stdout.write`, `BundleUI.print*`) use the bare statement and an implicit return. A new WARN rule `ceremonial-void-return` catches the anti-pattern against regression, scoped strictly to leaf sites where the RHS is a known void-returning primitive (orchestrators using the canonical `const X = call(); return X;` Pure Entry Point form are exempt by design).
- **`named-const-before-call` tightened with enumeration + printer-function carve-out**: rule description now explicitly lists the five computed forms that must be extracted before any callsite — function/method calls, ternaries, template-literals with interpolation, `+` concatenations, and anonymous object literals used as configuration. Plain string/number/boolean literals and direct function references (`fs.existsSync`) remain exempt as ceremony-free positional arguments. Added printer-function carve-out: when a function's body is one `console.*` / `process.stdout.write` call and its name already carries the intent (`printX`, `logX`, `warnX`), the function name serves as the semantic const — the template stays inline to avoid semantic duplication.
- **14 composition-real callsites extracted into named consts**: `src/engine/bin/lifecycle/auto-bump.mjs` (3 sites — `syncAllPackages` restructured with clean input/output phases; `JSON.stringify(...) + '\n'` hoisted; `filter(fs.existsSync)` replaces arrow wrapper), `src/engine/bin/maintenance/gate-bundle.mjs` (3 sites — parse-error, block-violation, warn-violation outputs), `src/engine/bin/maintenance/sync-rulesets.mjs` (1 site), `src/engine/bin/maintenance/review-bundle.mjs` (2 sites), `src/engine/bin/audit/audit-bundle.mjs` (1 site), `src/engine/bin/lifecycle/prune-backlog.mjs` (1 site), `src/engine/bin/init/build-bundle.mjs` (3 sites). Pure presentation printers (`ui-utils.mjs`, `printManifestSummary`, `printComparisonReport`) remain untouched per carve-out. 157/157 tests green (+3 new assertions for `ceremonial-void-return` in prompt + loader), audit 100% compliant.

## [3.6.1] - 2026-04-18

### Added

### Fixed

- **Gate dogfooding violations eliminated across `src/engine/bin/**` and shared utils**: renamed taboo-verb function/method names (`run`→ domain verb per module,`handle*`/`perform*`/`execute*`→`apply*`/`process*`/`dispatch*`/`report\*`); renamed `runIfDirect`→`bootstrapIfDirect` across 13 importers; replaced taboo-nouns (`data`→`jsonText`/`registryPayload`, `fn`→`entryFunction`, `item`→`entry`/`itemName`, `v`→`violation`); extracted template literals and `!result.isFailure`negations into named consts at`printResult`and`console.log`callsites. Residuals accepted:`SpecDrivenGuide.run()`public API (breaking-change parked for major bump) and top-level`run()`in`index.mjs` (entry-point convention). 154/154 tests green, audit 100% compliant.

## [3.6.0] - 2026-04-18

### Added

### Fixed

- **`gate-checker` strips markdown fences from LLM output**: `parseJson` now calls `stripFences()` before `JSON.parse`, handling ` ```json ``` ` and ` ``` ``` ` wrappers that most LLMs emit despite the "ONLY valid JSON" prompt instruction. Without this fix the real-world pipeline was silently skipping every review.
- **`sdg-rules.json` rule descriptions calibrated via dogfooding**: `named-const-before-call` description now explicitly states the violation is at the argument position — not in variable assignment RHS, object property values, or array elements. `taboo-nouns` now states the full identifier must equal the banned word — compound names like `packageData`, `ruleObj`, `existingItems` are not violations. Reduces LLM false positive rate observed during 3-round audit against the sdg-agents-cli codebase itself.

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

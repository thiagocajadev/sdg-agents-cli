# Changelog

This file carries the current release. Once a new version ships, the previous entry moves to [docs/CHANGELOG-archive.md](docs/CHANGELOG-archive.md), which holds every release back to v0.x.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

## [6.0.1] - 2026-07-22

> First published v6, and the upgrade path from `5.9.0`: everything under `6.0.0` below arrives with it, breaking changes included. `5.10.0` and `6.0.0` were tagged in the repository but never reached npm.
> On its own this release adds nothing. It repairs a CI that had been red since `3d978b8` and a tarball that carried repo-internal tests.

### Fixed

- **The mirror test read a directory that no clone has.** `SyncCheckerMirror` called `readdirSync` on `.ai/tooling`, which is gitignored generated output, so it threw `ENOENT` on every CI run since `3d978b8` while passing on any machine that had run `init`. It now generates the tree into a temp directory through `writeToolingAssets` and compares it recursively against `src/assets/tooling`. That is strictly stronger: the old assertion compared two trees that both lived on the developer's disk, so a generator that stopped copying a directory would still pass against a mirror left over from an earlier `init`. Verified by sabotage, filtering `hooks/` out of the copy makes the new test fail and name the three missing files. Local mirror drift stays covered where it belongs, in `sdg-agents audit`, which `npm run gate` already runs.

- **Engine tests shipped to every consumer.** The tarball carried 27 test files, 18 of them repo-internal engine tests with no value outside this repository. A `.npmignore` had tried to stop this with `src/engine/lib/*.test.mjs`, which failed twice over: a single `*` does not cross directory boundaries, so everything under `lib/domain/`, `lib/core/` and `lib/infra/` slipped through, and a root `.npmignore` is superseded entirely once `package.json` declares `files`. The exclusion now lives where npm reads it, as `!src/engine/**/*.test.mjs` in `files`, and the dead `.npmignore` is gone. Package drops from 111 files and 504 kB to 93 files and 396 kB. The nine tests under `src/assets/tooling/` deliberately stay: `writeToolingAssets` copies that tree into the consumer's `.ai/tooling/`, and the ESLint rules ship with their tests so a consumer can verify and extend them. Verified by installing the tarball into a scratch project and running `init`: 24 tooling files land, and no engine test follows.

- **CI ran Node 22 while the package required Node 24.** `engines.node` has declared `>=24.0.0` since v5, so the pipeline was validating on a line the package says it does not support. The matrix now pins 24, the active LTS. Both READMEs state the requirement in prose beside the badge rather than in the badge alone.

## [6.0.0] - 2026-07-22

> Closes epic Harness Alignment 2026-07 with task E5, and names as breaking the change the epic introduced. Tagged in the repository but never published to npm: `6.0.1` is the release that carries it.

### Added

- **The backlog knowledge files are versioned in this repo.** E3 taught the generator to classify `.ai/backlog/` by volatility; E5 applies it to the generator itself. The root `.gitignore` traded its single `.ai/` line for a per-level negation ladder (`.ai/*`, `!.ai/backlog/`, `.ai/backlog/*`, then one `!` per knowledge file), since git will not descend into an excluded directory. `context.md`, `stack.md`, `learned.md` and `troubleshoot.md` are now tracked; `tasks.md`, `impact-map.md` and `.ai/last-prompt.md` stay local. The ladder is specific to this repo, where `.ai/` is a generated mirror of `src/assets/` and must be ignored. A consumer project owns its `.ai/` tree outright and versions it whole, so `writeGitignore` still emits the three volatile paths and nothing more. Those three lines are kept verbatim in the root file below the ladder, redundant as rules but load-bearing: `writeGitignore` matches literal lines, and dropping them makes every dogfood run append them back.

- **`local/duplicate-consecutive-statement`, the fifth local ESLint rule.** Two adjacent statements with identical source text are reported, in any block body, at module scope, and inside a `switch` case. Deferred since 2026-04-18, when a duplicate `console.log` in `clear-bundle.mjs` was fixed by hand and the detector was left pending; it lands as a lint rule rather than a `governance.mjs` heuristic so it runs before the agent reads the file and costs no gate tokens. Deliberately dumb by design: there is no allowlist of callees, because no static analysis separates a copy-paste slip from a side effect meant to run twice. A genuine double call carries an `eslint-disable-next-line` plus a comment saying why, which is how that intent should be stated regardless. No autofix, since deleting a statement is destructive. Verified against Biome 2.5.5 with `preset: "all"`: no diagnostic, so the rule joins the four already listed as ESLint-only in `tooling/README.md`. Eight tests, seven through `RuleTester` and one through the `Linter` API, since `RuleTester` executes the rule directly and never sees inline disable directives. Zero findings across the existing codebase.

### Fixed

- **The changelog carries one release; the rest moved to the archive.** `CHANGELOG.md` was 50KB and growing, so a reader looking for what shipped last scrolled past twenty versions to find it. Everything below the current entry now lives in `docs/CHANGELOG-archive.md`, whose header states that entries are preserved verbatim and describe the release that shipped them rather than the CLI today. Migrating the entries exposed a link defect: those entries carry repo-root-relative paths (`src/engine/...`), which resolved from `CHANGELOG.md` and break from inside `docs/`. 161 links were rewritten relative to `docs/`. Eight remain pointing at files that later releases deleted, and the header now says so.

- **Documentation caught up with six releases.** `ROADMAP.md` still ended at v5.0 and called it current; it gained v5.x and v6.0 milestone rows plus matching Detailed Vision entries. The migration guide stopped at v5.0 and now carries a v5.x → v6.0 section with the breaking table, upgrade steps, and the hand-edit the `.gitignore` needs, since `writeGitignore` only appends. `TOKEN-OPTIMIZATION.md` gained an intro separating the current cost model from the historical v3 compaction record and dropped the idiom references retired in v5.0. `CHEATSHEET.md` gained the intro paragraph the writing soul requires after an H1, lost a paragraph that restated the row above it, listed the missing `narrative` command, and dropped the "law violations" wording retired in v4.1.

- **Two concept docs contradicted the protocol they describe.** `SPEC-DRIVEN-DEV-GUIDE.md` documented the cycle triggers as `/sdg-feat` and `/sdg-fix` slash commands, which the vendor-neutral constraint rules out and the CLI has never installed; the triggers are message prefixes. The same file granted a "Reasoning Exception" at both approval gates, letting reasoning models proceed to PLAN and CODE without the developer, which `workflow.md` does not permit. `AGENT-DEEP-FLOW.md` still sent the END phase to write the next objective into `context.md`, moved to `tasks.md` in v5.10.0, and to log insights into a `## Engineering Insights` section of `context.md` that exists in no template; that knowledge goes to `learned.md` and `troubleshoot.md`.

- **README slimmed, badges added, spacing loosened.** The feature list dropped nested sub-bullets that repeated what the linked docs already say, and the `end:` explanation that appeared twice was cut to one. Seven badges replace two: npm version and downloads, CI status, Node, license, AGENTS.md compatibility, and changelog format. Both top-level lists were converted to loose lists so the bullets breathe.

- **The pt-BR README realigned with the English one, then rewritten to the writing soul.** Both carry the same seven badges, the same slimmed feature list, the same loose-list spacing, and the same eight sections. The translation also carried a defect of its own: its installed-tree diagram still listed `idiomas` under `instructions/`, retired in v5.0. The prose pass applied the soul's pedagogical rule that the English version does not need: every English term that would stop a Brazilian reader now carries a translation in parentheses on first use (`Work Checklist`, `Circuit Breaker`, `quality gates`, `flavor`, `stack`, `backlog`, `Impact Map`, `runtime`, `drift`, `RCA`, `ADR`, `slash commands`). Cut along the way: the "Sinta-se à vontade" filler, the mechanical metaphor "onde cada tipo de lógica mora", the binary contrast "Stack é dinâmico, não catalogado", and the loanwords that had plain Portuguese equivalents (`elicita`, `semeia o backlog`, `enriquecimento`, `scaffold`). The closing `_O equilíbrio é a chave._` stays in both READMEs by the author's decision: it is a personal principle, not a flourish.

- **`package.json` pointed at a repository that does not exist.** The `repository.url` field read `sdg-agents-cli` while the remote is `sgd-agents-cli`, so the repository link on the npm page was broken.

### BREAKING CHANGES

- **Governance lives at the repo root.** The canonical `AGENTS.md` left `.ai/skills/` for the project root, and `CLAUDE.md` `@`-imports the root path. An install made from any v5 release keeps a stale `.ai/skills/AGENTS.md`, and any tooling that reads governance from the old path reads a copy that no longer receives updates. **Migration:** re-run `npx sdg-agents init`. The legacy file is deleted under the same ownership sentinel that guards the writes, so an `AGENTS.md` you wrote yourself survives untouched.
- **The generated `.gitignore` no longer blankets `.ai/backlog/`.** `writeGitignore` only appends, so a project installed from a v5 release keeps its legacy `.ai/backlog/` line and continues discarding `stack.md`, `learned.md` and `troubleshoot.md`. **Migration:** delete the `.ai/backlog/` line by hand, re-run `init`, then commit the three files.

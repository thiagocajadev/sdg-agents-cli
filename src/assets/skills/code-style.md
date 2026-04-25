# Code Style — SDG Essentials

<ruleset name="CodeStyle">

> Load in **Phase CODE**. SQL aesthetics in `sql-style.md`; UI copy voice in `writing-soul.md`.

## Security first

- Default deny at every boundary. Fail fast if environment is incomplete.
- Never concatenate user input into queries, commands, paths, or logs — validate at edges, reject what isn't expected.

---

## Structure & Tooling

- **File naming** `domain.operation.ext` (`order.compute.js`, `user.validate.ts`). Never `helpers.js`, `utils.js`, `common.js`.
- **Files** under 500 lines. One concern per module (SRP). Follow framework convention (Rails, Django, Next.js, Astro) — don't reinvent the tree.
- **Formatter**: language default (`prettier`, `gofmt`, `black`, `cargo fmt`, `rubocop -A`). No style debates beyond that. No alignment padding for `=` or `:`. Visual density (grouping blanks, dot-chain breaks) layers **on top** — formatter handles wrapping and indentation; blank lines between statements are the developer's signal layer and are never reformatted by the tool.
- **Logging**: Structured JSON for debug / observability (one event per line, stable keys). Plain text only for user-facing CLI output.

---

## Form — function structure and narrative

- **English source** — code is universal; short unambiguous names in English.
- **Narrative code** — the code tells the story; if it needs a comment to be understood, naming failed.
- **Clean entry point** — `run()` / `start()` / `init()` as headline caller: single-statement side-effect form (`await call();`) OR canonical 2-statement form (`const result = call(); return result;`). Forbidden: ternary on return line, any logic.
- **Vertical signature** — up to 3 parameters per line; 4+ must use an object. Destructuring inside function body, not in the signature.
- **Orchestrator on top** — the caller is visible before the details (top-down).
- **Details below** — helpers sit below the caller (Stepdown Rule). One-use helpers as **Narrative Siblings**: directly below their caller, nowhere else.
- **No logic in return** — **Explaining Returns**: assign to a named `const` before every meaningful `return`; no logic / ternary / anonymous object on the return line. Void-terminator form is exempt — a side-effect call (`console.log(message);`) ends the function with an implicit return. Never ceremonialize into `const X = sideEffect(); return X;`.

---

## Readability — flow, visual density, and names

- **Early return** — exit early on failure; no `else` after `return`. Max 2 indent levels.
- **Control flow** — match tool to shape: guards for failure exits • lookup table for value mapping (`const MAP = {...}; return MAP[key] ?? default`) • `switch` for action dispatch (side-effects) • `Map` for non-string / dynamic keys • ternary only for 2-value assignment • `===` / `!==` always (never `==`). Each function orchestrates OR implements (SLA) — never both.
  - **Braced guards** — every `if` / `else if` / `else` / `for` / `while` body wrapped in `{ }`, body on its own line. Applies to any single-instruction body: `return`, `throw`, `break`, `continue`, assignment. Enforced by `curly: all` ESLint rule (auto-fix on save).
    - ❌ `if (isEmpty) return null;`
    - ✅ `if (isEmpty) {\n  return null;\n}`
- **Low visual density** — **Paragraphs of Intent**: 1 blank line between logical groups, 0 within a group, never 2+ consecutive. Wall of tight code and double-blank noise are equal violations. Blank lines after multiline statements and between top-level function declarations are enforced by ESLint (auto-fix on save).
- **Expressive names** — names reveal domain intent, not storage or implementation detail.
  - Banned verbs: `handle`, `do`, `run`, `execute`, `perform`; `get` for computations (use `compute` / `calculate` / `derive`).
  - Banned nouns: `data`, `info`, `obj`, `item`, `thing`, `helpers`, `utils`, `common`, `shared`, `misc`.
  - Banned abbreviations: `req` → `request`, `res` → `response`, `ctx` → `context`, plus `idx`, `prev`, `arr`, `val`, `tmp`, `cb`, `fn`, `mgr`, `ctrl`, `svc`.
  - **Booleans** carry semantic prefix: `is` / `has` / `can` / `should` / `did` / `needs` / `supports` / `allows`. Never bare `loading`, `error`, `active`.
  - **Import aliasing** — imports whose public symbol is single-letter or a meaningless acronym must be aliased with an intent name at the import site.
    - `import z from 'zod'` → `import { z as validate } from 'zod'`
    - `import fs from 'node:fs'` → `import fileSystem from 'node:fs'`
    - `import { t } from 'node:test'` → `import { test as testCase } from 'node:test'`
    - Carve-outs: identifiers ≥3 chars that are already English words or established acronyms (`path`, `os`, `url`, `http`, `crypto`) stay as-is.
- **Code as documentation** — names replace comments. WHY over WHAT; skip `// increment counter` above `i++`. `// why:` permitted only for hidden constraints (invariants, workarounds, bug references). Docstrings on public functions: intent + one usage example. Reference issue numbers / commit SHAs when a line exists because of a specific bug. No section banners (`// --- Section ---`). Keep your own comments on refactor — they carry intent and provenance.
- **Template literals over `+`** — build dynamic or multi-part strings with template literals (`` `${a}-${b}` ``), not `+` concatenation. `+` is reserved for documented self-flag evasion and similar one-line workarounds where the reason is annotated inline.
- **No magic values** — named constants instead of loose numbers and strings. Magic extends beyond numbers: any string whose visible form does not match its purpose is magic — `'en-CA'` used to emit ISO dates, single-letter locale codes for formatting side-effects, etc. Prefer expressions whose surface declares the output (`new Date().toISOString().split('T').at(0)`). Exception messages include the offending value and the expected shape.

---

## Quality Control — state, errors, async, and tests

- **Small functions** — 4–30 **logical statements** (not raw LoC). Vertical dot-chain breaks, density blanks, and multi-line signature expansions don't count toward the ceiling — one expression split across lines is one statement. Name needs "and" → split. One responsibility, one level of abstraction.
- **Compute vs format** — compute data and format output in separate functions.
- **Immutability by default** — `const` / readonly first; `let` only when necessary. Mutation crosses boundaries explicitly.
- **CQS** — function mutates (command) OR reads (query, pure) — never both.
- **Explicit dependencies** — inject via constructor / parameter; no hidden globals, no module-level singletons for mutable state. Wrap third-party libs behind a thin interface owned by this project.
- **Fail fast** — validate early; abort invalid flow at the boundary.
- **Explicit return** — exceptions are not control flow. Return `Result` / discriminated union / explicit `null` for expected absence.
- **Consistent contracts** — standardized response shapes; the same format every time.
- **Centralized error handling** — typed error classes; `try/catch` at boundaries, not scattered.
- **Async I/O** — `async/await`, never block.
- **Explicit types** where the language supports them — no `any`, no untyped public function.
- **No duplication** — extract shared logic when the pattern repeats three times (Rule of Three), not sooner.
- **Structured tests** — F.I.R.S.T (Fast, Independent, Repeatable, Self-validating, Timely). **AAA** phases explicit: Arrange / Act / Assert, clean asserts without inline expressions. Every new function gets a test; bug fixes get a regression test. Mock external I/O (API, DB, filesystem) with named fake classes — not inline stubs. Each suite covers happy path + edge case + expected failure.

---

<rule name="PreCodeChecklist">

## Pre-Code Checklist

> Recite before the first `Edit` / `Write` / `NotebookEdit` in Phase CODE. Binary — no partial credit. If any item is uncertain, re-read the relevant section above before writing.

- [ ] **Mental Reset** — named which training default is being suspended for this task (verbose prose, dense walls, auto-summarize, taboo verbs).
- [ ] **Target Files** — explicit path list from approved Plan; no drift.
- [ ] **Naming** — no banned verbs / nouns / abbreviations; booleans carry semantic prefix; files follow `domain.operation.ext`; single-letter imports aliased with intent name.
- [ ] **Narrative** — Stepdown, SLA, Explaining Returns, control-flow tool matches shape, ≤2 indent levels.
- [ ] **Comments** — WHY only; no what-comments; docstring on public surfaces.
- [ ] **Tests planned** — new function → test; bug fix → regression test; external I/O mocked; AAA phases explicit.
- [ ] **Security** — boundary inputs validated; no string-concat into queries / commands / paths.
- [ ] **Blockers** — `none` or enumerated.

</rule>

<rule name="PreFinishGate">

## Pre-Finish Gate

> Recite at Phase TEST. Binary pass / fail — no partial credit. Each item is wired to a narrative heuristic validator in `governance.mjs`.

- [ ] **Pure entry point**: `run()` as headline caller only (single-statement or canonical 2-statement form).
- [ ] **Narrative Siblings**: one-use helpers as siblings below callers.
- [ ] **Explaining Returns**: named `const` above every meaningful `return` (void-terminator exempt).
- [ ] **Revealing Module Pattern**: named export at footer.
- [ ] **Vertical Density**: 1 blank between groups, 0 within, never 2+.
- [ ] **Boolean prefix**: `is` / `has` / `can` / `should` / `did` / `needs` / `supports` / `allows`.
- [ ] **No framework abbreviations**: `req` / `res` / `ctx` forbidden; plus SDG taboos (banned verbs / nouns / abbrs).
- [ ] **No section banners**: no `// --- Section ---` dividers.

</rule>

## Linter-enforced (ESLint auto-fix on save)

> These rules run before the agent sees the code. No gate check needed.

| Rule                              | Coverage                                                                                                                                                 |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `curly: all`                      | Every `if`/`else`/`for`/`while` body wrapped in `{ }`                                                                                                    |
| `local/semantic-spacing`          | Blank line after multiline statement; 2+2 split in 4-statement non-test bodies; no spurious blanks between consecutive VDs before a side-effect terminal |
| `local/no-boolean-comparison`     | `value === true/false` → `value` / `!value`                                                                                                              |
| `local/no-inline-assert`          | Named `actual*` / `expected*` identifiers on both sides of every assertion (test files)                                                                  |
| `local/blank-before-assertion`    | Blank line before first `assert.*` / `expect()` in a block; no blank between consecutive assertions (test files)                                         |
| `padding-line-between-statements` | Blank line before/after top-level function declarations                                                                                                  |
| `prettier`                        | Formatting, indentation, quotes, semicolons, dot-chain wrapping (printWidth 80)                                                                          |

Activation recipe: `.ai/tooling/eslint-config/snippet.mjs` + `.ai/tooling/README.md`.

</ruleset>

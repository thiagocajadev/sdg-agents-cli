# Tooling (optional, inert)

Pre-made scripts and hooks. **Nothing is wired by default** — `sdg-agents init` copies
these files into `.ai/tooling/`, but no `package.json`, no `.husky/`, no devDep is
modified by the CLI. Activate on demand with agent assistance or manually.

## Inventory

### `scripts/prune-backlog.mjs`

Trims `.ai/backlog/tasks.md` `## Done` section to the N most recent entries.

```
node .ai/tooling/scripts/prune-backlog.mjs [--keep N]
```

- Default `N = 3`.
- Idempotent: running twice with the same `--keep` is a no-op.
- Intended for Phase END of each cycle.

### `scripts/bump-version.mjs`

Minimal semver bump. Only rewrites `package.json.version`.

```
node .ai/tooling/scripts/bump-version.mjs <patch|minor|major>
```

- Does NOT touch `CHANGELOG.md`.
- Does NOT run `git add`, `git commit`, `git tag`, or `git push`.
- Use case: dev experimentation, pre-release bumps, or agent-driven version-only changes.
- For full release bump (version + CHANGELOG promote + stage), use the project's own
  `scripts/bump.mjs` if installed.

### `husky/pre-commit`

Runs the SDG gate against staged changes, blocking commit on rule violations.

### `husky/commit-msg`

Validates conventional-commit prefix:
`feat|fix|docs|audit|land|chore|refactor|test|perf`.

### `biome/biome.json`

Opt-in Biome config: fast baseline formatter plus a small set of ES style rules
(`useConst`, `useTemplate`, `useSingleVarDeclarator`, `noVar`, `noUselessElse`,
`useArrowFunction`).

Biome does not cover visual density. Blank-line rhythm, named const before call,
explaining returns and assertion spacing have no equivalent rule in Biome, and
its formatter preserves an existing blank line but never requires one. Those
stay with the ESLint rules in `eslint-rules/`. Run Biome alongside ESLint, not
instead of it.

### `hooks/writing-lint.mjs`

Advisory PostToolUse hook. Scans Markdown writes (Write / Edit / MultiEdit)
against the banlists from `writing-soul.md` (banned adverbs, openers,
emphasis, jargon). Banlists are English-only — project artifacts ship in
English. Scope: `src/assets/skills/*.md`,
`docs/**.md`, `README*.md`, `CHANGELOG.md`. Working-state files
(`tasks.md`, `context.md`, `impact-map.md`, `stack.md`, `troubleshoot.md`,
`learned.md`) are excluded. Always exits 0; reports go to stderr.

## Activation recipes

### Activate ESLint rules

Requires ESLint v9+ with flat config (`eslint.config.mjs`).

1. Install ESLint and Prettier (if not already present):

```
npm install --save-dev eslint @eslint/js prettier eslint-plugin-prettier eslint-config-prettier
```

2. Import `sdgEslintConfig` from the snippet and add it **after** `prettierRecommended` in your flat config:

```js
import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import { sdgEslintConfig } from ".ai/tooling/eslint-config/snippet.mjs";

export default [js.configs.recommended, prettierRecommended, sdgEslintConfig];
```

3. Copy `.ai/tooling/eslint-config/.prettierrc` to your project root (or merge with your existing config).

4. Wire auto-fix on save in VSCode (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Rules included:**

| Rule                                    | Coverage                                                               |
| :-------------------------------------- | :--------------------------------------------------------------------- |
| `curly: all`                            | Every `if`/`else`/`for`/`while` body must use `{ }`                    |
| `local/semantic-spacing`                | Blank line required after multiline statement in non-trivial functions |
| `local/no-boolean-comparison`           | `value === true/false` → `value` / `!value`                            |
| `local/duplicate-consecutive-statement` | Two adjacent statements with identical source text                     |
| `padding-line-between-statements`       | Blank line required before/after top-level function declarations       |

Or ask your agent: "wire the SDG ESLint rules into my eslint.config.mjs."

### Activate husky hooks

```
npm install --save-dev husky
npx husky init
cp .ai/tooling/husky/pre-commit .husky/pre-commit
cp .ai/tooling/husky/commit-msg .husky/commit-msg
chmod +x .husky/pre-commit .husky/commit-msg
```

### Wire scripts as npm commands

Edit `package.json`:

```json
{
  "scripts": {
    "prune:backlog": "node .ai/tooling/scripts/prune-backlog.mjs",
    "bump:version": "node .ai/tooling/scripts/bump-version.mjs"
  }
}
```

Or ask your agent: "wire the tooling scripts into package.json."

### Activate SQLFluff

Requires SQLFluff 2.x.

1. Install SQLFluff:

```
pip install sqlfluff
```

2. Copy the standard config to your project root:

```
cp .ai/tooling/sqlfluff/.sqlfluff .sqlfluff
```

3. Wire format-on-save in VSCode (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "[sql]": {
    "editor.defaultFormatter": "dorzey.vscode-sqlfluff"
  }
}
```

4. For PostgreSQL projects, change in `.sqlfluff`:

```ini
dialect = postgres
[sqlfluff:rules:capitalisation.identifiers]
capitalisation_policy = lower
```

**Rules included:**

| Rule                         | Coverage                                    |
| :--------------------------- | :------------------------------------------ |
| `capitalisation.keywords`    | Keywords uppercase                          |
| `capitalisation.identifiers` | Identifiers PascalCase (SQL Server default) |
| `layout.comma`               | Trailing commas                             |
| `layout.operators`           | Trailing `AND` / `OR` (after operator)      |
| `references.qualification`   | Requires `Table.Column` qualification       |

Or ask your agent: "wire SQLFluff into my project."

### Activate Biome

A fast formatter and baseline linter that runs beside ESLint. It covers
formatting and common ES style; the visual-density rules stay in ESLint.

Two things the config already handles, both of which abort Biome otherwise:
it excludes `.ai/`, because Biome 2.x reads the template copy still sitting in
`.ai/tooling/biome/` as a second root config; and it sets `vcs.useIgnoreFile`,
which needs a git repository with a `.gitignore` present.

1. Install Biome:

```
npm install --save-dev --save-exact @biomejs/biome
```

2. Copy the config to your project root:

```
cp .ai/tooling/biome/biome.json biome.json
```

3. Add an opt-in script to `package.json` (does NOT replace `lint`):

```json
{
  "scripts": {
    "lint:biome": "biome check .",
    "lint:biome:fix": "biome check --write ."
  }
}
```

4. Optional VSCode format-on-save (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[javascript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[json]": { "editor.defaultFormatter": "biomejs.biome" }
}
```

**Rules included:**

| Biome rule               | Coverage                                       |
| :----------------------- | :--------------------------------------------- |
| `formatter.lineWidth`    | 100 columns                                    |
| `useConst`               | No `let` for never-reassigned bindings         |
| `useTemplate`            | Template literals over string concatenation    |
| `useSingleVarDeclarator` | One declaration per `const` / `let` statement  |
| `noVar`                  | Forbid `var`                                   |
| `noUselessElse`          | Remove `else` after a guarded `return`         |
| `useArrowFunction`       | Prefer arrow functions for anonymous callbacks |
| `useConsistentArrayType` | `T[]` over `Array<T>` (TS)                     |

**Not covered — keep ESLint for these.** Checked against Biome 2.5.5 with
`preset: "all"`, the full catalog: none of the five produce a diagnostic.

| SDG rule                                | Gap in Biome                                                                                |
| :-------------------------------------- | :------------------------------------------------------------------------------------------ |
| `local/semantic-spacing`                | No blank-line rhythm rule; the formatter keeps an existing blank line but never demands one |
| `local/blank-before-assertion`          | Same gap, applied to test bodies                                                            |
| `local/no-inline-assert`                | No rule for naming both sides of an assertion                                               |
| `local/no-boolean-comparison`           | `value === true` goes unreported                                                            |
| `local/duplicate-consecutive-statement` | A statement repeated verbatim on the next line goes unreported                              |

Or ask your agent: "wire Biome into my project."

### Activate writing-lint hook

Advisory hook that scans Markdown writes against the writing-soul banlists.
Reports to stderr; never blocks the tool call.

1. Copy the hook script into the project:

```
mkdir -p .claude/hooks
cp .ai/tooling/hooks/writing-lint.mjs .claude/hooks/writing-lint.mjs
chmod +x .claude/hooks/writing-lint.mjs
```

2. Register it as a PostToolUse hook in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/writing-lint.mjs"
          }
        ]
      }
    ]
  }
}
```

3. Test by editing a scoped file (e.g. `docs/test.md`) with a banned term.
   Stderr should show `<file>:<line> — banned <category>: "<term>"`.

**Scope** (positive match): `src/assets/skills/*.md`, `docs/**.md`,
`README*.md`, `CHANGELOG.md`.
**Excluded** (working state): `tasks.md`, `context.md`, `impact-map.md`,
`stack.md`, `troubleshoot.md`, `learned.md`.

Or ask your agent: "wire the writing-lint hook."

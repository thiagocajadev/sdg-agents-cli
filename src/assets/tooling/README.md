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

| Rule                              | Coverage                                                               |
| :-------------------------------- | :--------------------------------------------------------------------- |
| `curly: all`                      | Every `if`/`else`/`for`/`while` body must use `{ }`                    |
| `local/semantic-spacing`          | Blank line required after multiline statement in non-trivial functions |
| `local/no-boolean-comparison`     | `value === true/false` → `value` / `!value`                            |
| `padding-line-between-statements` | Blank line required before/after top-level function declarations       |

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

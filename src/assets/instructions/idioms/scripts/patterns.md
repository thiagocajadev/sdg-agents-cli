# Scripts (Shell / Bash / PowerShell) — Project Conventions

> Universal principles (naming, composition, DRY, performance, security) are in `../../core/staff-dna.md`.
> This file contains only decisions specific to scripting environments.

<ruleset name="ScriptsConventions">

## Error Handling

- **Strategy**: Explicit and immediate failure
  - Bash: `set -euo pipefail` mandatory at the top
  - PowerShell: `$ErrorActionPreference = "Stop"`
- **Propagation**: Error halts execution; consistent exit code (`0` = success, `!= 0` = error)
- **Never**: Ignore errors; continue after a critical failure; hide relevant output

---

## Structure

- Small and focused scripts — single purpose
- Functions for reusable blocks
- Standard order:
  1. Config / constants
  2. Input validation and pre-conditions
  3. Execution
- Files: `kebab-case.sh` / `kebab-case.ps1`
- Functions: clear and descriptive names

---

## Input & Parameters

- Always validate input before execution
- Explicit parameters (`--flag`, `-f`); avoid ambiguous positionals
- Secure and documented defaults
- **Never**: Assume implicit context; depend on hidden external state

---

## Logging & Output

- Clear and objective output
- `stdout` → valid output (result)
- `stderr` → errors and diagnostics
- Important logs highlighted (prefix `[INFO]`, `[ERROR]`, etc.)

---

## Idempotency

- Scripts must be able to run more than once without breaking state
- Check existence before creating (`if [ ! -d ... ]`, `if (-not (Test-Path ...))`)
- Setup operations must be safe for re-execution

---

## Security

- Never expose secrets in code or logs
- Use environment variables for credentials
- Sanitize inputs — avoid unsafe interpolation and command injection
- Double quotes in bash variables: `"${VAR}"` (prevents word splitting)

---

## Portability

- Declare requirements clearly at the top (dependencies, OS version)
- Avoid unnecessary dependencies
- Compatibility across environments when possible (Linux/macOS/Windows)

---

## Scripts-Specific Delta

- A good script is: short, predictable, easy to read
- Avoid complex logic, implicit flows, and silent "hacks"
- If the script grows too much → refactor to a real application
- Prefer native OS tools before adding external dependencies

</ruleset>

# CI/CD & Automation Principles

<ruleset name="CI/CD Standards">

> [!NOTE]
> Rules for continuous integration and delivery. If it's not automated, it will eventually break.
> Load in **Phase CODE** when touching pipeline YAML, deployment config, or release tooling.

## Rule: Pipeline Architecture

<rule name="PipelineArchitecture">

> [!IMPORTANT]
> Every push to a shared branch must pass through automated quality gates. No exceptions.

#### Pipeline Stages (Sequential)

```
Lint → Security → Test → Build → Deploy (Staging) → Smoke Test → Deploy (Production)
```

1. **Lint & Format**: Reject code that doesn't follow the project's style. Zero warnings policy.
2. **Security Gates**: Every build MUST pass the DevSecOps pipeline defined in `.ai/skill/security.md` (Part 2).
   - **Secrets Scan**: Prevent hardcoded credentials (e.g., Gitleaks, TruffleHog).
   - **SAST**: Static analysis for injection, XSS, SSRF (e.g., Semgrep, CodeQL, SonarQube).
   - **SCA**: Dependency vulnerability check and SBOM generation (e.g., Snyk, npm audit, Trivy).
3. **Unit & Integration Tests**: Fail the pipeline if any test fails. No skipped tests in CI.
4. **Build**: Produce a versioned, immutable artifact (Docker image, binary, or bundle).
5. **Deploy to Staging**: Automatic deployment to a staging environment for validation.
6. **Smoke Tests**: Run critical-path E2E tests against staging. Verify that **RED Metrics** (Rate, Errors, Duration) are being captured correctly in the observability dashboard before promotion.
7. **Deploy to Production**: Manual approval gate or automated canary rollout.
   </rule>

## Rule: Local Pre-commit Gates

<rule name="LocalPreCommitGates">

> [!IMPORTANT]
> CI catches problems late. Pre-commit hooks catch them immediately — before the push, before the review, before the pipeline.

#### Instructions

- **Always set up local hooks when configuring CI.** They are the first line of defense and the fastest feedback loop.
- Use **husky** to version the hooks alongside the repository so every contributor gets them automatically on `npm install`.
- Use **lint-staged** to run checks only on staged files — not the entire codebase. This keeps the hook fast (under 5s).
- The pre-commit hook must run at minimum: **lint + auto-fix**. If lint fails after auto-fix, block the commit.

#### Setup (Node.js projects)

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit`:

```bash
npx lint-staged
```

`package.json`:

```json
"lint-staged": {
  "packages/cli/**/*.mjs": "eslint --fix",
  "packages/app/**/*.{ts,tsx,js}": "eslint --fix",
  "**/*.{json,md}": "prettier --write"
}
```

#### Why this order matters

`local hook → push → CI pipeline` — catching a formatting error in CI wastes a full pipeline run and a round-trip. The pre-commit hook makes it a sub-second local fix.

</rule>

## Rule: Branch Protection

<rule name="BranchProtection">

> [!IMPORTANT]
> The main branch is sacred. No direct pushes. No force pushes.

#### Instructions

- **Required reviews**: At least 1 approval before merge. 2 for security-sensitive changes.
- **Status checks**: All CI checks must pass before merge is allowed.
- **Linear history**: Prefer squash merges or rebase to keep history readable.
- **No skipping**: Never bypass CI with `--no-verify` or admin overrides in production branches.
  </rule>

## Rule: Security Tool Integration

<rule name="SecurityToolIntegration">

> [!NOTE]
> Recommended tools per ecosystem. Choose one per category and enforce it.

#### Tool Matrix

| Category      | Node.js / TS    | Python            | .NET                     | Go                 | Java             | Rust                |
| :------------ | :-------------- | :---------------- | :----------------------- | :----------------- | :--------------- | :------------------ |
| **Secrets**   | Gitleaks        | Gitleaks          | Gitleaks                 | Gitleaks           | Gitleaks         | Gitleaks            |
| **SAST**      | Semgrep, CodeQL | Bandit, Semgrep   | Roslyn Analyzers         | gosec, govulncheck | SpotBugs, CodeQL | cargo-audit, clippy |
| **SCA**       | npm audit, Snyk | pip-audit, Safety | dotnet list --vulnerable | govulncheck        | OWASP Dep-Check  | cargo-deny          |
| **Container** | Trivy           | Trivy             | Trivy                    | Trivy              | Trivy            | Trivy               |

#### Fail Thresholds

- **Secrets**: Zero tolerance. Any detection blocks the pipeline.
- **SAST**: Block on HIGH or CRITICAL severity. Warn on MEDIUM.
- **SCA**: Block on known exploited CVEs. Warn on HIGH severity.
  </rule>

## Rule: Immutable Deployments

<rule name="ImmutableDeployments">

> [!NOTE]
> Never deploy code directly to production; use immutable artifacts.

#### Instructions

- **Versioning**: Tag every build with a unique SHA or semantic version. The same artifact goes from staging to production — never rebuild.
- **Zero Downtime**: Use Blue/Green or Canary deployments. Rolling restarts for stateless services.
- **Rollback**: Every deployment must have a documented rollback path that can be executed in under 5 minutes.
- **Environment Parity**: Staging must mirror production as closely as possible (same OS, same runtime, same config shape).
  </rule>

## Rule: Release Strategy

<rule name="ReleaseStrategy">

> [!NOTE]
> Ship frequently, ship safely.

#### Instructions

- **Conventional Commits**: Use `type(scope): message` for automated changelog generation.
- **Semantic Versioning**: MAJOR.MINOR.PATCH — break, feature, fix.
- **Automated Releases**: Use CI to publish on version tags (e.g., `v1.2.3` tag triggers npm publish / Docker push).
- **Feature Flags**: For risky changes, deploy behind a flag. Validate in production with a subset of users, then fully enable.
  </rule>

</ruleset>

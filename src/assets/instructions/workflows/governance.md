# Governance Workflows Reference

Standard checklists for technical governance. Each phase defines the requirements for maintaining a hardened, resilient, and documented codebase.

---

## ⚖️ The Laws of Engineering

All executions within this repository are governed by the **[SDG Constitution](file:///home/thiago/git/sdg-agents/docs/CONSTITUTION.md)**. The following 7 Laws are mandatory execution standards:

1.  **Hardening (Security)**: Security is the baseline. Mandatory configuration contracts and boundary safety.
2.  **Resilience (Fault Tolerance)**: Idempotency is non-negotiable. Defensive design against external failure.
3.  **The Cascade (Scansion)**: Code as narrative. Stepdown Rule: Orchestrators at top, details below.
4.  **Visual Excellence (Aesthetics)**: Rigorous design tokens. Consistent typography as a signal of trust.
5.  **Boundaries (Scope)**: Atomic focus. Includes the **Circuit Breaker** (proactive stop-loss if looping/stalling).
6.  **Reflection (Reasoning)**: Systematic architecture evaluation before any proposal or execution.
7.  **The Writing Soul (Density)**: High signal, zero noise. Technical density and implementation-ready clarity.

---

> [!IMPORTANT]
> **Continuous Documentation**: Update the project's **README/CHANGELOG/ROADMAP** at the transition of _every_ phase. Never allow documentation to lag behind implementation.
>
> **Phase Gate Rule**: Do not start a phase until its dependency phases are complete. Phases are sequential — skipping creates compounding technical debt.

---

## 01 — Foundation

**Depends on:** nothing  
**Goal:** Initialize the project baseline with mandatory linting and configuration standards.

**Deliverables:**

- Git repository initialized with `.gitignore`, `.editorconfig`, and linter configured
- `README.md`, `CHANGELOG.md`, and `ROADMAP.md` created with initial content
- Environment configuration validated on startup (fail-fast for missing vars)
- Hello-world endpoint or entry point running locally
- Core dependencies installed and locked (`package-lock.json`, `poetry.lock`, etc.)

**Done when:** A new developer can clone the repo, run one command, and have the app running.

---

## 02 — Observability & Security

**Depends on:** 01  
**Goal:** Implement boundary-level security and system transparency protocols.

**Deliverables:**

- Input validation applied at every external boundary (Zod, Pydantic, FluentValidation)
- `/health` endpoint returning service status and dependency checks
- Structured JSON logging with `correlationId`, `level`, `timestamp`, `service`
- PII redaction configured in the logging library
- Basic testing strategy defined (which layers get which test types)

**Done when:** A request leaves a trace in the logs with enough context to debug it in production.

---

## 03 — CI/CD Pipeline

**Depends on:** 01, 02  
**Goal:** Automate code validation to ensure standard adherence across the pipeline.

**Deliverables:**

- Pipeline stages: Lint → Security scan → Tests → Build → Deploy(Staging) → Smoke → Deploy(Prod)
- Secrets management configured (no plaintext secrets in env or source)
- Branch protection: no direct pushes to main, all CI checks required before merge
- At least one staging environment that mirrors production config shape
- Rollback procedure documented and tested

**Done when:** A broken commit is automatically blocked before reaching staging.

---

## 04 — Role-Based Access Control

**Depends on:** 01, 02, 03  
**Goal:** Enforce subject identity and authorization boundaries at the system perimeter.

**Deliverables:**

- Identity strategy chosen and implemented (OAuth2, passkeys, magic links, session)
- RBAC model defined: roles, permissions, and enforcement at the boundary (not in domain)
- Token security: short expiry, rotation, revocation strategy
- User CRUD with proper data shielding (no password hashes in responses)
- Auth tested: unauthorized access returns 401/403, not 500

**Done when:** Unauthorized access to any protected resource is impossible by construction.

---

## 05 — Design System & UI/UX

**Depends on:** 01  
**Goal:** Standardize the interface through semantic design tokens and a centralized component library.

**Deliverables:**

- Design preset selected (Bento, Glass, Clean, Mono, etc.) and applied consistently
- Color semantic layers enforced (no raw colors in components)
- L1–L4 spacing hierarchy applied
- Base components wrapped in project-level wrappers (`AppButton`, `AppCard`, etc.)
- All interactive states implemented: Loading, Empty, Error, Disabled
- WCAG AA contrast verified on primary text/background combinations

**Done when:** A new UI feature can be built without making any visual decisions from scratch.

---

## 06 — Feature Evolution

**Depends on:** 01, 02, 03, 04  
**Goal:** Deliver business features following established architectural flavors and domain isolation.

**Deliverables:**

- Each feature follows the chosen flavor pipeline (Vertical Slice, MVC, etc.)
- Use cases are tested at the integration level before shipping
- Feature flags used for risky or large-surface changes, when flagging infrastructure exists
- Domain logic is isolated and unit-tested independently of infrastructure
- CHANGELOG updated with every shipped feature

**Done when:** A new feature can be added, tested, and shipped without touching unrelated code.

---

## 07 — Production Readiness

**Depends on:** 01, 02, 03, 04, 06  
**Goal:** Technical verification of deployment resilience and rollback protocols.

**Deliverables:**

- Pre-deploy checklist completed (migrations tested, secrets verified, smoke tests green)
- Database migrations validated against a production-like dataset
- Zero-downtime deployment strategy implemented (Blue/Green or Canary)
- Rollback path tested and documented (execution time < 5 minutes)
- All critical user flows covered by E2E smoke tests in staging

**Done when:** A production deployment can be executed and rolled back without manual intervention.

---

## 08 — Operational Governance

**Depends on:** 07  
**Goal:** Continuous monitoring and incident response following defined technical playbooks.

**Deliverables:**

- RED metrics (Rate, Errors, Duration) tracked for all external-facing endpoints
- Alerting configured for error rate spikes (threshold-based, not per-error)
- Incident response playbooks defined (Data Breach, Intrusion, RCA template)
- Post-deploy monitoring window: 30 minutes observation after every production release
- **Engineering Insights**: synchronize lessons learned and curate stale items in `context.md`
- CHANGELOG, README, and ROADMAP synchronized after each release cycle

**Done when:** An on-call engineer can diagnose and respond to any incident using only dashboards and playbooks — no tribal knowledge required.

# Security — AppSec Tactics & DevSecOps Pipeline

<ruleset name="Security">

> [!NOTE]
> Unified security skill: tactical AppSec rules + end-to-end DevSecOps lifecycle.
> Load in **Phase CODE** when writing security-sensitive code, and in **Phase TEST / CI** when validating pipeline gates.

---

## Part 1 — Tactical AppSec (Secure Coding)

> [!NOTE]
> The **how-to** of secure coding. Every layer must validate its own assumptions.

### Rule: The Law of Hardening (AppSec Implementation)

<rule name="OperationalAppSec">

> [!IMPORTANT]
> **Defense in Depth.** Every layer must validate its own assumptions.

#### Instructions

- **Input Sanitization:** Sanitize all external inputs (body, query, headers) using trusted libraries (e.g., Zod, Joi, Pydantic). Reject invalid data early.
- **Injection Prevention:** 100% Parameterization for SQL. Escape and sanitize HTML outputs to prevent XSS. No raw string concatenation for shell or DB commands.
- **Data Shielding (PII):** Mask sensitive fields in logs and responses. Never return full emails, IDs, or PHONES except for authorized admin scopes.
- **Prohibit Config Templates:** Never commit `.env.example` or any `.env.*` template files. These disclose infrastructure metadata and service architecture.
- **Abstract Env Naming:** Use domain-abstract keys for environment variables (e.g., `PAYMENT_SECRET` instead of `STRIPE_SK`). This reduces information disclosure in logs and error messages.
- **No Unsafe APIs:** Prohibit `eval()`, `dangerouslySetInnerHTML`, and insecure deserialization.
  </rule>

### Rule: Identity & Access Integrity

<rule name="IdentityIntegrity">

> [!CAUTION]
> **Identity is non-negotiable.** Every action must be traced to a verified subject.

#### Instructions

- **Deny-by-Default:** No route or field is public unless documented.
- **Least Privilege:** API tokens and user roles must only have the minimum permissions needed to complete the task.
- **RBAC Enforcement:** Check permissions at the boundary (Controller/UseCase). Do not leak permission logic into the business logic.
  </rule>

---

## Part 2 — DevSecOps Pipeline (Staff Lifecycle)

> [!NOTE]
> End-to-End Security Governance. Automated and data-driven — minimizing manual error.

### Mandatory Principles (Enforced)

> [!CAUTION]
> **FAIL CLOSED POLICY**: If any security gate fails, the pipeline MUST block the promotion of the artifact.

#### Mandatory Policies

- **Secure by Default (Deny-All)**: No implicit trust.
- **Least Privilege**: Scope everything to the absolute minimum required.
- **Zero Trust**: Validate every request, every time, even internally.
- **Everything is Auditable**: If it's not logged, it didn't happen.

---

### Phase 0: Threat Modeling (Pre-Execution)

<rule name="ThreatModeling">

> [!IMPORTANT]
> Identification of risks BEFORE a single line of code is written. Mandatory for features classified as "Critical" (Auth, Payment, Data Shielding).

#### Process

1. **Map**: Attack surfaces and data flows.
2. **Classify**: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege).
3. **Output**: Versioned threat model and mitigation checklist per endpoint.

#### Fail Closed if:

- Critical feature without documented threat modeling.
  </rule>

---

### Phase 1: Pre-Commit (Local Shielding)

<rule name="PreCommitShielding">

> [!IMPORTANT]
> Prevent vulnerabilities from entering the version control system (Git).

#### Required Checks

- **Secret Scanning**: Detect hardcoded tokens, keys, and credentials (e.g., Gitleaks).
- **Security Lint**: Domain-specific security rules (No `eval`, no `innerHTML`).
- **Sensitive File Block**: Block `.env`, `.env.*`, `.pem`, and private key files from being committed. Implement with a pre-commit hook:

```yaml
# lefthook.yml — recommended (language-agnostic, zero dependencies)
pre-commit:
  commands:
    block-env-files:
      glob: "**/{.env,.env.*,*.pem,*.key}"
      run: echo "❌ Sensitive file blocked: {staged_files}" && exit 1
```

```sh
# .husky/pre-commit — alternative for projects already using Husky
if git diff --cached --name-only | grep -qE '(^|/)\.env(\.|$)|\.pem$|\.key$'; then
  echo "❌ Sensitive file blocked. Remove it from staging and add to .gitignore."
  exit 1
fi
```

- **Typosquatting Detection**: Verify package origins and names.

#### Fail Closed if:

- Any secret is detected or insecure API usage is found.
  </rule>

---

### Phase 2: CI — SAST + Policy as Code

<rule name="SastPolicyEnforcement">

> [!NOTE]
> Deep code analysis and architectural policy validation during the build process.

#### SAST (Deep Scan)

- SQL Injection, XSS, SSRF, Command Injection.
- Insecure deserialization.

#### Policy as Code (Enforced)

- CORS must NOT be `*`.
- JWT must have a short expiration period.
- Prohibit unsafe functions (`eval`, `innerHTML`).
- Custom domain rules (Architectural alignment).

#### Fail Closed if:

- Vulnerability classified as **HIGH+** or any policy violation is detected.
  </rule>

---

### Phase 3: Dependency & Supply Chain Security

<rule name="SupplyChainSecurity">

> [!IMPORTANT]
> Protecting the codebase from vulnerabilities introduced by external packages (SCA).

#### SCA (Software Composition Analysis)

- Detect CVEs and abandoned libraries.
- License compliance check.

#### Supply Chain (Staff-Level)

- **SBOM (Software Bill of Materials)**: Mandatory generation and attachment to artifacts.
- **Provenance Verification**: Verify package origins (Sigstore/Cosign).
- **Reproducible Builds**: Guarantee build integrity and isolation.

#### Fail Closed if:

- Package without a trusted signature or critical CVE is present.
  </rule>

---

### Phase 4: CI/CD — Runtime Testing (DAST & Fuzzing)

<rule name="RuntimeSecurity">

> [!IMPORTANT]
> Validating actual system behavior under realistic conditions (DAST).
> Apply the Testing skill rules — TestDoubles, FlakyTestManagement, and Arrange-Act-Assert structure — to all security test implementations. See `.ai/skill/testing.md`.

#### Mandatory Functional Checks

- AuthN/AuthZ: Proper access control enforcement.
- Rate Limiting: Active and blocking abusive patterns.
- Security Headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options.

#### DAST & Fuzzing

- Dynamic scan with the application running.
- Fuzzing: Random inputs to break parser or validation logic.
- Exploit Simulation: Real exploration attempts in a sandbox.

#### Business Logic Security

- Protect against abuse of flow and race conditions (e.g., double spend).
  </rule>

---

### Phase 5: Result & Incident Response

<rule name="ObservabilityIR">

> [!NOTE]
> Continuous visibility and reactive protocols for detected anomalies.

#### SIEM & Logging

- Log logins, logouts, authorization failures, and sensitive actions.
- **Rule**: NEVER log secrets or PII.

#### Incident Response Playbooks

- **Data Breach**: Revoke ALL tokens/keys immediately. Notify affected parties per compliance requirements.
- **Intrusion**: Isolate the affected system. Preserve forensic evidence before remediation.
- **RCA (Root Cause Analysis)**: Compulsory for all security incidents. Document timeline, impact, and prevention measures.

#### Escalation Protocol

1. **Detect**: Automated alerting triggers (error rate spike, unauthorized access pattern).
2. **Triage**: Classify severity (P0-Critical, P1-High, P2-Medium, P3-Low).
3. **Respond**: Execute the matching playbook. Communicate in the designated war room.
4. **Resolve**: Fix forward (small) or rollback (large). Document the decision.
5. **Review**: Post-incident retrospective within 48 hours.

#### Backup & Disaster Recovery

- Encrypted and Air-Gapped backups.
- Defined **RTO** (Recovery Time Objective) and **RPO** (Recovery Point Objective).
- Test recovery procedures quarterly.
  </rule>

</ruleset>

---

> [!TIP]
> **Staff Goal**: A feature is only "Done" when it passes all phases of this lifecycle with zero HIGH+ warnings.

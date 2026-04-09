# Security Pipeline — The Staff Lifecycle

<ruleset name="SecurityLifecycle">

> [!NOTE]
> This pipeline defines the **End-to-End Security Governance** for any project using the Spec Driven Guide. It is designed to be automated and data-driven, minimizing **manual error**.

## Mandatory Principles (Enforced)

> [!CAUTION]
> **FAIL CLOSED POLICY**: If any security gate fails, the pipeline MUST block the promotion of the artifact.

### Mandatory Policies

- **Secure by Default (Deny-All)**: No implicit trust.
- **Least Privilege**: Scope everything to the absolute minimum required.
- **Zero Trust**: Validate every request, every time, even internally.
- **Everything is Auditable**: If it's not logged, it didn't happen.

---

## Phase 0: Threat Modeling (Pre-Execution)

### Rule: Threat Modeling

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

## Phase 1: Pre-Commit (Local Shielding)

### Rule: Pre-Commit Shielding

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

## Phase 2: CI — SAST + Policy as Code

### Rule: SAST & Policy Enforcement

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

## Phase 3: Dependency & Supply Chain Security

### Rule: Supply Chain Shielding

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

## Phase 4: CI/CD — Runtime Testing (DAST & Fuzzing)

### Rule: Runtime Security Validation

<rule name="RuntimeSecurity">

> [!IMPORTANT]
> Validating actual system behavior under realistic conditions (DAST).
> Apply [Testing Principles](.ai/instructions/core/testing-principles.md) rules — TestDoubles, FlakyTestManagement, and Arrange-Act-Assert structure — to all security test implementations.

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

## Phase 5: Result & Incident Response

### Rule: Observability & IR

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

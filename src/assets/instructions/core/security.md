# Global Security Strategy — Tactical Application Security (AppSec)

<ruleset name="GlobalSecurityTactical">

> [!NOTE]
> This ruleset defines the **how-to** of secure coding. It is the tactical companion to the Governance Strategy.

## Rule: The Law of Hardening (AppSec Implementation)

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

## Rule: Identity & Access Integrity

<rule name="IdentityIntegrity">

> [!CAUTION]
> **Identity is non-negotiable.** Every action must be traced to a verified subject.

#### Instructions

- **Deny-by-Default:** No route or field is public unless documented.
- **Least Privilege:** API tokens and user roles must only have the minimum permissions needed to complete the task.
- **RBAC Enforcement:** Check permissions at the boundary (Controller/UseCase). Do not leak permission logic into the business logic.
  </rule>

---

#### 📌 Related Reference

- **Governance**: Refer to the [Security Pipeline Manual](./security-pipeline.md) for full DevSecOps process details (Threat Modeling, SAST, DAST).

</ruleset>

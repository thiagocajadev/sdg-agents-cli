# Cloud Infrastructure Principles

<ruleset name="Cloud Architecture Standards">

> [!NOTE]
> Universal rules for managed and serverless cloud services.

## Rule: Managed Services (PaaS/SaaS)

<rule name="ManagedServices">

> [!IMPORTANT]
> Prefer managed solutions (AWS RDS, Vercel, Azure SQL) over self-hosting on raw VMs.

#### Instructions

- **Scalability:** Leverage auto-scaling provided by the platform.
- **Maintenance:** Reduce operational overhead by using serverless functions and managed databases.
  </rule>

## Rule: Least Privilege (IAM)

<rule name="LeastPrivilege">

> [!IMPORTANT]
> Restrict service accounts and roles to the absolute minimum required permission set.

#### Instructions

- **Isolation:** Each environment (Production, Staging, Dev) must have separate accounts and IAM roles. Never share state or credentials across environments.
- **Secrets Management:** Use AWS Secrets Manager, GCP Secret Manager, or Vault. Never pass secrets via plaintext environment variables or commit them to source control.
  </rule>

## Rule: Configuration Fail-Fast

<rule name="ConfigFailFast">

> [!IMPORTANT]
> Applies **Law 1 (Hardening)** to infrastructure. If the environment is incomplete, crash immediately with a clear error — never limp forward with missing config.

#### Instructions

- **Validate on startup:** Check all required environment variables before the application serves any traffic. If any are missing, exit with a descriptive error listing the missing keys.
- **No silent defaults for secrets:** Values like `DATABASE_URL`, `JWT_SECRET`, or API keys must never fall back to a default. An empty secret is a security incident waiting to happen.
- **Config schema:** Define and validate the config shape at boot (e.g., Zod, Pydantic, envy) so misconfiguration is caught at deploy time, not at runtime under load.
  </rule>

## Rule: Cloud Observability

<rule name="CloudObservability">

> [!NOTE]
> Every cloud service must be observable. If you can't see it, you can't operate it.
> For structured logging and tracing implementation, see [Observability](.ai/instructions/core/observability.md).

#### Instructions

- **Health endpoint:** Every service exposes `/health` returning dependency status and uptime. Platform load balancers use this to route traffic — a missing health check means blind deployments.
- **RED metrics:** Track Rate, Errors, and Duration for every external-facing endpoint.
- **Centralized logs:** Ship structured logs to a central sink (CloudWatch, Datadog, GCP Logging). Never rely on local disk logs in a cloud environment — containers are ephemeral.
  </rule>

</ruleset>

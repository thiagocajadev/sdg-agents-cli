# Cloud & Containers — Infrastructure Standards

<ruleset name="Cloud & Container Standards">

> [!NOTE]
> Universal rules for managed cloud services and containerized environments.
> Load in **Phase CODE** when touching Dockerfile, compose/Kubernetes manifests, IAM, or cloud config.

---

## Part 1 — Cloud Architecture

### Rule: Managed Services (PaaS/SaaS)

<rule name="ManagedServices">

> [!IMPORTANT]
> Prefer managed solutions (AWS RDS, Vercel, Azure SQL) over self-hosting on raw VMs.

#### Instructions

- **Scalability:** Leverage auto-scaling provided by the platform.
- **Maintenance:** Reduce operational overhead by using serverless functions and managed databases.
  </rule>

### Rule: Least Privilege (IAM)

<rule name="LeastPrivilege">

> [!IMPORTANT]
> Restrict service accounts and roles to the absolute minimum required permission set.

#### Instructions

- **Isolation:** Each environment (Production, Staging, Dev) must have separate accounts and IAM roles. Never share state or credentials across environments.
- **Secrets Management:** Use AWS Secrets Manager, GCP Secret Manager, or Vault. Never pass secrets via plaintext environment variables or commit them to source control.
  </rule>

### Rule: Configuration Fail-Fast

<rule name="ConfigFailFast">

> [!IMPORTANT]
> Applies **Law 1 (Hardening)** to infrastructure. If the environment is incomplete, crash immediately with a clear error — never limp forward with missing config.

#### Instructions

- **Validate on startup:** Check all required environment variables before the application serves any traffic. If any are missing, exit with a descriptive error listing the missing keys.
- **No silent defaults for secrets:** Values like `DATABASE_URL`, `JWT_SECRET`, or API keys must never fall back to a default. An empty secret is a security incident waiting to happen.
- **Config schema:** Define and validate the config shape at boot (e.g., Zod, Pydantic, envy) so misconfiguration is caught at deploy time, not at runtime under load.
  </rule>

### Rule: Cloud Observability

<rule name="CloudObservability">

> [!NOTE]
> Every cloud service must be observable. If you can't see it, you can't operate it.
> For structured logging and tracing implementation, see `.ai/skill/observability.md`.

#### Instructions

- **Health endpoint:** Every service exposes `/health` returning dependency status and uptime. Platform load balancers use this to route traffic — a missing health check means blind deployments.
- **RED metrics:** Track Rate, Errors, and Duration for every external-facing endpoint.
- **Centralized logs:** Ship structured logs to a central sink (CloudWatch, Datadog, GCP Logging). Never rely on local disk logs in a cloud environment — containers are ephemeral.
  </rule>

---

## Part 2 — Container Standards

### Rule: Multi-Stage Builds

<rule name="MultiStageBuilds">

> [!IMPORTANT]
> Keep your images small and fast by separating the build environment from the production runtime.

#### Instructions

- **Base Image:** Use slim versions (Alpine or Distroless) for the final runtime image.
- **Optimization:** Run `npm install` or `dotnet build` in a separate stage to avoid bloating the final artifact.

#### ✅ Good Example

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
```

</rule>

### Rule: Security & User Privileges

<rule name="SecurityPrivileges">

> [!IMPORTANT]
> Never run containers as 'root'. Use a dedicated user.

#### Instructions

- **USER Instruction:** Add `USER node` (or `USER app`) before the CMD.
- **Read-Only:** Mount volumes as read-only whenever possible.
  </rule>

### Rule: Health Checks

<rule name="ContainerHealthCheck">

> [!IMPORTANT]
> Every container must declare a `HEALTHCHECK`. Orchestrators (Docker Swarm, Kubernetes) use this to route traffic and restart unhealthy replicas.

#### Instructions

- **Dockerfile HEALTHCHECK:** Point to the `/health` endpoint of the service.
- **Interval:** Check every 30s with a 10s timeout and 3 retries before marking unhealthy.

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

- **Start period:** Allow sufficient warm-up time (`--start-period`) for services that need to connect to the database before being ready.
  </rule>

### Rule: Environment Variable Injection

<rule name="EnvVarInjection">

> [!NOTE]
> Never bake secrets or environment-specific values into the image. Images must be environment-agnostic.

#### Instructions

- **`ENV` vs `ARG`:** Use `ARG` for build-time values (e.g., Node version, build number). Use runtime env vars (injected via `docker run -e` or orchestrator secrets) for config and secrets — never `ENV` for secrets.
- **No defaults for secrets:** Do not set default values for `DATABASE_URL`, `JWT_SECRET`, or API keys in the Dockerfile. Fail fast if they are missing at startup (see `ConfigFailFast` rule above).
- **`.env` files:** For local development only, loaded via `docker-compose`. Never ship `.env` files inside an image.
  </rule>

### Rule: Resource Limits

<rule name="ResourceLimits">

> [!CAUTION]
> A container without resource limits can starve the host and take down all co-located services.

#### Instructions

- **Always set limits** for memory and CPU in production deployments (docker-compose, Kubernetes manifests, ECS task definitions).
- **Start conservative:** Begin with limits below the observed peak and tune upward with data.

```yaml
# docker-compose example
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: '0.5'
        reservations:
          memory: 256m
          cpus: '0.25'
```

- **OOMKilled is a signal:** If a container is killed for exceeding memory, increase the limit or investigate the memory leak — do not silently restart.
  </rule>

</ruleset>

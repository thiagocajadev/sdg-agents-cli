# Container Architecture & Docker Standards

<ruleset name="Container Standards">

> [!NOTE]
> Universal rules for containerized environments.

## Rule: Multi-Stage Builds

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

## Rule: Security & User Privileges

<rule name="SecurityPrivileges">

> [!IMPORTANT]
> Never run containers as 'root'. Use a dedicated user.

#### Instructions

- **USER Instruction:** Add `USER node` (or `USER app`) before the CMD.
- **Read-Only:** Mount volumes as read-only whenever possible.
  </rule>

## Rule: Health Checks

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

## Rule: Environment Variable Injection

<rule name="EnvVarInjection">

> [!NOTE]
> Never bake secrets or environment-specific values into the image. Images must be environment-agnostic.

#### Instructions

- **`ENV` vs `ARG`:** Use `ARG` for build-time values (e.g., Node version, build number). Use runtime env vars (injected via `docker run -e` or orchestrator secrets) for config and secrets — never `ENV` for secrets.
- **No defaults for secrets:** Do not set default values for `DATABASE_URL`, `JWT_SECRET`, or API keys in the Dockerfile. Fail fast if they are missing at startup (see [Cloud Config Fail-Fast](./cloud.md)).
- **`.env` files:** For local development only, loaded via `docker-compose`. Never ship `.env` files inside an image.
  </rule>

## Rule: Resource Limits

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

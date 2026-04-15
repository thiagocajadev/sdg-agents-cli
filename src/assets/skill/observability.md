# Observability — Logging, Tracing & Monitoring

<ruleset name="Observability Engineering">

> [!NOTE]
> Universal observability principles and stack-specific implementation guidance.
> Load in **Phase CODE** when adding logging, tracing, metrics, or health checks.
> Related skills: `.ai/skill/staff-dna.md`, `.ai/skill/code-style.md`, `.ai/skill/security.md`.

## Rule: Universal Observability Principles

<rule name="ObservabilityPrinciples">

> [!IMPORTANT]
> Observability is not optional. If you can't see it, you can't fix it.

#### Instructions

- **Structured Logging**: Always use JSON-structured logs with consistent fields: `timestamp`, `level`, `message`, `correlationId`, `service`.
- **Correlation IDs**: Every request must carry a unique trace ID propagated across all service boundaries.
- **Log Levels**: Use semantic levels consistently — `DEBUG` for development, `INFO` for business events, `WARN` for degraded states, `ERROR` for failures requiring attention.
- **Never Log Secrets**: Redact passwords, tokens, PII, and API keys. Use allowlists over denylists.
- **Health Checks**: Every service must expose a `/health` endpoint returning dependency status and uptime.
- **Metrics**: Track the RED method (Rate, Errors, Duration) for every external-facing endpoint.
  </rule>

## Rule: Structured Logging per Stack

<rule name="StructuredLogging">

> [!IMPORTANT]
> Choose the idiomatic logging library for your stack. Never use `console.log` or `print` in production.

#### Instructions

- **Node.js (Pino)**: Configure Pino with a global `redact` array masking `['*.password', '*.token', '*.secret']`. Use Fastify's native `request.log.info(...)` which automatically injects the Request ID.
- **.NET (Serilog)**: Enrich logs with `CorrelationId`, `MachineName`, and `EnvironmentName`. Inject `ILogger<T>` and use structural logging: `_logger.LogInformation("Order created. {@OrderSummary}", new { orderId })`.
- **Python (structlog)**: Use `structlog` with `JSONRenderer` for production. Bind context per request: `log = structlog.get_logger().bind(request_id=request_id)`.
- **Go (slog / zerolog)**: Use `slog` (stdlib, Go 1.21+) or `zerolog` for structured JSON output. Pass `context.Context` to propagate trace IDs.
- **Java (SLF4J + Logback)**: Use MDC (Mapped Diagnostic Context) for correlation IDs. Configure JSON encoder (`logstash-logback-encoder`) for structured output.
- **Rust (tracing)**: Use the `tracing` crate with `tracing-subscriber` and `tracing-opentelemetry` for structured spans and JSON output.
  </rule>

## Rule: Distributed Tracing (OpenTelemetry)

<rule name="OpenTelemetry">

> [!NOTE]
> OpenTelemetry is the industry standard for propagating traces across microservices.

#### Instructions

- **Node.js**: Load the OTEL SDK (`@opentelemetry/sdk-node`) as the VERY FIRST import in the main entrypoint: `import './infra/otel.js';`
- **.NET**: Use `builder.Services.AddOpenTelemetry().WithTracing(...)` and `AddAspNetCoreInstrumentation()`.
- **Python**: Use `opentelemetry-instrumentation-fastapi` or `opentelemetry-instrumentation-django`. Initialize before app creation.
- **Go**: Use `go.opentelemetry.io/otel` with `otlptrace` exporter. Propagate `context.Context` through all function calls.
- **Java**: Use `opentelemetry-javaagent` for auto-instrumentation or `opentelemetry-api` + `opentelemetry-sdk` for manual spans.
- **Rust**: Use `opentelemetry` crate with `opentelemetry-otlp` exporter and `tracing-opentelemetry` bridge.
  </rule>

## Rule: Error Tracking

<rule name="ErrorTracking">

> [!IMPORTANT]
> Capture unhandled exceptions while respecting privacy.

#### Instructions

- **PII Scrubbing**: Ensure PII is never sent to error tracking services. Hardcode `sendDefaultPii: false` (Sentry) or equivalent in configuration.
- **Context Binding**: Attach the `correlationId`/`traceId` to every captured exception for cross-referencing with logs.
- **Alerting**: Configure alerts for error rate spikes, not individual errors. Use thresholds (e.g., >1% error rate in 5 minutes).
  </rule>

</ruleset>

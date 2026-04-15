# API Design — Consistency, Resilience, and Contracts

<ruleset name="Universal API Design Standard">

> [!NOTE]
> APIs represent the contract between logic and consumer. They must be predictable, resilient, and hardened.
> Load in **Phase CODE** when designing endpoints, response envelopes, or API contracts.

## Rule: API Contract Resilience

<rule name="APIContractResilience">

> [!IMPORTANT]
> Business failures are first-class values in the API response. Applies **Law 2 (Resilience)** at the contract layer.

#### Instructions

- **Standard Envelope:** Every API response uses `{ success, data, error, meta: { action? } }`. See the Backend Competency for the full envelope spec with TypeScript examples, the `meta.action` directive, and HTTP error code mapping. <!-- TBD: .ai/skill/backend.md -->
- **Typed Error Payloads:** Error codes are explicit string constants (e.g., `NOT_FOUND`, `INVALID_INPUT`). Never return free-form error messages that the consumer must parse. For HTTP 409 specifically: use `CONFLICT` for unique constraint violations (duplicate email, concurrent edit) and `BUSINESS_RULE_VIOLATION` for domain rule violations (cannot cancel a shipped order). See the Backend Competency for the full error code table. <!-- TBD: .ai/skill/backend.md -->
- **Idempotency:** Require and enforce Idempotency-Key headers for all non-safe operations (POST/PUT/PATCH) that have financial or inventory side effects.
  </rule>

## Rule: API Data Masking

<rule name="APIDataMasking">

> [!CAUTION]
> Never expose internal models. Strictly enforce ViewModels/DTOs. Applies **Law 1 (Hardening)** at the response layer.

#### Instructions

- **Zero Leakage:** Internal IDs (autoincrement), DB metadata, or framework-specific stack traces must NEVER appear in the envelope. Primary keys exposed to the client should be UUIDs or ULIDs.
- **Explicit Projection:** Only return the fields requested by the contract — enforced via the `OutputFilter` (Response DTO) rule in the Backend Competency. No raw entities, no over-fetching of sensitive fields (`passwordHash`, `internalMetadata`). <!-- TBD: .ai/skill/backend.md -->
- **HTTP/S Only:** Enforce secure-only transport layers.
  </rule>

## Rule: REST Endpoint Hierarchy

<rule name="RESTEndpointHierarchy">

> [!NOTE]
> RESTful paths should read as a hierarchy of intent. Applies **NarrativeCascade** at the API surface.

#### Instructions

- **Resource-Oriented:** Organize endpoints around Nouns, not Verbs (e.g., `POST /orders` instead of `POST /create-order`).
- **Sub-Resource Hierarchy:** Use deep paths for context (e.g., `/users/{id}/orders`).
- **Statelessness:** No session affinity should be required for a single request.
  </rule>

## Rule: Standardization Protocols

<rule name="APIStandardization">

> [!IMPORTANT]
> Consistency is the soul of a clean API ecosystem.

#### Instructions

- **Naming:** CamelCase for JSON keys; kebab-case for headers and paths.
- **Pagination:** Mandatory for all collection endpoints. Cursor-based by default; offset only for bounded admin/backoffice UIs. See the Backend Competency for the canonical shapes. <!-- TBD: .ai/skill/backend.md -->
- **Versioning:** Strictly via path prefix (e.g., `/v1/...`) to prevent breaking consumer integration.
- **HTTP Status Codes:** Use semantic ranges (2xx for success, 4xx for consumer errors, 5xx for system failures).
  </rule>

</ruleset>

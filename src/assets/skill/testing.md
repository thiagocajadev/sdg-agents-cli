# Testing — Quality without Overengineering

<ruleset name="Testing Governance">

> [!NOTE]
> Universal rules for writing tests and preventing test suites from becoming a maintenance nightmare.
> Load in **Phase CODE / Phase TEST** when writing, reviewing, or refactoring tests.

## Rule: Testing Strategy (The Testing Diamond)

<rule name="TestingStrategy">

> [!IMPORTANT]
> Choose the right test type for the right layer. Not everything needs a unit test.

#### Instructions

- **Unit Tests**: For pure business logic, domain rules, validators, and mappers. Fast, isolated, no I/O.
- **Integration Tests**: For use cases, repositories, and API endpoints. Hit the real database or service. These catch the bugs that matter most.
- **E2E Tests**: For critical user flows only (login, checkout, onboarding). Expensive to maintain — keep the count low.
- **Contract Tests**: For API boundaries between services. Verify that producers and consumers agree on the shape.
- **Security Tests**: DAST, fuzzing, and exploit simulation are part of the pipeline — not optional. See the [Security skill](.ai/skill/security.md) Phase 4 for runtime security validation rules.

#### Guidance

- Prioritize integration tests over unit tests for orchestration layers (UseCases, Services).
- Unit test domain logic exhaustively — this is where business rules live.
- E2E tests should cover the "golden path" plus 2-3 critical failure scenarios, no more.
  </rule>

## Rule: Test Naming Convention

<rule name="TestNamingConvention">

> [!IMPORTANT]
> Test names must accurately describe the exact behavior being tested, functioning as executable documentation.

#### Instructions

- **Format:** `[MethodUnderTest]_[Scenario]_[ExpectedResult]`
- Test names must ALWAYS be in English, even if the primary language of the developers is not.
- Focus heavily on describing the behavior, not the low-level implementation.

#### ❌ Bad Example

```javascript
HandleAsync_Test1;
Test_Login_Fail;
```

#### ✅ Good Example — C# / Java (xUnit, JUnit)

```javascript
HandleAsync_WithNonExistentUser_ShouldReturnNotFound;
ValidateCredentials_WithInvalidPassword_ShouldReturnUnauthorized;
```

#### ✅ Good Example — JavaScript / TypeScript (Jest, Vitest)

In dynamic languages, prefer natural-language sentences inside `describe/it` blocks over underscore-separated identifiers.

```javascript
describe('ValidateCredentials', () => {
  it('should return unauthorized when password is invalid', async () => { ... })
  it('should return not found when user does not exist', async () => { ... })
})
```

</rule>

## Rule: Test Structure (Arrange-Act-Assert)

<rule name="TestStructure">

> [!NOTE]
> Every test follows the same 3-phase structure. No exceptions.

#### Instructions

- **Arrange**: Set up the test data and dependencies. Use factories or builders, not raw constructors.
- **Act**: Execute exactly ONE action — the method under test.
- **Assert**: Verify ONE behavior per test. Multiple assertions are acceptable only if they verify the same logical outcome.
- **Isolation**: Tests must not depend on execution order or shared mutable state.
- **Meta-Comments**: Do NOT use `// Arrange`, `// Act`, or `// Assert` comments. Use **Vertical Scansion** (blank lines) to separate phases. The code must be narrative enough to be self-documenting.
  </rule>

## Rule: Named Expectations

<rule name="NamedExpectations">

> [!IMPORTANT]
> **Non-Negotiable Staff Rule: Avoid magic strings and literal values in assertions.**
> Always explicitly define the input data and the expected result in named constants (`const input = ...`, `const expected = ...`).
> This mirrors the "Explaining Variables" pattern and makes the test's intent clear at a glance.

#### Instructions

- Tests should clearly show the transformation (or lack thereof) through variable naming.
- For tests where the input should not change, use `const expected = input`.
- Do NOT pass literal strings or objects directly into assertion functions.
- Every `it` block must follow the **triad**: `input` -> `actual` -> `expected`.
- **Descriptive Naming**: If multiple inputs or outputs are required, do NOT use numbered variables (e.g., `input1`, `input2`, `actual1`). Use descriptive names (e.g., `inputFix`, `inputFeature`).
- **Transformation Scansion**: If the result of a method (`actualRaw`) needs formatting or refinement before the assertion, define both explicitly to separate the "computation" from the "presentation" check.
  - `actualRaw`: The direct, unformatted return value.
  - `actual`: The refined/plucked value used for the final comparison.
  - This preserves the `actual` -> `expected` visual alignment in the assertion.

#### ❌ Bad Example

```javascript
it('should remove H1 heading', () => {
  const result = sanitize('# Title\nBody');
  assert.strictEqual(result, 'Body'); // Magic string in act and assert
});
```

#### ✅ Good Example (The Staff Standard)

```javascript
it('should remove H1 heading', () => {
  const input = '# Title\nBody';
  const expected = 'Body';

  const actual = sanitize(input);

  assert.strictEqual(actual, expected);
});
```

#### AI Agent Self-Audit

Before proposing test code, verify:

- [ ] Are there any literal values inside `assert.equal` or `assert.deepEqual`? (If yes, move to `const expected`).
- [ ] Is the method under test being called with a magic string? (If yes, move to `const input`).
- [ ] Does the test follow the **triad pattern** (`input` -> `actual` -> `expected`) without redundant meta-comments (`// Arrange`, etc.)?
- [ ] Are all variables descriptively named? (No `input1`, `input2`, etc.)
- [ ] Is **Vertical Scansion** used to separate logic phases?

</rule>

## Rule: What NOT to Test

<rule name="WhatNotToTest">

> [!NOTE]
> Testing boilerplate or third-party logic generates noise and brittle tests.

#### Instructions

- **Do NOT test:** Automatically generated DB Migrations.
- **Do NOT test:** Simple DTO mapping factories (`Response.From(entity)`) that contain zero conditional logic.
- **Do NOT test:** Dependency Injection container registration. Test behavior, not the DI generic setup.
- **Do NOT test:** Third-party framework code (e.g., asserting that EF Core saves to a DB).
- **Do NOT test:** Getters, setters, or trivial constructors with no logic.
  </rule>

## Rule: Test Doubles — When to Mock, When Not To

<rule name="TestDoubles">

> [!CAUTION]
> **Mocks are a tool, not a default. Overuse of mocks hides integration bugs. AI Agents MUST follow the Anti-Mock Architecture.**

#### Instructions

- **Mock**: External services (payment gateways, email providers, third-party APIs). You don't control them.
- **Anti-Mock Architecture**: You MUST NOT blindly mock internal modules (e.g. `jest.mock(...)` on internal files) just to make a unit test pass. Tests full of internal mocks prove nothing and create a maintenance nightmare.
- **Don't Mock**: Your own database in integration tests. Use a real test database (Testcontainers, Docker, or in-memory test schema).
- **Don't Mock**: The class under test. If you need to mock parts of the class, the class has too many responsibilities — refactor.
- **Stubs over Mocks**: Prefer stubs (return fixed data) over mocks (verify calls). Test behavior, not implementation.
  </rule>

## Rule: Flaky Test Management

<rule name="FlakyTestManagement">

> [!CAUTION]
> A flaky test is worse than no test — it erodes trust in the entire suite.

#### Instructions

- **Quarantine immediately**: If a test fails intermittently, move it to a `@flaky` tag or skip file. Do not let it block CI.
- **Fix or delete within 1 sprint**: Quarantined tests that aren't fixed get deleted. Dead tests are noise.
- **Common causes**: Shared state, time-dependent logic, network calls, race conditions, non-deterministic ordering.
- **Prevention**: Use deterministic test data, freeze time in tests (`jest.useFakeTimers`, `freezegun`), avoid `sleep`/`setTimeout` in assertions.
  </rule>

## Rule: Coverage as a Signal, Not a Target

<rule name="CoverageStrategy">

> [!NOTE]
> High coverage with bad tests is worse than moderate coverage with meaningful tests.

#### Instructions

- **Domain layer**: Aim for 90%+ coverage — this is where bugs cost the most.
- **Orchestration layer**: 70-80% coverage via integration tests. Don't unit-test the glue.
- **UI layer**: Focus on component behavior tests, not snapshot tests. Snapshots break on every style change.
- **Never chase 100%**: Diminishing returns kick in fast. Focus on critical paths and edge cases.
  </rule>

## Rule: Test Data & Environments

<rule name="TestDataEnvironments">

#### Instructions

- Use realistic test data — avoid trivial strings like `"test"` or `"foo"` in domain-critical tests
- Isolate environments: dev / stage / prod must never share state
- Never use production data in development or tests — use anonymized or synthetic datasets
- Environment-specific config via `.env.{environment}` or equivalent; never hardcode environment assumptions in test code
  </rule>

## Rule: Legacy Approach (Refactoring without Tests)

<rule name="LegacyApproach">

> [!NOTE]
> Never rewrite or touch legacy logic without a safety net.

#### Instructions

- ALWAYS write Characterization Tests first to lock the current behavior (even if it's currently buggy), then refactor.
- Identify the Seam (extracting an interface) to isolate the legacy component before adding unit tests.
- Use the Strangler Fig pattern: wrap legacy code, test the wrapper, then gradually replace internals.
  </rule>

</ruleset>

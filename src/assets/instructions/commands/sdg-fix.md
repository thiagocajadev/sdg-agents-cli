# Incident Correction — Context Preparation

We are correcting a recorded incident: $ARGUMENTS. This command prepares the context for the **Fix Cycle** defined in the **Working Protocol**.

## Step 0 — Incident Analysis

1. **Reproduction Scenario**: Read existing logs or provided data to define the exact steps to reproduce the issue.
2. **Domain Scope**:
   - **Backend** (Logic/Data) → read `.ai/instructions/competencies/backend.md`
   - **Frontend** (UI/UX) → read `.ai/instructions/competencies/frontend.md`
   - **Fullstack** → read both
3. **Architecture Standards**: If `.ai/instructions/flavor/principles.md` exists, read the architectural principles.
4. **Code Style & Standards** (mandatory):
   - **Engineering Standards** → read `.ai/instructions/core/engineering-standards.md`
   - **Code Style & Narrative Scansion** → read `.ai/instructions/core/code-style.md`
5. **Diagnostic Standards**:
   - **Testing Principles** → read `.ai/instructions/core/testing-principles.md`
   - **Observability** → read `.ai/instructions/core/observability.md`

---

## Phase: SPEC (Fix Specialization)

Follow the **Phase: SPEC** from the **Working Protocol**, with these mandatory additions:

- **Root Cause Analysis (RCA)**: Explicitly identify the layer, file, and line where the contract or logic breaks.
- **Observed vs Expected**: Contrast the current broken behavior with the desired outcome.
- **Minimal Surface**: Ensure the proposed fix targets ONLY the bug. No refactors allowed in this cycle.
- **Configuration Contract**: If this fix introduces or changes any environment variable, list it here with its abstract key and purpose. Keys must hide vendor/infrastructure details (e.g., `AUTH_PROVIDER_SECRET` over `CLERK_SECRET`). No committed templates.

---

## Phase: PLAN (Regression Focus)

Follow the **Phase: PLAN** from the **Working Protocol**, with this mandatory addition:

- **Regression Test**: Include a task specifically for a test that reproduces the bug (Characterization Test). Use the patterns from `testing-principles.md`. This task must appear in the PLAN before approval.

---

---

## Phase: END (Hardened)

Follow the **Phase: END** from the **Working Protocol**. Forensics must be clean: no leftover console logs, no debugging artifacts. **ASK** before any git action.

---

> [!TIP]
> **Multi-Agent Optimization (Claude Code only)**
>
> Fix cycles benefit from role separation — the root cause reasoning stays isolated from the code execution:
>
> | Phase        | Role         | Why                                                                     |
> | :----------- | :----------- | :---------------------------------------------------------------------- |
> | SPEC + PLAN  | **Planning** | RCA, reproduction case, minimal surface definition                      |
> | CODE + TEST  | **Fast**     | Targeted fix + regression test — no RCA context bleeding into execution |
> | Review + END | **Planning** | Verifies fix addresses root cause, no regressions, forensics clean      |
>
> When PLAN is approved, Planning spawns Fast with the approved RCA, fix contract, and the regression test scenario. Fast executes and returns pass/fail per checklist item. Planning verifies before END.
>
> If the Agent tool is unavailable, the cycle runs as single-agent — role annotations in the workflow serve as mindset cues.
> Read `.ai/instructions/core/agent-roles.md` for the full handoff protocol.

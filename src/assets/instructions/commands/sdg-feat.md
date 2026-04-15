# Feature Execution — Context Preparation

We are initializing a new feature: $ARGUMENTS.

> **Load now**: `.ai/instructions/templates/workflow.md` — defines all phases (SPEC, PLAN, CODE, TEST, END) you will follow in this cycle.

---

## Phase: SPEC (The Contract) — MODE: PLANNING

Follow the **Phase: SPEC** from the **Working Protocol**. Apply these specific Context Charges:

- **Step 1 (Intent)**: Confirmed as `feat:`.
- **Step 3 (Domain & Contracts)**:
  - **Domain Modeling**: Defines the domain (Backend / Frontend / Fullstack) and primary entities.
  - **Configuration Contract**: Define environment variables (abstract keys).
  - **Contract-First**: Defines the inputs and outputs (API or Props) before implementation.
  - **Backend SPEC**: Define response contract template (method, path, input/output types, error codes). Load `competencies/backend.md`.
  - **Frontend SPEC**: Define section structure, layout skeleton (grid/columns), and states (Loading/Empty/Error). Load `competencies/frontend.md`.
- **Step 4 (Verification)**: Ensure min 3 checks cover: Happy Path, Edge Case, Expected Failure.

---

> Read `.ai/instructions/core/agent-roles.md` for the multi-agent handoff protocol (Planning + Fast roles).

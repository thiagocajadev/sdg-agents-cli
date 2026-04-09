# Feature Execution — Context Preparation

We are initializing a new feature: $ARGUMENTS. This command prepares the context for the development lifecycle following the **Working Protocol**.

## Step 0 — Context Preparation

1. **Roadmap Check**: If `ROADMAP.md` exists, read it to identify where this feature fits in the project's long-term vision.
2. **Domain Scope**:
   - **Backend** (API/Domain/DB) → read `.ai/instructions/competencies/backend.md`
   - **Frontend** (UI/UX) → read `.ai/instructions/competencies/frontend.md`
   - **Fullstack** → read both
3. **Architecture Standards**: If `.ai/instructions/flavor/principles.md` exists, read the established data pipeline (Vertical Slice, MVC, etc.).
4. **Code Style Load** (mandatory — do not skip):
   - **Engineering Standards** → read `.ai/instructions/core/engineering-standards.md`
   - **Code Style & NarrativeCascade** → read `.ai/instructions/core/code-style.md`
5. **Quality & Debugging**:
   - **Testing Strategy** → read `.ai/instructions/core/testing-principles.md`
   - **Observability** → read `.ai/instructions/core/observability.md`

---

## Phase: SPEC (Especificação da Funcionalidade)

Follow the **Phase: SPEC** from the **Working Protocol**, with these mandatory additions:

- **Domain Modeling**: Explicitly define the primary entities and aggregate roots involved.
- **Configuration Contract**: Define the environment variables required for this feature (keys must be **abstract**; pro-tip: `AUTH_SECRET` over `CLERK_SECRET`).
- **Contract-First**: Define the Public Interface (API endpoints, public methods, or Component Props) before listing implementation steps.
- **Storytelling**: The SPEC must describe the "User Journey" or the "Data Life Cycle".
- **Backend SPEC (mandatory addition)**: If the domain includes API work, define the response contract before listing implementation steps:
  - Use the Contract template from `backend.md`'s ContractFirst rule
  - Define: endpoint method + path, input fields with types, output shape (envelope fields), and all error codes with conditions
  - This contract must appear in the SPEC and be approved before PLAN begins
- **Frontend SPEC (mandatory addition)**: If the domain includes UI work, define the section structure before any code:
  - List each section by type (`section.hero`, `section.cards`, `section.form`, etc.)
  - Define the layout skeleton: grid columns, main content blocks, and their data sources
  - Identify which states must be handled: Loading / Empty / Error
  - This wireframe contract must appear in the SPEC and be approved before PLAN begins
- **Testing SPEC (mandatory addition)**: Explicitly define at least three scenarios: One Happy Path, one Edge Case, and one Expected Failure.
  - Format as: `Scenario [Name] (Input: { ... }) -> Expected: [Result/State]`
  - This testing contract must appear in the SPEC and be approved before PLAN begins

---

---

## Phase: END (Hardened)

Follow the **Phase: END** from the **Working Protocol** with absolute rigor. **DO NOT** commit or push without explicit **Developer authorization**. Ensure `git status` reveals 100% intentionality.

---

> [!TIP]
> **Multi-Agent Optimization (Claude Code only)**
>
> This cycle supports optimized execution via two specialized agents:
>
> | Phase        | Role         | Why                                                          |
> | :----------- | :----------- | :----------------------------------------------------------- |
> | SPEC + PLAN  | **Planning** | Deep context load, domain modeling, contract design          |
> | CODE + TEST  | **Fast**     | Operational execution — no strategic overhead, clean context |
> | Review + END | **Planning** | Narrative Gate validation, checklist review, Dev report      |
>
> When PLAN is approved, Planning spawns Fast via the Agent tool with the approved SPEC and minimal context (engineering standards, code style, idiom patterns). Fast returns a structured report. Planning reviews before END.
>
> If the Agent tool is unavailable, the cycle runs as single-agent — role annotations in the workflow serve as mindset cues.
> Read `.ai/instructions/core/agent-roles.md` for the full handoff protocol.

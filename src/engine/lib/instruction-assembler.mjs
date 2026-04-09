/**
 * Instruction Assembler — Builds and writes the final master instructions.
 * Assembles agent config files and the project manifest.
 */

import fs from 'node:fs';
import path from 'node:path';
import dedent from 'dedent';

import { STACK_DISPLAY_NAMES } from '../config/stack-display.mjs';
import { DisplayUtils } from './display-utils.mjs';
import { ManifestUtils } from './manifest-utils.mjs';
import { FsUtils } from './fs-utils.mjs';

const { displayName } = DisplayUtils;
const { computeHashes } = ManifestUtils;
const { getDirname } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '..', '..', 'assets', 'instructions');

function computeStackMetrics(idioms) {
  const hasBackend = idioms.some((idiomId) => STACK_DISPLAY_NAMES[idiomId]?.isBackend);
  const hasFrontend = idioms.some((idiomId) => STACK_DISPLAY_NAMES[idiomId]?.isFrontend);

  const metrics = {
    hasBackend,
    hasFrontend,
  };

  return metrics;
}

/**
 * Assembles the full master instruction content from inline laws + workflow + links.
 */
function buildMasterInstructions(selections) {
  const templatesDir = path.join(SOURCE_INSTRUCTIONS, 'templates');
  const workflow = fs.readFileSync(path.join(templatesDir, 'workflow.md'), 'utf8');

  const manifesto = buildStaffManifesto();
  const instructionLinks = buildInstructionLinks(selections);

  const isMultiAgent = selections.ide === 'claude' || selections.ide === 'all';
  const agentRolesBlock = isMultiAgent ? buildAgentRolesBlock() : '';
  const agentRolesSeparator = isMultiAgent ? '\n\n' : '';

  const fullInstructionContent = `${manifesto}\n\n${workflow}${agentRolesSeparator}${agentRolesBlock}\n\n${instructionLinks}`;

  return fullInstructionContent;

  function buildAgentRolesBlock() {
    const agentRolesString = dedent`
      ## Agent Roles

      > [!NOTE]
      > Multi-agent execution is active. Read \`.ai/instructions/core/agent-roles.md\` for the full protocol.

      | Role         | Phases                  | Model                      |
      | :----------- | :---------------------- | :------------------------- |
      | **Planning** | SPEC, PLAN, Review, END | claude-sonnet-4-6 thinking |
      | **Fast**     | CODE, TEST              | claude-sonnet-4-6          |

      **Handoff:** Planning spawns Fast via the Agent tool when PLAN is approved. Fast returns a structured report. Planning reviews before END.`;

    return agentRolesString;
  }

  function buildStaffManifesto() {
    const manifestoString = dedent`
      # Staff Engineer — Governance Command Center

      <ruleset name="StaffManifesto">

      ## The 4 Laws of the SDG Constitution

      ### 1. The Law of Hardening (Security-First)
      > <rule name="LawOfHardening">
      > Total configuration isolation. Zero runtime surprises. Fail fast if the environment is incomplete. Default to deny at every boundary.
      > </rule>

      ### 2. The Law of Resilience (Stability)
      > <rule name="LawOfResilience">
      > Defensive dominance. Software must withstand both failure and repetition. Idempotency and graceful degradation are non-negotiable.
      > </rule>

      ### 3. The Law of the Cascade (Narrative)
      > <rule name="NarrativeCascade">
      > [!IMPORTANT]
      > **Code should be like a short story, a complete and meaningful narrative.**
      >
      > **The Principles:**
      > - **Stepdown Rule**: Callers sitting at the top. The file reads top-down from headline to details.
      > - **Rich Object Flow**: Peer elements receive the same rich object, maintaining consistent contracts.
      > - **Explaining Returns**: The return reflects the final task or a named result. Avoid large anonymous objects.
      > - **SLA (Single Level of Abstraction)**: Orchestrate or implement — never both in the same body.
      > - **Shallow Boundaries**: Destructure Level 1/2. Stop deep navigation dead in its tracks.
      > - **Vertical Density**: Visual grouping of related variables/logic with single blank lines (para-logical grouping).
      > - **Revealing Module Pattern**: Define functions/logic first, create a named object at the end, then export only that object.
      > - **Lexical Scoping**: One-off helpers must be encapsulated inside their parent's scope.
      > - **Humanized Writing**: Apply \`.ai/instructions/core/writing-soul.md\` to all documentation, UI text, and communication. Eliminate "AI-isms" and promotional slop to maintain a pulse in every technical artifact.
      >
      > *Comments explain "why", never "what". If naming is right, comments disappear.*
      > </rule>

      ### 4. The Law of Visual Excellence (Aesthetics)
      > <rule name="LawOfVisualExcellence">
      > Premium aesthetics by default. High contrast, modern typography, and meaningful micro-interactions. Maintain the chosen design language with absolute rigor.
      > </rule>

      </ruleset>`;

    return manifestoString;
  }

  function buildInstructionLinks(currentSelections) {
    const isMultiAgentLinks = currentSelections.ide === 'claude' || currentSelections.ide === 'all';

    const blocks = [
      buildContextRoutingHeader(),
      buildProjectContextRouting(),
      buildCoreGovernanceRouting(isMultiAgentLinks),
      buildArchitecturalContextRouting(currentSelections.flavor),
      buildTechnicalExecutionRouting(currentSelections.idioms),
      buildUIUXDesignRouting(currentSelections),
      buildWorkingCyclesRouting(),
    ];

    const finalContextRouting = blocks.filter((block) => block !== null).join('\n\n');

    return finalContextRouting;

    function buildProjectContextRouting() {
      const routingString = dedent`
        **Project Context**

        | File | Purpose |
        | :--- | :------ |
        | \`.ai-backlog/context.md\` | Project Brief — read before anything else |
        | \`.ai-backlog/tasks.md\` | Active tasks and handoff state |`;

      return routingString;
    }

    function buildContextRoutingHeader() {
      const headerString = dedent`
        ## Project Command Center

        > [!IMPORTANT]
        > Load only what the current task requires. Start with Project Context, then add stack-specific files as needed. Read these before executing complex tasks — do not assume project structure.`;

      return headerString;
    }

    function buildCoreGovernanceRouting(includeAgentRoles) {
      const agentRolesRow = includeAgentRoles
        ? `\n| \`.ai/instructions/core/agent-roles.md\` | Multi-Agent Roles & Handoff Protocol |`
        : '';

      const governanceString = dedent`
        **Universal Governance**

        | File | Purpose |
        | :--- | :------ |
        | \`.ai/instructions/core/staff-dna.md\` | Staff DNA / Core Principles |
        | \`.ai/instructions/core/security.md\` | Security Strategy |
        | \`.ai/instructions/core/security-pipeline.md\` | Security Pipeline |
        | \`.ai/instructions/core/engineering-standards.md\` | Engineering Standards |
        | \`.ai/instructions/core/naming.md\` | Naming Discipline |
        | \`.ai/instructions/core/code-style.md\` | Code Style & Scannability |
        | \`.ai/instructions/core/writing-soul.md\` | Writing Soul (Docs & UI) |
        | \`.ai/instructions/core/testing-principles.md\` | Testing Principles |
        | \`.ai/instructions/core/observability.md\` | Observability |${agentRolesRow}`;

      return governanceString;
    }

    function buildArchitecturalContextRouting(flavor) {
      const architectureString = dedent`
        **Architectural Context**

        | File | Purpose |
        | :--- | :------ |
        | \`.ai/instructions/flavor/principles.md\` | Flavor: ${displayName(flavor)} |`;

      return architectureString;
    }

    function buildTechnicalExecutionRouting(idioms) {
      const { hasBackend, hasFrontend } = computeStackMetrics(idioms);

      const idiomRows = idioms.map((idiomId) => {
        const label = STACK_DISPLAY_NAMES[idiomId]?.name ?? idiomId;
        const tableRow = `| \`.ai/instructions/idioms/${idiomId}/patterns.md\` | ${label} Idioms & Patterns |`;
        return tableRow;
      });

      const backendRows = hasBackend
        ? [
            `| \`.ai/instructions/competencies/backend.md\` | BFF + API Strategy |`,
            `| \`.ai/instructions/core/data-access.md\` | Data Access |`,
            `| \`.ai/instructions/core/sql-style.md\` | SQL Style |`,
            `| \`.ai/instructions/core/api-design.md\` | API Design |`,
            `| \`.ai/instructions/core/ci-cd.md\` | CI/CD |`,
            `| \`.ai/instructions/core/cloud.md\` | Cloud & Containers |`,
          ]
        : [];

      const frontendRows = hasFrontend
        ? [`| \`.ai/instructions/competencies/frontend.md\` | Contract-Based UI System |`]
        : [];

      const allRows = [...idiomRows, ...backendRows, ...frontendRows].join('\n');

      const technicalRoutingBlock = [
        `**Technical Execution**`,
        ``,
        `| File | Purpose |`,
        `| :--- | :------ |`,
        allRows,
      ].join('\n');

      return technicalRoutingBlock;
    }

    function buildUIUXDesignRouting(selectionsObj) {
      const { idioms } = selectionsObj;
      const designPreset = selectionsObj.designPreset ?? 'UNIVERSAL';
      const { hasFrontend } = computeStackMetrics(idioms);

      if (!hasFrontend) return null;

      const designLabel = designPreset.toUpperCase();

      const uiuxRoutingBlock = dedent`
        **UI/UX Design System (Target: ${designLabel})**

        | File | Purpose |
        | :--- | :------ |
        | \`.ai/instructions/core/ui/standards.md\` | Visual Standards |
        | \`.ai/instructions/core/ui/architecture.md\` | Component Architecture |
        | \`.ai/instructions/core/ui/presets.md\` | Interface Presets |
        | \`.ai/instructions/core/ui/design-thinking.md\` | Visual Contracts (Phase 0) |`;

      return uiuxRoutingBlock;
    }

    function buildWorkingCyclesRouting() {
      const workingCyclesString = dedent`
        **Working Cycles**

        | File | Purpose |
        | :--- | :------ |
        | \`.ai/commands/sdg-land.md\` | Land Cycle (Project Inception & Backlog) |
        | \`.ai/commands/sdg-feat.md\` | Feature Cycle (Specs & Implementation) |
        | \`.ai/commands/sdg-fix.md\` | Fix Cycle (Forensics & Regression) |
        | \`.ai/commands/sdg-docs.md\` | Documentation Cycle (ADRs & Logs) |
        | \`.ai/commands/sdg-end.md\` | END Phase — close the active cycle (changelog, backlog, commit) |`;

      return workingCyclesString;
    }
  }
}

/**
 * Builds the stub content for projects initialized in Prompts Only mode.
 */
function buildPromptModeStub() {
  const stubString = dedent`
    # Project Specification Prompts

    > [!NOTE]
    > This project has been initialized with SDG-Agents in **Prompts Only** mode.
    > The AI Agents governance rules (Staff-level engineering instructions) were NOT injected into the workspace.
    >
    > If you are an AI Agent operating in this project, you will only have access to the specification templates located at \`.ai/prompts/\`.
    >
    > **To Developers:**
    > If you want to augment this repository with full AI Governance instructions, run the following command in the terminal:
    > \`npx sdg-agents init\``;

  return stubString;
}

/**
 * Writes .ai-backlog/context.md and .ai-backlog/tasks.md at the project root.
 * Only writes each file if it does not already exist — never overwrites user content.
 */
function writeBacklogFiles(targetDir, selections) {
  const backlogDir = path.join(targetDir, '.ai-backlog');
  if (!fs.existsSync(backlogDir)) fs.mkdirSync(backlogDir, { recursive: true });

  writeContextFile(backlogDir, targetDir, selections);
  writeTasksFile(backlogDir);

  function writeContextFile(backlogDirPath, projectDir, currentSelections) {
    const contextPath = path.join(backlogDirPath, 'context.md');
    if (fs.existsSync(contextPath)) return;

    const stackLine = (currentSelections.idioms ?? [])
      .map((id) => STACK_DISPLAY_NAMES[id]?.name ?? id)
      .join(', ');

    const contextContent = dedent`
      # ${path.basename(projectDir)} — [what this project does in one sentence]

      stack: ${stackLine}
      pattern: [architecture pattern]
      entry: [main entry point file]

      ## Decisions
      - [decision]: [rationale]

      ## Now
      [what is actively being worked on]

      ## Engineering Insights
      - [topic]: [lesson learned or research finding]
    `;

    fs.writeFileSync(contextPath, contextContent);
  }

  function writeTasksFile(backlogDirPath) {
    const tasksPath = path.join(backlogDirPath, 'tasks.md');
    if (fs.existsSync(tasksPath)) return;

    const tasksContent = dedent`
      # Tasks

      > Managed by AI agents. Update status after each atomic task.
      > Recovery: if lost, ask the agent to read recent git commits and reconstruct.

      ## Active
      <!-- [IN_PROGRESS] description — context of where it stopped and what comes next -->

      ## Backlog
      <!-- [TODO] description -->

      ## Done
      <!-- [DONE] description -->
    `;

    fs.writeFileSync(tasksPath, tasksContent);
  }
}

/**
 * Builds the Claude Code-specific CLAUDE.md content.
 * Uses @-import syntax so Claude Code loads governance files natively on session start.
 * Distinct from AGENTS.md: references rather than duplicates content.
 */
function buildClaudeContent() {
  const claudeContent = dedent`
    # SDG Agents — Claude Code Governance

    > [!IMPORTANT]
    > This file is read automatically by Claude Code on every session start.
    > Do not edit manually — regenerate with \`npx sdg-agents init --claude\`.

    ## Auto-Load: Governance Context

    @.ai/skill/AGENTS.md

    ## Session Start Protocol

    On every new session, execute in order:

    1. **Check backlog**: Read \`.ai-backlog/context.md\` — understand the project brief. **Priority**: Always check the local directory first to avoid redundant scans.
    2. **Check tasks**: Read \`.ai-backlog/tasks.md\` — resume any \`[IN_PROGRESS]\` task before accepting new work.
    3. **Bootstrap if missing**: If \`.ai-backlog/context.md\` does not exist, follow the **Context Bootstrap** defined in the Working Protocol (loaded via \`@.ai/skill/AGENTS.md\` above).

    ## Intent Routing (quick reference)

    | Prefix | Action |
    | :----- | :----- |
    | \`land: ...\` | Land Cycle — read \`.ai/commands/sdg-land.md\` |
    | \`feat: ...\` | Feature Cycle — read \`.ai/commands/sdg-feat.md\` |
    | \`fix: ...\` | Fix Cycle — read \`.ai/commands/sdg-fix.md\` |
    | \`docs: ...\` | Docs Cycle — read \`.ai/commands/sdg-docs.md\` |
    | \`end:\` | END Phase — read \`.ai/commands/sdg-end.md\` |
  `;

  return claudeContent;
}

/**
 * Writes the universal agent config file inside .ai/skill/.
 * A single AGENTS.md serves as the entry point for all AI Agents —
 * it references only the rules relevant to the project's stack.
 * If agents/ides are selected, it will also dump the rules to the native target.
 */
function writeAgentConfig(targetDir, content, requestedAgents = []) {
  // Always create the generic fallback AGENTS.md
  const skillDir = path.join(targetDir, '.ai', 'skill');
  if (!fs.existsSync(skillDir)) fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'AGENTS.md'), content);

  if (!requestedAgents || requestedAgents.length === 0) return;

  const ideTargets = {
    cursor: { dir: '.cursor/rules', file: 'sdg-agents.mdc' },
    windsurf: { dir: '.', file: '.windsurfrules' },
    vscode: { dir: '.github', file: 'copilot-instructions.md' },
    copilot: { dir: '.github', file: 'copilot-instructions.md' },
    claude: { dir: '.', file: 'CLAUDE.md' },
    roocode: { dir: '.', file: '.clinerules' },
    gemini: { dir: '.', file: 'AI_INSTRUCTIONS.md' },
  };

  const expandedAgents = requestedAgents.includes('all')
    ? Object.keys(ideTargets)
    : requestedAgents;

  for (const agent of expandedAgents) {
    if (agent === 'none' || agent === 'antigravity') continue;

    const target = ideTargets[agent];
    if (!target) continue;

    const fullDir = path.join(targetDir, target.dir);
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

    let finalContent = content;
    if (agent === 'cursor') {
      finalContent = `---\ndescription: Project Governance and Architectural Rules\nglob: *\n---\n\n${content}`;
    } else if (agent === 'claude') {
      finalContent = buildClaudeContent();
    }

    fs.writeFileSync(path.join(fullDir, target.file), finalContent);
  }
}

/**
 * Writes or updates .gitignore with SDG-managed entries.
 * Idempotent — each block only appends entries not already present.
 */
function writeGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');

  const BLOCKS = [
    {
      header: '# Environment — never commit secrets',
      entries: ['.env', '.env.*'],
    },
    {
      header: '# AI artifacts — session state, not project logic',
      entries: ['.ai-backlog/', 'tmp/', 'temp/'],
    },
  ];

  const existingContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8')
    : '';

  const existingLines = existingContent.split('\n').map((line) => line.trim());

  const blocksToAppend = BLOCKS.map((block) => {
    const missingEntries = block.entries.filter((entry) => !existingLines.includes(entry));
    if (missingEntries.length === 0) return null;
    const alreadyHasHeader = existingContent.includes(block.header);
    const lines = alreadyHasHeader ? missingEntries : [block.header, ...missingEntries];
    return lines.join('\n');
  }).filter(Boolean);

  if (blocksToAppend.length === 0) return;

  const separator = existingContent.length > 0 && !existingContent.endsWith('\n') ? '\n' : '';
  fs.appendFileSync(gitignorePath, `${separator}\n${blocksToAppend.join('\n\n')}\n`);
}

/**
 * Writes the .sdg-manifest.json with content hashes for future diff checks.
 */
function writeManifest(targetDir, selections, pkgVersion) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    sdgAgentVersion: pkgVersion,
    selections,
    contentHashes: computeHashes(selections, SOURCE_INSTRUCTIONS),
  };

  const aiDir = path.join(targetDir, '.ai');
  if (!fs.existsSync(aiDir)) fs.mkdirSync(aiDir, { recursive: true });
  fs.writeFileSync(path.join(aiDir, '.sdg-manifest.json'), JSON.stringify(manifest, null, 2));
}

const InstructionAssembler = {
  buildMasterInstructions,
  buildClaudeContent,
  buildPromptModeStub,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
};

export { InstructionAssembler };

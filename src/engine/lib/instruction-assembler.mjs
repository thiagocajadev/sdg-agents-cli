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
const { getDirname, writeJsonAtomic } = FsUtils;

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

  const agentRolesBlock = buildAgentRolesBlock();
  const agentRolesSeparator = '\n\n';

  const fullInstructionContent = `${manifesto}\n\n${workflow}${agentRolesSeparator}${agentRolesBlock}\n\n${instructionLinks}`;

  return fullInstructionContent;

  function buildAgentRolesBlock() {
    const agentRolesString = dedent`
      ## Agent Roles

      > [!NOTE]
      > Read \`.ai/instructions/core/agent-roles.md\` for the Agent Roles and Execution Protocol.`;

    return agentRolesString;
  }

  function buildStaffManifesto() {
    const manifestoString = dedent`
      # Staff Engineer — Governance Command Center

      > [!IMPORTANT]
      > This project follows the Universal Engineering Manifesto.
      > You MUST read and adhere strictly to the 6 Laws defined in \`.ai/instructions/core/staff-dna.md\`.
    `;

    return manifestoString;
  }

  function buildInstructionLinks(currentSelections) {
    const blocks = [
      buildContextRoutingHeader(),
      buildProjectContextRouting(),
      buildCoreGovernanceRouting(),
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
        | \`.ai-backlog/tasks.md\` | Active tasks and handoff state |
        | \`.ai-backlog/learned.md\` | Lessons Learned — success patterns and research |
        | \`.ai-backlog/troubleshoot.md\` | Troubleshooting — RCA logs and failure records |`;

      return routingString;
    }

    function buildContextRoutingHeader() {
      const headerString = dedent`
        ## Project Command Center

        > [!IMPORTANT]
        > Load only what the current task requires. Start with Project Context, then add stack-specific files as needed. Read these before executing complex tasks — do not assume project structure.`;

      return headerString;
    }

    function buildCoreGovernanceRouting() {
      const agentRolesRow = `\n| \`.ai/instructions/core/agent-roles.md\` | Multi-Agent Roles & Handoff Protocol |`;

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
  writeLearnedFile(backlogDir);
  writeTroubleshootFile(backlogDir);

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

  function writeLearnedFile(backlogDirPath) {
    const learnedPath = path.join(backlogDirPath, 'learned.md');
    if (fs.existsSync(learnedPath)) return;

    const learnedContent = dedent`
      # Lessons Learned & Research

      > Persistent repository for success patterns, technical research, and architecture decisions.
      > Loaded during \`feat:\` cycles.

      ## Success Patterns
      - [topic]: [pattern or approach that worked well]

      ## Research Findings
      - [topic]: [discovery or validated hypothesis]
    `;

    fs.writeFileSync(learnedPath, learnedContent);
  }

  function writeTroubleshootFile(backlogDirPath) {
    const troubleshootPath = path.join(backlogDirPath, 'troubleshoot.md');
    if (fs.existsSync(troubleshootPath)) return;

    const troubleshootContent = dedent`
      # Troubleshooting & RCA Logs

      > Persistent repository for failure records, Root Cause Analysis (RCA), and technical debt.
      > Loaded during \`fix:\` cycles to prevent regression.

      ## Failure Records (RCA)
      - [date] [topic]: [what failed, why, and the "gotcha" to avoid]

      ## Technical Debt & Risks
      - [topic]: [known limitation or fragile area]
    `;

    fs.writeFileSync(troubleshootPath, troubleshootContent);
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
  // Always create the generic fallback AGENTS.md and CAVEMAN.md
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

    const targetFile = path.join(fullDir, target.file);
    const originalContent = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : null;

    let finalContent = content;
    if (agent === 'cursor') {
      finalContent = `---\ndescription: Project Governance and Architectural Rules\nglob: *\n---\n\n${content}`;
    } else if (agent === 'claude') {
      finalContent = buildClaudeContent();
    }

    if (originalContent !== finalContent) {
      fs.writeFileSync(targetFile, finalContent);
    }
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

  const manifestPath = path.join(aiDir, '.sdg-manifest.json');
  const originalContent = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath, 'utf8')
    : null;

  writeJsonAtomic(manifestPath, manifest, originalContent);
}

/**
 * Injects automation scripts and configurations (Bump, Husky) if enabled.
 * Idempotent: skips if scripts/bump.mjs exists or if selections.bump is false.
 */
function writeAutomationScripts(targetDir, selections) {
  if (selections.bump === false) return;

  const scriptsDir = path.join(targetDir, 'scripts');
  const bumpScriptPath = path.join(scriptsDir, 'bump.mjs');

  // 1. Check for existing bump script in package.json to avoid collision
  const pkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const hasExistingBump =
    pkg.scripts && (pkg.scripts.bump || pkg.scripts.release || pkg.scripts.version);

  if (hasExistingBump && !fs.existsSync(bumpScriptPath)) {
    // If they have a script but not our file, we respect their script
    return;
  }

  // 2. Write bump.mjs template
  if (!fs.existsSync(bumpScriptPath)) {
    if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir, { recursive: true });
    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'bump.mjs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(bumpScriptPath, templateContent);
  }

  // 3. Update package.json scripts
  if (!pkg.scripts) pkg.scripts = {};
  if (!pkg.scripts.bump) {
    pkg.scripts.bump = 'node scripts/bump.mjs';
    writeJsonAtomic(pkgPath, pkg, fs.readFileSync(pkgPath, 'utf8'));
  }

  // 4. Configure Husky if .husky exists
  const huskyDir = path.join(targetDir, '.husky');
  if (fs.existsSync(huskyDir)) {
    const prePushPath = path.join(huskyDir, 'pre-push');
    const nvmShim = dedent`
      # NVM Shim (Essential for projects Staff in Linux/NVM)
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    `;

    const bumpCmd = '# Pre-push check (non-mutating)\nnpm test';

    if (fs.existsSync(prePushPath)) {
      const content = fs.readFileSync(prePushPath, 'utf8');
      if (!content.includes('npm test')) {
        const separator = content.endsWith('\n') ? '' : '\n';
        const newPrePushContent = `${content}${separator}\n${nvmShim}\n${bumpCmd}\n`;
        fs.writeFileSync(prePushPath, newPrePushContent);
      }
    } else {
      const prePushContent = dedent`
        #!/usr/bin/env sh

        ${nvmShim}

        ${bumpCmd}
      `;
      fs.writeFileSync(prePushPath, prePushContent, { mode: 0o755 });
    }
  }
}

const InstructionAssembler = {
  buildMasterInstructions,
  buildClaudeContent,
  buildPromptModeStub,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
  writeAutomationScripts,
};

export { InstructionAssembler };

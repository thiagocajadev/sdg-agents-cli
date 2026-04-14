/**
 * Instruction Assembler — Builds and writes the final master instructions.
 * Assembles agent config files and the project manifest.
 */

import fs from 'node:fs';
import path from 'node:path';
import dedent from 'dedent';

import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';
import { DisplayUtils } from '../core/display-utils.mjs';
import { ManifestUtils } from './manifest-utils.mjs';
import { FsUtils } from '../core/fs-utils.mjs';

const { displayName } = DisplayUtils;
const { computeHashes } = ManifestUtils;
const { getDirname, writeJsonAtomic, safeReadJson } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '../../..', 'assets', 'instructions');

function computeStackMetrics(idioms) {
  const hasBackend = idioms.some(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isBackend
  );
  const hasFrontend = idioms.some(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isFrontend
  );

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
      buildCreativeToolkitRouting(currentSelections),
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

      const projectContextRouting = routingString;
      return projectContextRouting;
    }

    function buildContextRoutingHeader() {
      const headerString = dedent`
        ## Project Command Center

        > [!IMPORTANT]
        > Load only what the current task requires. Start with Project Context, then add stack-specific files as needed. Read these before executing complex tasks — do not assume project structure.`;

      const routingHeader = headerString;
      return routingHeader;
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

      const coreGovernanceRouting = governanceString;
      return coreGovernanceRouting;
    }

    function buildArchitecturalContextRouting(flavor) {
      const architectureString = dedent`
        **Architectural Context**

        | File | Purpose |
        | :--- | :------ |
        | \`.ai/instructions/flavor/principles.md\` | Flavor: ${displayName(flavor)} |`;

      const architecturalRouting = architectureString;
      return architecturalRouting;
    }

    function buildTechnicalExecutionRouting(idioms) {
      const { hasBackend, hasFrontend } = computeStackMetrics(idioms);

      const idiomRows = idioms.map((idiomFolderKey) => {
        const label = STACK_DISPLAY_NAMES[idiomFolderKey]?.name ?? idiomFolderKey;
        const tableRow = `| \`.ai/instructions/idioms/${idiomFolderKey}/patterns.md\` | ${label} Idioms & Patterns |`;
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

      const uiuxRouting = uiuxRoutingBlock;
      return uiuxRouting;
    }

    function buildCreativeToolkitRouting(_selectionsObj) {
      const creativeDir = path.join(SOURCE_INSTRUCTIONS, 'core', 'creative');
      if (!fs.existsSync(creativeDir)) return null;

      const creativeToolkitBlock = [
        `**Creative Design Toolkit**`,
        ``,
        `| File | Purpose |`,
        `| :--- | :------ |`,
        `| \`.ai/instructions/creative/branding.md\` | Brand DNA & Visual Identity |`,
        `| \`.ai/instructions/creative/social-media.md\` | Social Media Hub (IG, TikTok, LI, YT) |`,
        `| \`.ai/instructions/creative/landing-page.md\` | Landing Page Blueprint |`,
        ``,
        `**Creative Templates**`,
        ``,
        `| File | Purpose |`,
        `| :--- | :------ |`,
        `| \`.ai/instructions/creative/templates/brand-dna.md\` | Brand Identity & Personality Specs |`,
        `| \`.ai/instructions/creative/templates/logo-spec.md\` | Logo & Iconography technical guide |`,
        `| \`.ai/instructions/creative/templates/social-media-content.md\` | Social Media post specifications |`,
        `| \`.ai/instructions/creative/templates/landing-page-blueprint.md\` | Conversion-focused page structure |`,
        ``,
        `**Creative Tactic Guides**`,
        ``,
        `| File | Purpose |`,
        `| :--- | :------ |`,
        `| \`.ai/instructions/creative/guides/prompt-guide.md\` | Pro-level Creative Prompting |`,
        `| \`.ai/instructions/creative/guides/social/instagram.md\` | Instagram Algorithm & Format Guide |`,
        `| \`.ai/instructions/creative/guides/social/linkedin.md\` | LinkedIn Engagement & Reach |`,
        `| \`.ai/instructions/creative/guides/social/tiktok.md\` | TikTok Hook & Retention Strategy |`,
        `| \`.ai/instructions/creative/guides/social/youtube.md\` | YouTube Banner & Thumbnail rules |`,
      ].join('\n');

      const creativeRouting = creativeToolkitBlock;
      return creativeRouting;
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
        | \`.ai/commands/sdg-audit.md\` | Governance Audit (drift detection & compliance) |
        | \`.ai/commands/sdg-end.md\` | END Phase — close the active cycle (changelog, backlog, commit) |`;

      const workingCyclesRouting = workingCyclesString;
      return workingCyclesRouting;
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

  const promptModeStub = stubString;
  return promptModeStub;
}

/**
 * Writes .ai-backlog/context.md and .ai-backlog/tasks.md at the project root.
 * Only writes each file if it does not already exist — never overwrites user content.
 */
function writeBacklogFiles(targetDirectory, selections) {
  const backlogDirectory = path.join(targetDirectory, '.ai-backlog');
  fs.mkdirSync(backlogDirectory, { recursive: true });

  writeContextFile(backlogDirectory, targetDirectory, selections);
  writeTasksFile(backlogDirectory);
  writeLearnedFile(backlogDirectory);
  writeTroubleshootFile(backlogDirectory);

  function detectProjectLanguage(projectDirectory) {
    const packagePath = path.join(projectDirectory, 'package.json');
    if (!fs.existsSync(packagePath)) return 'en';

    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      // Basic detection via common Portuguese strings or i18n configs
      const deps = { ...packageData.dependencies, ...packageData.devDependencies };
      if (deps['i18next'] || deps['react-i18next']) {
        const localesDir = path.join(projectDirectory, 'src', 'locales');
        if (fs.existsSync(localesDir) && fs.readdirSync(localesDir).includes('pt-BR')) {
          const matchedLang = 'pt-BR';
          return matchedLang;
        }
      }
      if (
        packageData.description?.toLowerCase().includes('guia') ||
        packageData.description?.toLowerCase().includes('sistema')
      ) {
        const matchingDescriptionLang = 'pt-BR';
        return matchingDescriptionLang;
      }
    } catch {
      const fallbackLang = 'en';
      return fallbackLang;
    }
    const defaultLang = 'en';
    return defaultLang;
  }

  function writeContextFile(backlogDirectoryPath, projectDirectory, currentSelections) {
    const contextPath = path.join(backlogDirectoryPath, 'context.md');

    const language = detectProjectLanguage(projectDirectory);
    const partner = currentSelections.partner || {};
    const name = partner.name || (language === 'pt-BR' ? 'Dev Parceiro' : 'Dev Partner');
    const role = partner.role || (language === 'pt-BR' ? 'Fundador/Dev' : 'Founder/Dev');

    let partnerInfo = '';
    if (language === 'pt-BR') {
      partnerInfo = `${name} é o ${role}. Diga "Oi ${name.split(' ')[0]}". Comunicação em Português Brasileiro.`;
    } else {
      partnerInfo = `${name} is the ${role}. Say "Hello ${name.split(' ')[0]}". Communication in English.`;
    }

    if (fs.existsSync(contextPath)) {
      handleContextInjection(contextPath, partnerInfo);
      const injectedResult = undefined;
      return injectedResult;
    }

    const stackLine = (currentSelections.idioms ?? [])
      .map((idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.name ?? idiomFolderKey)
      .join(', ');

    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'context.md');
    let contextContent = fs.readFileSync(templatePath, 'utf8');
    contextContent = contextContent
      .replace('{{PROJECT_NAME}}', path.basename(projectDirectory))
      .replace('{{STACK}}', stackLine)
      .replace('{{PARTNER}}', partnerInfo);

    fs.writeFileSync(contextPath, contextContent);
  }

  function handleContextInjection(contextPath, partnerInfo) {
    const existingContent = fs.readFileSync(contextPath, 'utf8');
    if (existingContent.includes('## Partner')) return;

    const separator = existingContent.endsWith('\n') ? '' : '\n';
    const injection = `\n## Partner\n\n${partnerInfo}\n`;
    fs.appendFileSync(contextPath, `${separator}${injection}`);
  }

  function writeTasksFile(backlogDirectoryPath) {
    const tasksPath = path.join(backlogDirectoryPath, 'tasks.md');
    if (fs.existsSync(tasksPath)) return;
    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'tasks.md');
    fs.copyFileSync(templatePath, tasksPath);
  }

  function writeLearnedFile(backlogDirectoryPath) {
    const learnedPath = path.join(backlogDirectoryPath, 'learned.md');
    if (fs.existsSync(learnedPath)) return;
    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'learned.md');
    fs.copyFileSync(templatePath, learnedPath);
  }

  function writeTroubleshootFile(backlogDirectoryPath) {
    const troubleshootPath = path.join(backlogDirectoryPath, 'troubleshoot.md');
    if (fs.existsSync(troubleshootPath)) return;
    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'troubleshoot.md');
    fs.copyFileSync(templatePath, troubleshootPath);
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

  const instructionSet = claudeContent;
  return instructionSet;
}

/**
 * Writes the universal agent config file inside .ai/skill/.
 * A single AGENTS.md serves as the entry point for all AI Agents —
 * it references only the rules relevant to the project's stack.
 * If agents/ides are selected, it will also dump the rules to the native target.
 */
function writeAgentConfig(targetDirectory, content, requestedAgents = []) {
  // Always create the generic fallback AGENTS.md and CAVEMAN.md
  const skillDir = path.join(targetDirectory, '.ai', 'skill');
  fs.mkdirSync(skillDir, { recursive: true });
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

    const fullDir = path.join(targetDirectory, target.dir);
    fs.mkdirSync(fullDir, { recursive: true });

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
function writeGitignore(targetDirectory) {
  const gitignorePath = path.join(targetDirectory, '.gitignore');

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
    if (missingEntries.length === 0) {
      const emptyBlock = null;
      return emptyBlock;
    }
    const alreadyHasHeader = existingContent.includes(block.header);
    const lines = alreadyHasHeader ? missingEntries : [block.header, ...missingEntries];
    const blockContent = lines.join('\n');
    return blockContent;
  }).filter(Boolean);

  if (blocksToAppend.length === 0) return;

  const separator = existingContent.length > 0 && !existingContent.endsWith('\n') ? '\n' : '';
  fs.appendFileSync(gitignorePath, `${separator}\n${blocksToAppend.join('\n\n')}\n`);
}

/**
 * Writes the .sdg-manifest.json with content hashes for future diff checks.
 */
function writeManifest(targetDirectory, selections, packageVersion) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    sdgAgentVersion: packageVersion,
    selections,
    contentHashes: computeHashes(selections, SOURCE_INSTRUCTIONS),
  };

  const aiDirectory = path.join(targetDirectory, '.ai');
  fs.mkdirSync(aiDirectory, { recursive: true });

  const manifestPath = path.join(aiDirectory, '.sdg-manifest.json');
  const originalContent = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath, 'utf8')
    : null;

  writeJsonAtomic(manifestPath, manifest, originalContent);
}

/**
 * Injects automation scripts and configurations (Bump, Husky) if enabled.
 * Idempotent: skips if scripts/bump.mjs exists or if selections.bump is false.
 */
function writeAutomationScripts(targetDirectory, selections) {
  if (selections.bump === false) return;

  const scriptsDir = path.join(targetDirectory, 'scripts');
  const bumpScriptPath = path.join(scriptsDir, 'bump.mjs');

  // 1. Check for existing bump script in package.json to avoid collision
  const packagePath = path.join(targetDirectory, 'package.json');
  const packageData = safeReadJson(packagePath);
  if (!packageData) return;

  const hasExistingBump =
    packageData.scripts &&
    (packageData.scripts.bump || packageData.scripts.release || packageData.scripts.version);

  if (hasExistingBump && !fs.existsSync(bumpScriptPath)) {
    // If they have a script but not our file, we respect their script
    return;
  }

  // 2. Write bump.mjs template
  if (!fs.existsSync(bumpScriptPath)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'bump.mjs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(bumpScriptPath, templateContent);
  }

  // 3. Update package.json scripts
  if (!packageData.scripts) packageData.scripts = {};
  if (!packageData.scripts.bump) {
    packageData.scripts.bump = 'node scripts/bump.mjs';
    writeJsonAtomic(packagePath, packageData, fs.readFileSync(packagePath, 'utf8'));
  }

  // 4. Configure Husky if .husky exists
  const huskyDirectory = path.join(targetDirectory, '.husky');
  if (fs.existsSync(huskyDirectory)) {
    const prePushPath = path.join(huskyDirectory, 'pre-push');
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

function getActiveAgents(selections) {
  const agentCandidates = [...(selections.agents || []), selections.ide];
  const activeAgents = agentCandidates.filter((agent) => agent !== null && agent !== undefined);
  return activeAgents;
}

export const InstructionAssembler = {
  buildMasterInstructions,
  buildClaudeContent,
  buildPromptModeStub,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
  writeAutomationScripts,
  getActiveAgents,
};

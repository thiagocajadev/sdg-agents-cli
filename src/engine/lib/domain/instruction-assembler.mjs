/**
 * Instruction Assembler — Builds and writes the final master instructions.
 * Assembles agent config files and the project manifest.
 */

import fileSystem from 'node:fs';
import path from 'node:path';
import dedent from 'dedent';

import { DisplayUtils } from '../core/display-utils.mjs';
import { ManifestUtils } from './manifest-utils.mjs';
import { FsUtils } from '../core/fs-utils.mjs';

const { displayName } = DisplayUtils;
const { computeHashes } = ManifestUtils;
const { getDirname, writeJsonAtomic, safeReadJson } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '../../..', 'assets', 'instructions');

/**
 * Canonical skill catalog — single source of truth for AGENTS.md rendering.
 * All skills are always listed; the agent self-filters per task domain via the
 * category header ("Backend", "Frontend", "Surgical"). Stack specificity now
 * lives in `.ai/backlog/stack.md`, declared by the developer during `land:`.
 */
const SKILL_CATALOG = [
  {
    path: '.ai/skills/code-style.md',
    category: 'core',
    description: 'Code Style & Standards',
  },
  {
    path: '.ai/instructions/competencies/delivery.md',
    category: 'delivery',
    description: 'BFF envelope + Frontend contract execution',
  },
  { path: '.ai/skills/api-design.md', category: 'backend', description: 'API Design' },
  { path: '.ai/skills/data-access.md', category: 'backend', description: 'DB layer' },
  { path: '.ai/skills/sql-style.md', category: 'backend', description: 'SQL queries' },
  { path: '.ai/skills/ci-cd.md', category: 'backend', description: 'Pipelines & deploy' },
  { path: '.ai/skills/cloud.md', category: 'backend', description: 'Cloud & Containers' },
  {
    path: '.ai/skills/ui-ux.md',
    category: 'frontend',
    description: 'UI/UX design system & writing voice',
  },
  {
    path: '.ai/skills/testing.md',
    category: 'surgical',
    description: 'test creation or modification',
  },
  {
    path: '.ai/skills/security.md',
    category: 'surgical',
    description: 'auth, validation, secrets',
  },
  {
    path: '.ai/skills/observability.md',
    category: 'surgical',
    description: 'logging, metrics, tracing',
  },
];

/**
 * Assembles the master instruction as a compact Semantic Router.
 * No inline protocol text — only routing triggers and file references.
 * Skills are loaded on-demand by Phase CODE, matched to task domain.
 */
function buildMasterInstructions(selections) {
  const header = buildHeader();
  const sessionStart = buildSessionStart();
  const semanticRouter = buildSemanticRouter();
  const skillRouter = buildSkillRouter(selections);
  const agentRoles = buildAgentRoles();

  const fullInstructionContent = [
    header,
    sessionStart,
    semanticRouter,
    skillRouter,
    agentRoles,
  ].join('\n\n');

  return fullInstructionContent;

  function buildHeader() {
    const headerString = dedent`
      # Staff Engineer — Governance Command Center

      > Code style and quality gates live in code-style.md.
      > Cycle phases live in workflow.md.`;

    return headerString;
  }

  function buildSessionStart() {
    const sessionStartString = dedent`
      ## Session Start

      1. Read \`.ai/backlog/context.md\` — project brief. If missing, generate from \`package.json\` + \`README.md\`.
      2. Read \`.ai/backlog/stack.md\` — developer-curated stack declarations.
      3. Read \`.ai/backlog/tasks.md\` — check for \`[IN_PROGRESS]\`. If found: load workflow.md and resume.`;

    return sessionStartString;
  }

  function buildSemanticRouter() {
    const routerString = dedent`
      ## Semantic Router

      > **Token gate**: load ONLY what's triggered. Never preload skills or protocol files.
      > All cycle triggers load \`.ai/instructions/templates/workflow.md\` first. It defines all 5 phases (SPEC → PLAN → CODE → TEST → END).

      - \`feat:\` → \`.ai/commands/sdg-feat.md\` → Execute Phase SPEC → STOP
      - \`fix:\` → \`.ai/commands/sdg-fix.md\` → Execute Phase SPEC → STOP
      - \`docs:\` → \`.ai/commands/sdg-docs.md\` → Execute Phase SPEC → STOP
      - \`audit:\` → \`.ai/commands/sdg-audit.md\` → Execute Phase SPEC → STOP
      - \`land:\` → \`.ai/commands/sdg-land.md\` → Execute Phase SPEC → STOP
      - \`end:\` → \`.ai/commands/sdg-end.md\` → Execute Phase END
      - No prefix → Ask: "feat, fix, docs, audit, or land?"`;

    return routerString;
  }

  function buildSkillRouter(currentSelections) {
    const flavor = currentSelections.flavor;

    const groupedByCategory = groupSkills(SKILL_CATALOG);

    const sections = [
      '## Phase CODE — Skill Loading',
      '',
      '> Load on Phase CODE entry only. Match skills to task domain. Stack context lives in `stack.md`, already loaded at Session Start.',
      '',
    ];

    const categoryHeaders = {
      core: '**Core** (always in Phase CODE)',
      delivery: '**Delivery** (BFF + UI contract execution)',
      backend: '**Backend** (API, DB, infrastructure tasks)',
      frontend: '**Frontend** (UI, component tasks)',
      surgical: '**Surgical** (only if task directly touches domain)',
    };

    for (const category of ['core', 'delivery', 'backend', 'frontend', 'surgical']) {
      const skills = groupedByCategory[category];
      if (!skills || skills.length === 0) {
        continue;
      }

      sections.push(categoryHeaders[category]);
      for (const skill of skills) {
        sections.push(`- \`${skill.path}\` — ${skill.description}`);
      }

      sections.push('');
    }

    if (flavor && flavor !== 'none') {
      sections.push(
        '**Architectural flavor**',
        `- \`.ai/instructions/flavor/principles.md\` — Flavor: ${displayName(flavor)}`,
        ''
      );
    }

    const registryBlock = sections.join('\n').trimEnd();
    return registryBlock;
  }

  function groupSkills(skills) {
    const groups = { core: [], delivery: [], backend: [], frontend: [], surgical: [] };
    for (const skill of skills) {
      if (groups[skill.category]) {
        groups[skill.category].push(skill);
      }
    }

    const groupedResult = groups;
    return groupedResult;
  }

  function buildAgentRoles() {
    const agentRolesString = dedent`
      ## Agent Roles

      Read \`.ai/instructions/templates/agent-roles.md\` for multi-agent handoff protocol.`;

    return agentRolesString;
  }
}

/**
 * Writes `.ai/backlog/{context,stack,tasks,learned,troubleshoot}.md` at the project root.
 * Only writes each file if it does not already exist — never overwrites user content.
 */
function writeBacklogFiles(targetDirectory, selections) {
  const backlogDirectory = path.join(targetDirectory, '.ai', 'backlog');
  fileSystem.mkdirSync(backlogDirectory, { recursive: true });

  writeContextFile(backlogDirectory, targetDirectory, selections);
  writeStackFile(backlogDirectory);
  writeTasksFile(backlogDirectory);
  writeLearnedFile(backlogDirectory);
  writeTroubleshootFile(backlogDirectory);

  function detectProjectLanguage(projectDirectory) {
    const packagePath = path.join(projectDirectory, 'package.json');
    if (!fileSystem.existsSync(packagePath)) {
      const defaultLanguage = 'en';
      return defaultLanguage;
    }

    try {
      const packageData = JSON.parse(fileSystem.readFileSync(packagePath, 'utf8'));
      const deps = { ...packageData.dependencies, ...packageData.devDependencies };
      if (deps['i18next'] || deps['react-i18next']) {
        const localesDir = path.join(projectDirectory, 'src', 'locales');
        if (
          fileSystem.existsSync(localesDir) &&
          fileSystem.readdirSync(localesDir).includes('pt-BR')
        ) {
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

    if (fileSystem.existsSync(contextPath)) {
      injectPartnerSection(contextPath, partnerInfo);
      return;
    }

    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'context.md');
    let contextContent = fileSystem.readFileSync(templatePath, 'utf8');
    contextContent = contextContent
      .replace('{{PROJECT_NAME}}', path.basename(projectDirectory))
      .replace('{{STACK}}', 'declared in .ai/backlog/stack.md (run `land:` to populate)')
      .replace('{{PARTNER}}', partnerInfo);

    fileSystem.writeFileSync(contextPath, contextContent);
  }

  function injectPartnerSection(contextPath, partnerInfo) {
    const existingContent = fileSystem.readFileSync(contextPath, 'utf8');
    if (existingContent.includes('## Partner')) {
      return;
    }

    const separator = existingContent.endsWith('\n') ? '' : '\n';
    const injection = `\n## Partner\n\n${partnerInfo}\n`;
    fileSystem.appendFileSync(contextPath, `${separator}${injection}`);
  }

  function writeStackFile(backlogDirectoryPath) {
    const stackPath = path.join(backlogDirectoryPath, 'stack.md');
    if (fileSystem.existsSync(stackPath)) {
      return;
    }

    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'stack.md');
    if (!fileSystem.existsSync(templatePath)) {
      return;
    }

    fileSystem.copyFileSync(templatePath, stackPath);
  }

  function writeTasksFile(backlogDirectoryPath) {
    const tasksPath = path.join(backlogDirectoryPath, 'tasks.md');
    if (fileSystem.existsSync(tasksPath)) {
      return;
    }

    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'tasks.md');
    fileSystem.copyFileSync(templatePath, tasksPath);
  }

  function writeLearnedFile(backlogDirectoryPath) {
    const learnedPath = path.join(backlogDirectoryPath, 'learned.md');
    if (fileSystem.existsSync(learnedPath)) {
      return;
    }

    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'learned.md');
    fileSystem.copyFileSync(templatePath, learnedPath);
  }

  function writeTroubleshootFile(backlogDirectoryPath) {
    const troubleshootPath = path.join(backlogDirectoryPath, 'troubleshoot.md');
    if (fileSystem.existsSync(troubleshootPath)) {
      return;
    }

    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'backlog', 'troubleshoot.md');
    fileSystem.copyFileSync(templatePath, troubleshootPath);
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
    > Do not edit manually — regenerate with \`npx sdg-agents init\`.

    ## Auto-Load: Governance Context

    @.ai/skills/AGENTS.md
  `;

  const instructionSet = claudeContent;
  return instructionSet;
}

/**
 * Writes the universal agent config:
 *   - \`.ai/skills/AGENTS.md\` — canonical governance (consumed by any AI agent).
 *   - \`CLAUDE.md\` at repo root — thin pointer auto-loaded by Claude Code.
 *
 * Other IDEs (Cursor, Windsurf, Copilot, Gemini, Codex, Cline/Roo) should be
 * configured by the developer to read \`.ai/skills/AGENTS.md\` directly. See
 * README "Using with other IDEs" for native pointers per tool.
 */
function writeAgentConfig(targetDirectory, content) {
  const skillDir = path.join(targetDirectory, '.ai', 'skills');
  fileSystem.mkdirSync(skillDir, { recursive: true });
  fileSystem.writeFileSync(path.join(skillDir, 'AGENTS.md'), content);

  const claudePath = path.join(targetDirectory, 'CLAUDE.md');
  const claudeContent = buildClaudeContent();
  const existingClaude = fileSystem.existsSync(claudePath)
    ? fileSystem.readFileSync(claudePath, 'utf8')
    : null;

  if (existingClaude !== claudeContent) {
    fileSystem.writeFileSync(claudePath, claudeContent);
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
      entries: ['.ai/backlog/', 'tmp/', 'temp/'],
    },
  ];

  const existingContent = fileSystem.existsSync(gitignorePath)
    ? fileSystem.readFileSync(gitignorePath, 'utf8')
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

  if (blocksToAppend.length === 0) {
    return;
  }

  const separator = existingContent.length > 0 && !existingContent.endsWith('\n') ? '\n' : '';
  fileSystem.appendFileSync(gitignorePath, `${separator}\n${blocksToAppend.join('\n\n')}\n`);
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
  fileSystem.mkdirSync(aiDirectory, { recursive: true });

  const manifestPath = path.join(aiDirectory, '.sdg-manifest.json');

  const originalContent = fileSystem.existsSync(manifestPath)
    ? fileSystem.readFileSync(manifestPath, 'utf8')
    : null;

  writeJsonAtomic(manifestPath, manifest, originalContent);
}

/**
 * Injects automation scripts and configurations (Bump, Husky) if enabled.
 * Idempotent: skips if scripts/bump.mjs exists or if selections.bump is false.
 */
function writeAutomationScripts(targetDirectory, selections) {
  if (!selections.bump) {
    return;
  }

  const scriptsDir = path.join(targetDirectory, 'scripts');
  const bumpScriptPath = path.join(scriptsDir, 'bump.mjs');

  const packagePath = path.join(targetDirectory, 'package.json');
  const packageData = safeReadJson(packagePath);
  if (!packageData) {
    return;
  }

  const hasExistingBump =
    packageData.scripts &&
    (packageData.scripts.bump || packageData.scripts.release || packageData.scripts.version);

  if (hasExistingBump && !fileSystem.existsSync(bumpScriptPath)) {
    return;
  }

  if (!fileSystem.existsSync(bumpScriptPath)) {
    fileSystem.mkdirSync(scriptsDir, { recursive: true });
    const templatePath = path.join(SOURCE_INSTRUCTIONS, 'templates', 'bump.mjs');

    const templateContent = fileSystem.readFileSync(templatePath, 'utf8');
    fileSystem.writeFileSync(bumpScriptPath, templateContent);
  }

  if (!packageData.scripts) {
    packageData.scripts = {};
  }

  if (!packageData.scripts.bump) {
    packageData.scripts.bump = 'node scripts/bump.mjs';
    writeJsonAtomic(packagePath, packageData, fileSystem.readFileSync(packagePath, 'utf8'));
  }

  const huskyDirectory = path.join(targetDirectory, '.husky');
  if (fileSystem.existsSync(huskyDirectory)) {
    const prePushPath = path.join(huskyDirectory, 'pre-push');
    const nvmShim = dedent`
      # NVM Shim (Essential for projects Staff in Linux/NVM)
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    `;

    const bumpCmd = '# Pre-push check (non-mutating)\nnpm test';

    if (fileSystem.existsSync(prePushPath)) {
      const content = fileSystem.readFileSync(prePushPath, 'utf8');
      if (!content.includes('npm test')) {
        const separator = content.endsWith('\n') ? '' : '\n';
        const newPrePushContent = `${content}${separator}\n${nvmShim}\n${bumpCmd}\n`;
        fileSystem.writeFileSync(prePushPath, newPrePushContent);
      }
    } else {
      const prePushContent = dedent`
        #!/usr/bin/env sh

        ${nvmShim}

        ${bumpCmd}
      `;

      fileSystem.writeFileSync(prePushPath, prePushContent, { mode: 0o755 });
    }
  }
}

function writeToolingAssets(targetDirectory) {
  const sourceToolingDir = path.join(__dirname, '../../..', 'assets', 'tooling');
  const targetToolingDir = path.join(targetDirectory, '.ai', 'tooling');

  const hasSourceAssets = fileSystem.existsSync(sourceToolingDir);
  if (!hasSourceAssets) {
    return;
  }

  fileSystem.cpSync(sourceToolingDir, targetToolingDir, { recursive: true, force: true });

  const executableHooks = ['pre-commit', 'commit-msg'];
  for (const hookName of executableHooks) {
    const hookPath = path.join(targetToolingDir, 'husky', hookName);
    const hookExists = fileSystem.existsSync(hookPath);
    if (hookExists) {
      fileSystem.chmodSync(hookPath, 0o755);
    }
  }
}

/**
 * Removes the generated `.ai/instructions/` tree so the next regen rebuilds it from
 * the current `src/assets/instructions/` SSOT. Prevents stale files (like legacy
 * `idioms/`, `competencies/backend.md`, `competencies/frontend.md`) from surviving.
 * Scoped to `.ai/instructions/` — never touches `.ai/backlog/` (developer state).
 */
function removeGeneratedInstructions(targetDirectory) {
  const generatedInstructionsDir = path.join(targetDirectory, '.ai', 'instructions');
  if (!fileSystem.existsSync(generatedInstructionsDir)) {
    return;
  }

  fileSystem.rmSync(generatedInstructionsDir, { recursive: true, force: true });
}

export const InstructionAssembler = {
  buildMasterInstructions,
  buildClaudeContent,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
  writeAutomationScripts,
  writeToolingAssets,
  removeGeneratedInstructions,
};

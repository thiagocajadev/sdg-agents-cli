/**
 * Ruleset Injector — Copies instruction files into the target project.
 * Handles version-aware filtering of markdown/XML content blocks.
 */

import fs from 'node:fs';
import path from 'node:path';

import { STACK_DISPLAY_NAMES } from '../config/stack-display.mjs';
import { FsUtils } from './fs-utils.mjs';

const { copyRecursiveSync, filterContentByVersion, getDirname } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '..', '..', 'assets', 'instructions');
const SOURCE_WORKFLOWS = path.join(SOURCE_INSTRUCTIONS, 'workflows');
const SOURCE_COMMANDS = path.join(SOURCE_INSTRUCTIONS, 'commands');
const SOURCE_DEV_GUIDES = path.join(__dirname, '..', '..', 'assets', 'dev-guides');
const SOURCE_DEV_TRACKS = path.join(SOURCE_DEV_GUIDES, 'prompt-tracks');
const SOURCE_COMPETENCIES = path.join(SOURCE_INSTRUCTIONS, 'competencies');

/**
 * Creates the .ai/instructions directory structure in the target project.
 */
function prepareProjectStructure(targetDir) {
  const instructionsDir = path.join(targetDir, '.ai', 'instructions');
  const workflowsDir = path.join(targetDir, '.ai', 'workflows');
  const commandsDir = path.join(targetDir, '.ai', 'commands');

  if (!fs.existsSync(instructionsDir)) fs.mkdirSync(instructionsDir, { recursive: true });
  if (!fs.existsSync(workflowsDir)) fs.mkdirSync(workflowsDir, { recursive: true });
  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });
}

/**
 * Injects core, flavor, idiom, and template rulesets into the target project.
 */
function injectRulesets(targetDir, selections, { noDevGuides = false } = {}) {
  const { flavor, idioms } = selections;
  const projectAiInstructions = path.join(targetDir, '.ai', 'instructions');

  copyRecursiveSync(
    path.join(SOURCE_INSTRUCTIONS, 'core'),
    path.join(projectAiInstructions, 'core')
  );

  const flavorSrc = path.join(SOURCE_INSTRUCTIONS, 'flavors', flavor);
  if (fs.existsSync(flavorSrc)) {
    copyRecursiveSync(flavorSrc, path.join(projectAiInstructions, 'flavor'));
  }

  for (const idiom of idioms) {
    injectFilteredIdiom(idiom, selections.versions[idiom], projectAiInstructions);
  }

  injectCompetencies(selections, projectAiInstructions);

  copyRecursiveSync(
    path.join(SOURCE_INSTRUCTIONS, 'templates'),
    path.join(projectAiInstructions, 'templates')
  );

  if (fs.existsSync(SOURCE_WORKFLOWS)) {
    copyRecursiveSync(SOURCE_WORKFLOWS, path.join(targetDir, '.ai', 'workflows'));
  }

  if (fs.existsSync(SOURCE_COMMANDS)) {
    copyRecursiveSync(SOURCE_COMMANDS, path.join(targetDir, '.ai', 'commands'));
  }

  if (!noDevGuides) injectDevGuides(targetDir);
}

/**
 * Copies dev-guides (reference files, spec templates, guides) into the target project.
 * Always included alongside the instruction set.
 */
function injectDevGuides(targetDir) {
  if (!fs.existsSync(SOURCE_DEV_GUIDES)) return;
  copyRecursiveSync(SOURCE_DEV_GUIDES, path.join(targetDir, '.ai', 'dev-guides'));
}

/**
 * Injects specification templates (tracks) into the target project.
 */
function injectPrompts(targetDir, track) {
  const projectRootPromptsDir = path.join(targetDir, '.ai', 'prompts');
  const devTracksDir = path.join(projectRootPromptsDir, 'dev-tracks');

  // Total replacement: clear the WHOLE .ai/prompts directory if it exists
  if (fs.existsSync(projectRootPromptsDir)) {
    fs.rmSync(projectRootPromptsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(devTracksDir, { recursive: true });

  if (track === 'all') {
    // Copy all tracks from source to project
    copyRecursiveSync(SOURCE_DEV_TRACKS, devTracksDir);
  } else {
    // Copy specific track folder into dev-tracks
    const trackSrc = path.join(SOURCE_DEV_TRACKS, track);
    const dest = path.join(devTracksDir, track);
    if (fs.existsSync(trackSrc)) {
      copyRecursiveSync(trackSrc, dest);
    }
  }
}

/**
 * Collects the list of directories and files that would be created (for --dry-run).
 */
function collectOutputSummary(selections) {
  const { mode, flavor, idioms, track } = selections;
  const directories = [];

  if (mode === 'agents') {
    directories.push('.ai/instructions/core/');
    if (flavor) directories.push('.ai/instructions/flavor/');
    for (const idiom of idioms) directories.push(`.ai/instructions/idioms/${idiom}/`);
    directories.push('.ai/instructions/templates/');
    directories.push('.ai/instructions/competencies/');
    directories.push('.ai/workflows/');
    directories.push('.ai/commands/');
    directories.push('.ai/dev-guides/');
  } else if (mode === 'prompts') {
    if (track) directories.push('.ai/prompts/dev-tracks/');
  }

  return { directories };
}

// --- Private ---

function injectCompetencies(selections, projectAiInstructions) {
  if (!fs.existsSync(SOURCE_COMPETENCIES)) return;

  const hasBackend = selections.idioms.some((idiomId) => STACK_DISPLAY_NAMES[idiomId]?.isBackend);
  const hasFrontend = selections.idioms.some((idiomId) => STACK_DISPLAY_NAMES[idiomId]?.isFrontend);

  if (!hasBackend && !hasFrontend) return;

  const competenciesDir = path.join(projectAiInstructions, 'competencies');
  if (!fs.existsSync(competenciesDir)) fs.mkdirSync(competenciesDir, { recursive: true });

  if (hasBackend) {
    const src = path.join(SOURCE_COMPETENCIES, 'backend.md');
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(competenciesDir, 'backend.md'));
  }

  if (hasFrontend) {
    const src = path.join(SOURCE_COMPETENCIES, 'frontend.md');
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(competenciesDir, 'frontend.md'));
  }
}

function injectFilteredIdiom(idiom, targetVersion, projectAiInstructions) {
  const idiomSrc = path.join(SOURCE_INSTRUCTIONS, 'idioms', idiom);
  if (!fs.existsSync(idiomSrc)) return;

  const projectIdiomDir = path.join(projectAiInstructions, 'idioms', idiom);
  if (!fs.existsSync(projectIdiomDir)) fs.mkdirSync(projectIdiomDir, { recursive: true });

  for (const file of fs.readdirSync(idiomSrc)) {
    const srcFile = path.join(idiomSrc, file);
    const destFile = path.join(projectIdiomDir, file);

    if (file.endsWith('.md') || file.endsWith('.xml')) {
      let content = fs.readFileSync(srcFile, 'utf8');
      content = filterContentByVersion(content, targetVersion);
      fs.writeFileSync(destFile, content, 'utf8');
    } else {
      copyRecursiveSync(srcFile, destFile);
    }
  }
}

export const RulesetInjector = {
  prepareProjectStructure,
  injectRulesets,
  injectDevGuides,
  injectPrompts,
  collectOutputSummary,
};

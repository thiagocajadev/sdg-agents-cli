import fs from 'node:fs';
import path from 'node:path';

import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';
import { FsUtils } from '../core/fs-utils.mjs';

const { copyRecursiveSync, filterContentByVersion, getDirname } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '../../..', 'assets', 'instructions');
const SOURCE_COMMANDS = path.join(SOURCE_INSTRUCTIONS, 'commands');
const SOURCE_DEV_GUIDES = path.join(__dirname, '../../..', 'assets', 'dev-guides');
const SOURCE_DEV_TRACKS = path.join(SOURCE_DEV_GUIDES, 'prompt-tracks');
const SOURCE_COMPETENCIES = path.join(SOURCE_INSTRUCTIONS, 'competencies');

function prepareProjectStructure(targetDirectory) {
  const instructionsDir = path.join(targetDirectory, '.ai', 'instructions');
  const commandsDir = path.join(targetDirectory, '.ai', 'commands');

  fs.mkdirSync(instructionsDir, { recursive: true });
  fs.mkdirSync(commandsDir, { recursive: true });
}

function injectRulesets(
  targetDirectory,
  selections,
  { noDevGuides = true, noCreative = true } = {}
) {
  const { flavor, idioms } = selections;
  const projectAiInstructions = path.join(targetDirectory, '.ai', 'instructions');

  copyRecursiveSync(
    path.join(SOURCE_INSTRUCTIONS, 'core'),
    path.join(projectAiInstructions, 'core'),
    { exclude: ['creative'] }
  );

  const flavorSrc = path.join(SOURCE_INSTRUCTIONS, 'flavors', flavor);
  if (fs.existsSync(flavorSrc)) {
    copyRecursiveSync(flavorSrc, path.join(projectAiInstructions, 'flavor'));
  }

  for (const idiomFolderKey of idioms) {
    injectFilteredIdiom(idiomFolderKey, selections.versions[idiomFolderKey], projectAiInstructions);
  }

  injectCompetencies(selections, projectAiInstructions);

  copyRecursiveSync(
    path.join(SOURCE_INSTRUCTIONS, 'templates'),
    path.join(projectAiInstructions, 'templates')
  );

  if (fs.existsSync(SOURCE_COMMANDS)) {
    copyRecursiveSync(SOURCE_COMMANDS, path.join(targetDirectory, '.ai', 'commands'));
  }

  if (!noDevGuides) injectDevGuides(targetDirectory);
  if (!noCreative) injectCreativeToolkit(targetDirectory);
}

function injectDevGuides(targetDirectory) {
  if (!fs.existsSync(SOURCE_DEV_GUIDES)) return;
  copyRecursiveSync(SOURCE_DEV_GUIDES, path.join(targetDirectory, '.ai', 'dev-guides'));
}

function injectPrompts(targetDirectory, track) {
  const projectRootPromptsDir = path.join(targetDirectory, '.ai', 'prompts');
  const devTracksDir = path.join(projectRootPromptsDir, 'dev-tracks');

  if (fs.existsSync(projectRootPromptsDir)) {
    fs.rmSync(projectRootPromptsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(devTracksDir, { recursive: true });

  if (track === 'all') {
    copyRecursiveSync(SOURCE_DEV_TRACKS, devTracksDir);
  } else {
    const trackSrc = path.join(SOURCE_DEV_TRACKS, track);
    const dest = path.join(devTracksDir, track);
    if (fs.existsSync(trackSrc)) {
      copyRecursiveSync(trackSrc, dest);
    }
  }
}

function collectOutputSummary(selections) {
  const { mode, flavor, idioms, track, devGuides = false } = selections;
  const directories = [];

  if (mode === 'agents') {
    directories.push('.ai/instructions/core/');
    if (flavor) directories.push('.ai/instructions/flavor/');
    for (const idiom of idioms) directories.push(`.ai/instructions/idioms/${idiom}/`);
    directories.push('.ai/instructions/templates/');
    directories.push('.ai/instructions/competencies/');
    directories.push('.ai/commands/');
    if (devGuides) directories.push('.ai/dev-guides/');
    directories.push('.ai/instructions/creative/');
    directories.push('.ai/instructions/creative/templates/');
    directories.push('.ai/instructions/creative/guides/');
  } else if (mode === 'prompts') {
    if (track) directories.push('.ai/prompts/dev-tracks/');
  }

  const summary = { directories };
  return summary;
}

function injectCreativeToolkit(targetDirectory) {
  const sourceCreative = path.join(SOURCE_INSTRUCTIONS, 'core', 'creative');
  const sourceCreativePrompts = path.join(SOURCE_INSTRUCTIONS, 'templates', 'creatives');
  const sourceCreativeGuides = path.join(sourceCreativePrompts, 'guides');

  const destRoot = path.join(targetDirectory, '.ai', 'instructions', 'creative');

  const oldPrompts = path.join(targetDirectory, '.ai', 'prompts', 'creatives');
  const oldGuides = path.join(targetDirectory, '.ai', 'dev-guides', 'creatives');
  if (fs.existsSync(oldPrompts)) fs.rmSync(oldPrompts, { recursive: true, force: true });
  if (fs.existsSync(oldGuides)) fs.rmSync(oldGuides, { recursive: true, force: true });

  fs.mkdirSync(destRoot, { recursive: true });

  if (fs.existsSync(sourceCreative)) {
    copyRecursiveSync(sourceCreative, destRoot);
  }

  if (fs.existsSync(sourceCreativePrompts)) {
    copyRecursiveSync(sourceCreativePrompts, path.join(destRoot, 'templates'), {
      exclude: ['guides'],
    });
  }

  if (fs.existsSync(sourceCreativeGuides)) {
    copyRecursiveSync(sourceCreativeGuides, path.join(destRoot, 'guides'));
  }
}

function injectCompetencies(selections, projectAiInstructions) {
  if (!fs.existsSync(SOURCE_COMPETENCIES)) return;

  const hasBackend = selections.idioms.some(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isBackend
  );
  const hasFrontend = selections.idioms.some(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isFrontend
  );

  if (!hasBackend && !hasFrontend) return;

  const competenciesDir = path.join(projectAiInstructions, 'competencies');
  fs.mkdirSync(competenciesDir, { recursive: true });

  if (hasBackend) {
    const src = path.join(SOURCE_COMPETENCIES, 'backend.md');
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(competenciesDir, 'backend.md'));
  }

  if (hasFrontend) {
    const src = path.join(SOURCE_COMPETENCIES, 'frontend.md');
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(competenciesDir, 'frontend.md'));
  }
}

function injectFilteredIdiom(idiomFolderKey, targetVersion, projectAiInstructions) {
  const idiomSrc = path.join(SOURCE_INSTRUCTIONS, 'idioms', idiomFolderKey);
  if (!fs.existsSync(idiomSrc)) return;

  const projectIdiomDir = path.join(projectAiInstructions, 'idioms', idiomFolderKey);
  fs.mkdirSync(projectIdiomDir, { recursive: true });

  for (const fileName of fs.readdirSync(idiomSrc)) {
    const srcFile = path.join(idiomSrc, fileName);
    const destFile = path.join(projectIdiomDir, fileName);

    if (fileName.endsWith('.md') || fileName.endsWith('.xml')) {
      let content = fs.readFileSync(srcFile, 'utf8');
      if (content.includes('version=')) {
        content = filterContentByVersion(content, targetVersion);
      }
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
  injectCreativeToolkit,
};

import fs from 'node:fs';
import path from 'node:path';

import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';
import { FsUtils } from '../core/fs-utils.mjs';

const { copyRecursiveSync, filterContentByVersion, getDirname } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '../../..', 'assets', 'instructions');
const SOURCE_COMMANDS = path.join(SOURCE_INSTRUCTIONS, 'commands');
const SOURCE_COMPETENCIES = path.join(SOURCE_INSTRUCTIONS, 'competencies');

function prepareProjectStructure(targetDirectory) {
  const instructionsDir = path.join(targetDirectory, '.ai', 'instructions');
  const commandsDir = path.join(targetDirectory, '.ai', 'commands');

  fs.mkdirSync(instructionsDir, { recursive: true });
  fs.mkdirSync(commandsDir, { recursive: true });
}

function injectRulesets(targetDirectory, selections) {
  const { flavor, idioms } = selections;
  const projectAiInstructions = path.join(targetDirectory, '.ai', 'instructions');

  copyRecursiveSync(
    path.join(SOURCE_INSTRUCTIONS, 'core'),
    path.join(projectAiInstructions, 'core')
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
}

function collectOutputSummary(selections) {
  const { flavor, idioms } = selections;
  const directories = [];

  directories.push('.ai/instructions/core/');
  if (flavor) directories.push('.ai/instructions/flavor/');
  for (const idiom of idioms) directories.push(`.ai/instructions/idioms/${idiom}/`);
  directories.push('.ai/instructions/templates/');
  directories.push('.ai/instructions/competencies/');
  directories.push('.ai/commands/');

  const summary = { directories };
  return summary;
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
  collectOutputSummary,
};

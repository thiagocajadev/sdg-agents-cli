import fs from 'node:fs';
import path from 'node:path';
import dedent from 'dedent';
import { PromptUtils } from '../../lib/infra/prompt-utils.mjs';
import { ManifestUtils } from '../../lib/domain/manifest-utils.mjs';
import { DisplayUtils } from '../../lib/core/display-utils.mjs';
import { ResultUtils } from '../../lib/core/result-utils.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const { printPromptUI, isMaintainerMode } = PromptUtils;
const { loadManifest } = ManifestUtils;
const { displayName } = DisplayUtils;
const { success } = ResultUtils;
const { getDirname, bootstrapIfDirect } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_ROOT = path.join(__dirname, '../../..');
const SOURCE_INSTRUCTIONS = path.join(SOURCE_ROOT, 'assets', 'instructions');

const PROJECT_ROOT = process.cwd();
const TODAY = new Date().toISOString().split('T')[0];

async function syncRulesets() {
  const syncResult = await orchestrateRulesetSync();
  return syncResult;
}

async function orchestrateRulesetSync() {
  const manifest = loadManifest(PROJECT_ROOT);
  if (!manifest) {
    console.log(
      '\n  No manifest found (.ai/.sdg-manifest.json). Run "Build Project Context" first.\n'
    );
    const noManifestResult = success();
    return noManifestResult;
  }

  const targets = resolveTargets(manifest);
  if (targets.length === 0) {
    console.log('\n  No idiom-specific rulesets to sync.\n');
    const noTargetsResult = success();
    return noTargetsResult;
  }

  const maintainer = isMaintainerMode();
  const prompt = buildPrompt(manifest, targets, maintainer);
  await printPromptUI(prompt, 'Spec Driven Guide — Sync Patterns');

  const orchestrateResult = success();
  return orchestrateResult;
}

function resolveTargets(manifest) {
  const { selections } = manifest;
  const { idioms, versions } = selections;
  const targets = [];

  // Idiom-specific patterns
  for (const idiom of idioms) {
    let filePath = path.join(PROJECT_ROOT, '.ai', 'instructions', 'idioms', idiom, 'patterns.md');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(SOURCE_INSTRUCTIONS, 'idioms', idiom, 'patterns.md');
    }

    if (!fs.existsSync(filePath)) continue;

    targets.push({
      idiom,
      filePath,
      version: versions?.[idiom] ?? null,
      label: displayName(idiom),
    });
  }

  // Core UI standards (Universal Design System)
  const uiSourceDir = path.join(SOURCE_INSTRUCTIONS, 'core', 'ui');
  if (fs.existsSync(uiSourceDir)) {
    const uiFiles = fs.readdirSync(uiSourceDir).filter((file) => file.endsWith('.md'));
    for (const file of uiFiles) {
      let filePath = path.join(PROJECT_ROOT, '.ai', 'instructions', 'core', 'ui', file);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(uiSourceDir, file);
      }

      const key = file.replace('.md', '');
      targets.push({
        idiom: key,
        filePath,
        version: null,
        label: `Core UI: ${displayName(key)}`,
      });
    }
  }

  const resolvedTargets = targets;
  return resolvedTargets;
}

function buildPrompt(_manifest, targets, maintainer) {
  const sections = targets
    .flatMap((target) => {
      try {
        const content = fs.readFileSync(target.filePath, 'utf8');
        const sectionContent = [renderTargetSection(target, content)];
        return sectionContent;
      } catch (error) {
        const warningLine = `\n  Warning: could not read ${target.filePath} — ${error.message}`;
        console.error(warningLine);
        const emptyResult = [];
        return emptyResult;
      }
    })
    .join('\n');

  const maintainerNote = maintainer ? renderMaintainerNote() : '';
  const syncPrompt = renderSyncPrompt(sections, maintainerNote);
  return syncPrompt;
}

function renderTargetSection(target, content) {
  const versionLabel = target.version ?? 'any';
  const fileName = path.basename(target.filePath);
  const sectionText = dedent`

    ## ${target.label} (Current Version: ${versionLabel}) — ${fileName}

    <current_content>
    ${content}
    </current_content>`;
  return sectionText;
}

function renderMaintainerNote() {
  const noteText = dedent`
    NOTE: You are in MAINTAINER MODE. Please return the updated rules for the core library paths:
    - src/assets/instructions/idioms/<idiom>/patterns.md
    - src/assets/skills/ui-ux.md`;
  return noteText;
}

function renderSyncPrompt(sections, maintainerNote) {
  const promptText = dedent`

    Today is ${TODAY}.

    Search the official release notes and "What's New" docs for the technologies and UI/UX standards below.
    Compare against each current markdown file and identify what needs updating.

    For each file, return:
    1. A list of changes found, classified as:
       - BREAKING: syntax/API/Pattern change that would make the AI generate wrong/deprecated code or outdated UI
       - NEW CONVENTION: new recommended pattern, accessible syntax, or design trend introduced recently

    2. The complete updated markdown content with the changes applied.

    ${maintainerNote}

    Rules:
    - Only report changes found in official sources or established UI/UX standards (MDN, WCAG, Framework blogs) — do not invent.
    - For BREAKING changes: remove deprecated patterns, replace with new ones.
    - For NEW CONVENTION: integrate into the relevant existing section without adding new sections.
    - Preserve the existing file structure, tone, and formatting.
    - If nothing needs updating, say so and return the file unchanged.
    ${sections}
  `;
  return promptText;
}

export const Syncer = {
  sync: syncRulesets,
};

bootstrapIfDirect(import.meta.url, syncRulesets);

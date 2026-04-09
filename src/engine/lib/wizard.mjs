import fs from 'node:fs';
import path from 'node:path';
import { STACK_VERSIONS } from '../config/stack-versions.mjs';
import { STACK_DISPLAY_NAMES } from '../config/stack-display.mjs';
import { DisplayUtils } from './display-utils.mjs';
import { FsUtils } from './fs-utils.mjs';
import { ResultUtils } from './result-utils.mjs';
import { PromptUtils } from './prompt-utils.mjs';

const { displayName } = DisplayUtils;
const { getDirectories, getDirname } = FsUtils;
const { success, fail } = ResultUtils;
const { safeSelect, safeConfirm } = PromptUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '..', '..', 'assets', 'instructions');

/**
 * Orchestrator: Full Wizard for Gathering User Selections
 */
async function gatherUserSelections(targetDir = process.cwd()) {
  const availableFlavors = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'flavors'));
  const availableIdioms = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'idioms'));
  const availableTracks = getDirectories(
    path.join(__dirname, '..', '..', 'assets', 'dev-guides', 'prompt-tracks')
  );

  let selections = {
    mode: 'agents',
    flavor: 'vertical-slice',
    idioms: [],
    versions: {},
    track: null,
    ide: 'none',
  };
  let scope = 'fullstack';
  let step = 0;

  // Final step for Agents is 8, for Prompts it's a shorter flow.
  const finalStep = () => (selections.mode === 'prompts' ? 2 : 8);

  while (step < finalStep()) {
    const context = {
      scope,
      step,
      selections,
      availableFlavors,
      availableIdioms,
      availableTracks,
      targetDir,
    };
    const stepResult = await executeWizardStep(step, context);

    if (stepResult.isFailure) return stepResult;

    if (stepResult.value.mode === 'quick') {
      return handleQuickSetup();
    }

    step = stepResult.value.nextStep;
    scope = stepResult.value.scope ?? scope;
    if (stepResult.value.mode) selections.mode = stepResult.value.mode;
    if (stepResult.value.flavor) selections.flavor = stepResult.value.flavor;
    if (stepResult.value.track) selections.track = stepResult.value.track;
    if (stepResult.value.versions) {
      Object.assign(selections.versions, stepResult.value.versions);
      selections.idioms = Array.from(new Set(selections.idioms));
    }
    if (stepResult.value.designPreset) selections.designPreset = stepResult.value.designPreset;
    if (stepResult.value.idiom) selections.idioms.push(stepResult.value.idiom);
    if (stepResult.value.ide) selections.ide = stepResult.value.ide;
    if (stepResult.value.undoLastIdiom) selections.idioms.pop();
    if (stepResult.value.resetIdioms) selections.idioms = [];
  }

  return success(selections);
}

// --- Private: Wizard Step Dispatcher ---

async function executeWizardStep(step, context) {
  const { mode } = context.selections;

  switch (step) {
    case 0:
      return promptInitialChoice();
    case 1:
      return mode === 'prompts' ? promptTrackSelection(context) : promptProjectScope();
    case 2:
      return promptArchitectureFlavor(context);
    case 3:
      return promptBackendIdiom(context);
    case 4:
      return promptFrontendIdiom(context);
    case 5:
      return promptVersionSelections(context);
    case 6:
      return promptDesignPreset(context);
    case 7:
      return promptIdeSelection();
    default:
      return success({ nextStep: 8 });
  }
}

async function promptInitialChoice() {
  const result = await safeSelect({
    message: 'What would you like to do?',
    choices: [
      {
        name: '1. Set up this project — install the instruction set and working protocol',
        value: 'agents',
      },
      {
        name: '2. Quick setup — install with defaults (lite + JS/TS, includes everything)',
        value: 'quick',
      },
      { name: '3. Back', value: 'back' },
    ],
  });
  if (result === 'back') return fail('', 'USER_BACK');
  return success({ nextStep: 1, mode: result });
}

function handleQuickSetup() {
  return success({
    mode: 'quick',
    flavor: 'lite',
    idioms: ['javascript', 'typescript'],
    track: '00-lite-mode',
    designPreset: 'glass',
    ide: 'none',
    versions: {
      javascript: 'latest',
      typescript: 'latest',
    },
  });
}

async function promptTrackSelection(context) {
  const { availableTracks } = context;

  const sortedTrackChoices = availableTracks
    .sort()
    .map((t) => {
      let label = displayName(t);
      if (t === '00-lite-mode') label = '1. Lite Mode (Simple & Agile)';
      else if (t === '01-new-evolution') label = '2. New Evolution (Greenfield)';
      else if (t === '02-legacy-modernization') label = '3. Legacy Modernization (Brownfield)';
      return { name: label, value: t };
    })
    .sort((a, b) => a.value.localeCompare(b.value));

  const trackChoices = [
    ...sortedTrackChoices,
    { name: '4. All Tracks (Best for Full Learning)', value: 'all' },
  ];

  const track = await safeSelect({
    message: 'Which specification track best fits your project?',
    choices: [...trackChoices, { name: '5. Back', value: 'back' }],
  });

  if (track === 'back') return success({ nextStep: 0 });

  const projectPromptsDir = path.join(context.targetDir, '.ai', 'prompts');
  if (fs.existsSync(projectPromptsDir)) {
    const proceed = await safeConfirm({
      message: `The directory ".ai/prompts" already exists. Overwrite?`,
      default: false,
    });
    if (!proceed) return success({ nextStep: 1 });
  }

  return success({ nextStep: 2, track }); // For Prompts, 2 is the final step
}

async function promptProjectScope() {
  const scope = await safeSelect({
    message: 'What type of project is this for the AI Agents?',
    choices: [
      { name: '1. Backend   — server, API, logic, DB (Single Idiom)', value: 'backend' },
      { name: '2. Frontend  — UI, browser, client-side (Single Idiom)', value: 'frontend' },
      { name: '3. FullStack — Both combined (Multi-Idiom)', value: 'fullstack' },
      { name: '4. Back', value: 'back' },
    ],
  });

  if (scope === 'back') return success({ nextStep: 0 });

  return success({ nextStep: 2, scope });
}

async function promptArchitectureFlavor(context) {
  const { availableFlavors } = context;
  const flavorChoices = buildFlavorChoices(availableFlavors);

  const flavor = await safeSelect({
    message: 'Which architecture flavor should the project follow?',
    choices: [...flavorChoices, { name: 'Back', value: 'back' }],
  });

  if (flavor === 'back') return success({ nextStep: 1 });

  return success({ nextStep: 3, flavor });
}

async function promptBackendIdiom(context) {
  const { scope, availableIdioms } = context;
  if (scope === 'frontend') return success({ nextStep: 4 });

  const backendIdioms = availableIdioms.filter((id) => STACK_DISPLAY_NAMES[id]?.isBackend);
  const result = await safeSelect({
    message: 'Which Backend idiom / language?',
    choices: [
      ...backendIdioms.map((id) => ({ name: STACK_DISPLAY_NAMES[id]?.name ?? id, value: id })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') return success({ nextStep: 0 });

  return success({ nextStep: 4, idiom: result });
}

async function promptFrontendIdiom(context) {
  const { scope, availableIdioms } = context;
  if (scope === 'backend') return success({ nextStep: 5 });

  const frontendIdioms = availableIdioms.filter((id) => STACK_DISPLAY_NAMES[id]?.isFrontend);
  const result = await safeSelect({
    message: 'Which Frontend idiom / framework?',
    choices: [
      ...frontendIdioms.map((id) => ({ name: STACK_DISPLAY_NAMES[id]?.name ?? id, value: id })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    return success({ nextStep: 2, undoLastIdiom: scope === 'fullstack' });
  }

  return success({ nextStep: 5, idiom: result });
}

async function promptVersionSelections(context) {
  const { selections } = context;
  const versions = {};

  for (const idiom of selections.idioms) {
    const available = STACK_VERSIONS.idioms?.[idiom] || [];
    if (available.length === 0) continue;
    if (available.length === 1) {
      versions[idiom] = available[0].value;
      continue;
    }

    const result = await safeSelect({
      message: `Which version of ${displayName(idiom)}?`,
      choices: [
        ...available.map((v) => ({ name: v.name, value: v.value })),
        { name: 'Back', value: 'back' },
      ],
    });

    if (result === 'back') return success({ nextStep: 2, resetIdioms: true });
    versions[idiom] = result;
  }

  return success({ nextStep: 6, versions });
}

async function promptDesignPreset(context) {
  const { selections } = context;

  const hasFrontend = selections.idioms.some((id) => STACK_DISPLAY_NAMES[id]?.isFrontend);
  if (!hasFrontend) return success({ nextStep: 7 });

  const result = await safeSelect({
    message: 'Which initial Design Preset / Skill?',
    choices: [
      { name: '1. Bento (Magazine Grids)', value: 'bento' },
      { name: '2. Glass (Frosted Translucency)', value: 'glass' },
      { name: '3. Clean (Modern Minimalist)', value: 'clean' },
      { name: '4. Mono (Technical Monospaced)', value: 'mono' },
      { name: '5. Neobrutalism (Bold/High-Contrast)', value: 'neobrutalism' },
      { name: '6. Paper (Tactile/Editoral)', value: 'paper' },
      { name: '7. Organic (Soft/Rounded)', value: 'organic' },
      { name: '8. Other (no specific preset)', value: 'other' },
      { name: '9. Back', value: 'back' },
    ],
  });

  if (result === 'back') return success({ nextStep: 4 });
  if (result === 'other') return success({ nextStep: 7 });

  return success({ nextStep: 7, designPreset: result });
}

async function promptIdeSelection() {
  const result = await safeSelect({
    message: 'Which Primary IDE / AI Agent should perform Auto-Load?',
    choices: [
      { name: '1. Claude Code (CLAUDE.md)', value: 'claude' },
      { name: '2. Antigravity / Raw (.ai/skill/AGENTS.md only)', value: 'none' },
      { name: '3. GitHub Copilot (.github/copilot-instructions.md)', value: 'vscode' },
      { name: '4. Cursor (.cursorrules)', value: 'cursor' },
      { name: '5. Windsurf (.windsurfrules)', value: 'windsurf' },
      { name: '6. Cline / Roo Code (.clinerules)', value: 'roocode' },
      { name: '7. All — write every config file', value: 'all' },
      { name: '8. Back', value: 'back' },
    ],
  });

  if (result === 'back') return success({ nextStep: 6 });

  return success({ nextStep: 8, ide: result });
}

function buildFlavorChoices(availableFlavors) {
  return availableFlavors
    .sort()
    .map((f) => {
      let label = displayName(f);
      if (f === 'lite') label = `0. ${label} (Simple & Agile)`;
      else if (f === 'vertical-slice') label = `1. ${label} (Recommended)`;
      else if (f === 'mvc') label = `2. ${label} (Standard Layers)`;
      else if (f === 'legacy') label = `3. ${label} (Event-Driven / SSR)`;
      else label = `Sub. ${label}`;
      return { name: label, value: f };
    })
    .sort((a, b) => {
      const order = { lite: 0, 'vertical-slice': 1, mvc: 2, legacy: 3 };
      return (order[a.value] ?? 99) - (order[b.value] ?? 99);
    });
}

// --- Non-Interactive Helpers ---

/**
 * Validates that flavor and idioms exist on disk.
 * Used by non-interactive CLI mode to catch typos early.
 */
function validateSelections(selections) {
  if (selections.mode === 'quick') {
    selections.flavor = selections.flavor || 'lite';
    selections.idioms = selections.idioms?.length
      ? selections.idioms
      : ['javascript', 'typescript'];
    selections.track = selections.track || '00-lite-mode';
    selections.designPreset = selections.designPreset || 'glass';
    selections.ide = selections.ide || 'none';
    return success(selections);
  }

  if (selections.mode === 'prompts') {
    if (!selections.track) return fail('--track is required for prompts mode.', 'MISSING_TRACK');
    return success(selections);
  }

  const availableFlavors = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'flavors'));
  const availableIdioms = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'idioms'));

  if (!selections.flavor) {
    return fail('--flavor is required.', 'MISSING_FLAVOR');
  }

  if (!availableFlavors.includes(selections.flavor)) {
    return fail(
      `Unknown flavor: "${selections.flavor}". Available: ${availableFlavors.join(', ')}`,
      'INVALID_FLAVOR'
    );
  }

  if (!selections.idioms || selections.idioms.length === 0) {
    return fail('At least one --idiom is required.', 'MISSING_IDIOM');
  }

  for (const idiom of selections.idioms) {
    if (!availableIdioms.includes(idiom)) {
      return fail(
        `Unknown idiom: "${idiom}". Available: ${availableIdioms.join(', ')}`,
        'INVALID_IDIOM'
      );
    }
  }

  return success(selections);
}

/**
 * Auto-selects the latest (first) version for each idiom when not specified.
 */
function autoSelectVersions(selections) {
  if (!selections.versions) selections.versions = {};

  for (const idiom of selections.idioms) {
    if (selections.versions[idiom]) continue;

    const versions = STACK_VERSIONS.idioms?.[idiom] || [];
    if (versions.length > 0) {
      selections.versions[idiom] = versions[0].value;
    }
  }
}

export const WizardUtils = {
  gatherUserSelections,
  validateSelections,
  autoSelectVersions,
};

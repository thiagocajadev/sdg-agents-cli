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
    scope = applyStepResult(selections, scope, stepResult.value);
  }

  const wizardResult = success(selections);
  return wizardResult;

  function applyStepResult(currentSelections, currentScope, stepValue) {
    const nextScope = stepValue.scope ?? currentScope;
    if (stepValue.mode) currentSelections.mode = stepValue.mode;
    if (stepValue.flavor) currentSelections.flavor = stepValue.flavor;
    if (stepValue.track) currentSelections.track = stepValue.track;
    if (stepValue.versions) {
      Object.assign(currentSelections.versions, stepValue.versions);
      currentSelections.idioms = Array.from(new Set(currentSelections.idioms));
    }
    if (stepValue.designPreset) currentSelections.designPreset = stepValue.designPreset;
    if (stepValue.idiom) currentSelections.idioms.push(stepValue.idiom);
    if (stepValue.ide) currentSelections.ide = stepValue.ide;
    if (stepValue.undoLastIdiom) currentSelections.idioms.pop();
    if (stepValue.resetIdioms) currentSelections.idioms = [];
    return nextScope;
  }
}

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
    default: {
      const defaultResult = success({ nextStep: 8 });
      return defaultResult;
    }
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

  if (result === 'back') {
    const backResult = fail('', 'USER_BACK');
    return backResult;
  }

  const initialChoiceResult = success({ nextStep: 1, mode: result });
  return initialChoiceResult;
}

function handleQuickSetup() {
  const quickSetupResult = success({
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
  return quickSetupResult;
}

async function promptTrackSelection(context) {
  const { availableTracks } = context;

  const sortedTrackChoices = [...availableTracks]
    .sort((trackA, trackB) => trackA.localeCompare(trackB))
    .map((trackId) => {
      let label = displayName(trackId);
      if (trackId === '00-lite-mode') label = '1. Lite Mode (Simple & Agile)';
      else if (trackId === '01-new-evolution') label = '2. New Evolution (Greenfield)';
      else if (trackId === '02-legacy-modernization')
        label = '3. Legacy Modernization (Brownfield)';
      return { name: label, value: trackId };
    });

  const trackChoices = [
    ...sortedTrackChoices,
    { name: '4. All Tracks (Best for Full Learning)', value: 'all' },
  ];

  const track = await safeSelect({
    message: 'Which specification track best fits your project?',
    choices: [...trackChoices, { name: '5. Back', value: 'back' }],
  });

  if (track === 'back') {
    const backResult = success({ nextStep: 0 });
    return backResult;
  }

  const projectPromptsDir = path.join(context.targetDir, '.ai', 'prompts');
  if (fs.existsSync(projectPromptsDir)) {
    const proceed = await safeConfirm({
      message: `The directory ".ai/prompts" already exists. Overwrite?`,
      default: false,
    });
    if (!proceed) {
      const cancelResult = success({ nextStep: 1 });
      return cancelResult;
    }
  }

  // 2 is the final step for Prompts mode
  const trackResult = success({ nextStep: 2, track });
  return trackResult;
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

  if (scope === 'back') {
    const backResult = success({ nextStep: 0 });
    return backResult;
  }

  const scopeResult = success({ nextStep: 2, scope });
  return scopeResult;
}

async function promptArchitectureFlavor(context) {
  const { availableFlavors } = context;
  const flavorChoices = buildFlavorChoices(availableFlavors);

  const flavor = await safeSelect({
    message: 'Which architecture flavor should the project follow?',
    choices: [...flavorChoices, { name: 'Back', value: 'back' }],
  });

  if (flavor === 'back') {
    const backResult = success({ nextStep: 1 });
    return backResult;
  }

  const flavorResult = success({ nextStep: 3, flavor });
  return flavorResult;

  function buildFlavorChoices(flavors) {
    return flavors
      .sort()
      .map((flavorId) => {
        let label = displayName(flavorId);
        if (flavorId === 'lite') label = `0. ${label} (Simple & Agile)`;
        else if (flavorId === 'vertical-slice') label = `1. ${label} (Recommended)`;
        else if (flavorId === 'mvc') label = `2. ${label} (Standard Layers)`;
        else if (flavorId === 'legacy') label = `3. ${label} (Event-Driven / SSR)`;
        else label = `Sub. ${label}`;
        return { name: label, value: flavorId };
      })
      .sort((flavorA, flavorB) => {
        const order = { lite: 0, 'vertical-slice': 1, mvc: 2, legacy: 3 };
        return (order[flavorA.value] ?? 99) - (order[flavorB.value] ?? 99);
      });
  }
}

async function promptBackendIdiom(context) {
  const { scope, availableIdioms } = context;

  if (scope === 'frontend') {
    const skipResult = success({ nextStep: 4 });
    return skipResult;
  }

  const backendIdioms = availableIdioms.filter((id) => STACK_DISPLAY_NAMES[id]?.isBackend);
  const result = await safeSelect({
    message: 'Which Backend idiom / language?',
    choices: [
      ...backendIdioms.map((id) => ({ name: STACK_DISPLAY_NAMES[id]?.name ?? id, value: id })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: 0 });
    return backResult;
  }

  const backendIdiomResult = success({ nextStep: 4, idiom: result });
  return backendIdiomResult;
}

async function promptFrontendIdiom(context) {
  const { scope, availableIdioms } = context;

  if (scope === 'backend') {
    const skipResult = success({ nextStep: 5 });
    return skipResult;
  }

  const frontendIdioms = availableIdioms.filter((id) => STACK_DISPLAY_NAMES[id]?.isFrontend);
  const result = await safeSelect({
    message: 'Which Frontend idiom / framework?',
    choices: [
      ...frontendIdioms.map((id) => ({ name: STACK_DISPLAY_NAMES[id]?.name ?? id, value: id })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: 2, undoLastIdiom: scope === 'fullstack' });
    return backResult;
  }

  const frontendIdiomResult = success({ nextStep: 5, idiom: result });
  return frontendIdiomResult;
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

    if (result === 'back') {
      const backResult = success({ nextStep: 2, resetIdioms: true });
      return backResult;
    }
    versions[idiom] = result;
  }

  const versionsResult = success({ nextStep: 6, versions });
  return versionsResult;
}

async function promptDesignPreset(context) {
  const { selections } = context;

  const hasFrontend = selections.idioms.some((id) => STACK_DISPLAY_NAMES[id]?.isFrontend);
  if (!hasFrontend) {
    const skipResult = success({ nextStep: 7 });
    return skipResult;
  }

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

  if (result === 'back') {
    const backResult = success({ nextStep: 4 });
    return backResult;
  }

  if (result === 'other') {
    const noPresetResult = success({ nextStep: 7 });
    return noPresetResult;
  }

  const presetResult = success({ nextStep: 7, designPreset: result });
  return presetResult;
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

  if (result === 'back') {
    const backResult = success({ nextStep: 6 });
    return backResult;
  }

  const ideResult = success({ nextStep: 8, ide: result });
  return ideResult;
}

function validateSelections(selections) {
  if (selections.mode === 'quick') {
    selections.flavor = selections.flavor || 'lite';
    selections.idioms = selections.idioms?.length
      ? selections.idioms
      : ['javascript', 'typescript'];
    selections.track = selections.track || '00-lite-mode';
    selections.designPreset = selections.designPreset || 'glass';
    selections.ide = selections.ide || 'none';
    const quickValidResult = success(selections);
    return quickValidResult;
  }

  if (selections.mode === 'prompts') {
    if (!selections.track) {
      const missingTrackResult = fail('--track is required for prompts mode.', 'MISSING_TRACK');
      return missingTrackResult;
    }
    const promptsValidResult = success(selections);
    return promptsValidResult;
  }

  const availableFlavors = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'flavors'));
  const availableIdioms = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'idioms'));

  if (!selections.flavor) {
    const missingFlavorResult = fail('--flavor is required.', 'MISSING_FLAVOR');
    return missingFlavorResult;
  }

  if (!availableFlavors.includes(selections.flavor)) {
    const invalidFlavorResult = fail(
      `Unknown flavor: "${selections.flavor}". Available: ${availableFlavors.join(', ')}`,
      'INVALID_FLAVOR'
    );
    return invalidFlavorResult;
  }

  if (!selections.idioms || selections.idioms.length === 0) {
    const missingIdiomResult = fail('At least one --idiom is required.', 'MISSING_IDIOM');
    return missingIdiomResult;
  }

  for (const idiom of selections.idioms) {
    if (!availableIdioms.includes(idiom)) {
      const invalidIdiomResult = fail(
        `Unknown idiom: "${idiom}". Available: ${availableIdioms.join(', ')}`,
        'INVALID_IDIOM'
      );
      return invalidIdiomResult;
    }
  }

  const validResult = success(selections);
  return validResult;
}

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

const WizardUtils = {
  gatherUserSelections,
  validateSelections,
  autoSelectVersions,
};

export { WizardUtils };

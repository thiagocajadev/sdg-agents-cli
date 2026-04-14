import fs from 'node:fs';
import path from 'node:path';
import { STACK_VERSIONS } from '../../config/stack-versions.mjs';
import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';
import { DisplayUtils } from '../core/display-utils.mjs';
import { FsUtils } from '../core/fs-utils.mjs';
import { ResultUtils } from '../core/result-utils.mjs';
import { PromptUtils } from '../infra/prompt-utils.mjs';

const { displayName } = DisplayUtils;
const { getDirectories, getDirname } = FsUtils;
const { success, fail } = ResultUtils;
const { safeSelect, safeConfirm, safeInput } = PromptUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '../../..', 'assets', 'instructions');

const WIZARD_STEPS = {
  INITIAL: 'initial',
  SCOPE: 'scope',
  TRACK: 'track',
  FLAVOR: 'flavor',
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  VERSIONS: 'versions',
  DESIGN: 'design',
  IDE: 'ide',
  BUMP: 'bump',
  PARTNER: 'partner',
  DONE: 'done',
};

const STEP_ORDER = [
  WIZARD_STEPS.INITIAL,
  WIZARD_STEPS.SCOPE,
  WIZARD_STEPS.FLAVOR,
  WIZARD_STEPS.BACKEND,
  WIZARD_STEPS.FRONTEND,
  WIZARD_STEPS.VERSIONS,
  WIZARD_STEPS.DESIGN,
  WIZARD_STEPS.IDE,
  WIZARD_STEPS.BUMP,
  WIZARD_STEPS.PARTNER,
  WIZARD_STEPS.DONE,
];

async function gatherUserSelections(targetDirectory = process.cwd()) {
  const availableFlavors = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'flavors'));
  const availableIdioms = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'idioms'));
  const availableTracks = getDirectories(
    path.join(__dirname, '../../..', 'assets', 'dev-guides', 'prompt-tracks')
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
  let step = WIZARD_STEPS.INITIAL;
  let historyStack = [];

  while (step !== WIZARD_STEPS.DONE) {
    const context = {
      scope,
      step,
      selections,
      availableFlavors,
      availableIdioms,
      availableTracks,
      targetDirectory,
    };
    const stepResult = await executeWizardStep(step, context);

    if (stepResult.isFailure) {
      const stepFailure = stepResult;
      return stepFailure;
    }

    if (stepResult.value.mode === 'quick') {
      const quickSetupData = handleQuickSetup();
      return quickSetupData;
    }

    const currentStepIndex = STEP_ORDER.indexOf(step);
    const nextStepIndex = STEP_ORDER.indexOf(stepResult.value.nextStep);
    const isGoingBack = nextStepIndex < currentStepIndex;

    if (isGoingBack) {
      if (historyStack.length > 0) {
        // Pop until we reach the target previous step
        let lastState;
        while (
          historyStack.length > 0 &&
          STEP_ORDER.indexOf(historyStack[historyStack.length - 1].step) >= nextStepIndex
        ) {
          lastState = historyStack.pop();
        }
        if (lastState) {
          step = lastState.step;
          selections = lastState.selections;
          scope = lastState.scope;
        } else {
          step = WIZARD_STEPS.INITIAL;
        }
      } else {
        step = WIZARD_STEPS.INITIAL;
      }
    } else {
      historyStack.push({
        step,
        scope,
        selections: JSON.parse(JSON.stringify(selections)),
      });
      step = stepResult.value.nextStep;
      scope = applyStepResult(selections, scope, stepResult.value);
    }
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
    if (stepValue.bump !== undefined) currentSelections.bump = stepValue.bump;
    if (stepValue.partner) {
      currentSelections.partner = currentSelections.partner || {};
      Object.assign(currentSelections.partner, stepValue.partner);
    }
    const scopeToApply = nextScope;
    return scopeToApply;
  }
}

async function executeWizardStep(step, context) {
  const { mode } = context.selections;

  const STEP_HANDLERS = {
    [WIZARD_STEPS.INITIAL]: () => promptInitialChoice(),
    [WIZARD_STEPS.SCOPE]: () =>
      mode === 'prompts' ? promptTrackSelection(context) : promptProjectScope(),
    [WIZARD_STEPS.FLAVOR]: () => promptArchitectureFlavor(context),
    [WIZARD_STEPS.BACKEND]: () => promptBackendIdiom(context),
    [WIZARD_STEPS.FRONTEND]: () => promptFrontendIdiom(context),
    [WIZARD_STEPS.VERSIONS]: () => promptVersionSelections(context),
    [WIZARD_STEPS.DESIGN]: () => promptDesignPreset(context),
    [WIZARD_STEPS.IDE]: () => promptIdeSelection(),
    [WIZARD_STEPS.BUMP]: () => promptBumpAutomation(context),
    [WIZARD_STEPS.PARTNER]: () => promptPartnerInfo(context),
  };

  const handler = STEP_HANDLERS[step] ?? (() => success({ nextStep: WIZARD_STEPS.DONE }));
  const stepResult = await handler();

  return stepResult;
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
      {
        name: '3. Creative Design Toolkit — Branding, Social Media & Landing Pages',
        value: 'creatives',
      },
      { name: '4. Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = fail('', 'USER_BACK');
    return backResult;
  }
  if (result === 'creatives') {
    const creativesResult = success({ nextStep: WIZARD_STEPS.DONE, mode: 'creatives' });
    return creativesResult;
  }

  const initialChoiceResult = success({ nextStep: WIZARD_STEPS.SCOPE, mode: result });
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
    partner: {
      name: 'Human Developer',
      role: 'Dev Partner',
    },
  });
  const quickResult = quickSetupResult;
  return quickResult;
}

async function promptTrackSelection(context) {
  const { availableTracks } = context;

  const sortedTracks = [...availableTracks].sort((trackA, trackB) => trackA.localeCompare(trackB));
  const trackChoices = [
    ...sortedTracks.map(toTrackChoice),
    { name: '4. All Tracks (Best for Full Learning)', value: 'all' },
  ];

  const track = await safeSelect({
    message: 'Which specification track best fits your project?',
    choices: [...trackChoices, { name: '5. Back', value: 'back' }],
  });

  if (track === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.INITIAL });
    return backResult;
  }

  const projectPromptsDir = path.join(context.targetDirectory, '.ai', 'prompts');
  const isExisting = fs.existsSync(projectPromptsDir);

  if (isExisting) {
    const proceed = await safeConfirm({
      message: `The directory ".ai/prompts" already exists. Overwrite?`,
      default: false,
    });
    if (!proceed) {
      const cancelResult = success({ nextStep: WIZARD_STEPS.SCOPE });
      return cancelResult;
    }
  }

  const promptsDoneResult = success({ nextStep: WIZARD_STEPS.DONE, track });
  return promptsDoneResult;
}

function toTrackChoice(trackFolderKey) {
  const PRESET_LABELS = {
    '00-lite-mode': '1. Lite Mode (Simple & Agile)',
    '01-new-evolution': '2. New Evolution (Greenfield)',
    '02-legacy-modernization': '3. Legacy Modernization (Brownfield)',
  };

  const defaultLabel = displayName(trackFolderKey);
  const label = PRESET_LABELS[trackFolderKey] ?? defaultLabel;

  const choice = { name: label, value: trackFolderKey };
  return choice;
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
    const backResult = success({ nextStep: WIZARD_STEPS.INITIAL });
    return backResult;
  }

  const scopeResult = success({ nextStep: WIZARD_STEPS.FLAVOR, scope });
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
    const backResult = success({ nextStep: WIZARD_STEPS.SCOPE });
    return backResult;
  }

  const flavorResult = success({ nextStep: WIZARD_STEPS.BACKEND, flavor });
  return flavorResult;
}

function buildFlavorChoices(flavors) {
  const RANK_ORDER = { lite: 0, 'vertical-slice': 1, mvc: 2, legacy: 3 };

  const choices = flavors.map(toFlavorOption);
  const prioritizedChoices = choices.sort((choiceA, choiceB) => {
    const rankA = RANK_ORDER[choiceA.value] ?? 99;
    const rankB = RANK_ORDER[choiceB.value] ?? 99;
    return rankA - rankB;
  });

  return prioritizedChoices;
}

function toFlavorOption(flavorFolderKey) {
  const PRESET_LABELS = {
    lite: (base) => `0. ${base} (Simple & Agile)`,
    'vertical-slice': (base) => `1. ${base} (Recommended)`,
    mvc: (base) => `2. ${base} (Standard Layers)`,
    legacy: (base) => `3. ${base} (Event-Driven / SSR)`,
  };

  const baseLabel = displayName(flavorFolderKey);
  const formatter = PRESET_LABELS[flavorFolderKey] ?? ((base) => `Sub. ${base}`);
  const label = formatter(baseLabel);

  const choice = { name: label, value: flavorFolderKey };
  return choice;
}

async function promptBackendIdiom(context) {
  const { scope, availableIdioms } = context;

  if (scope === 'frontend') {
    const skipResult = success({ nextStep: WIZARD_STEPS.FRONTEND });
    return skipResult;
  }

  const backendIdioms = availableIdioms.filter(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isBackend
  );
  const result = await safeSelect({
    message: 'Which Backend idiom / language?',
    choices: [
      ...backendIdioms.map((idiomFolderKey) => ({
        name: STACK_DISPLAY_NAMES[idiomFolderKey]?.name ?? idiomFolderKey,
        value: idiomFolderKey,
      })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.INITIAL });
    return backResult;
  }

  const backendIdiomResult = success({ nextStep: WIZARD_STEPS.FRONTEND, idiom: result });
  return backendIdiomResult;
}

async function promptFrontendIdiom(context) {
  const { scope, availableIdioms } = context;

  if (scope === 'backend') {
    const skipResult = success({ nextStep: WIZARD_STEPS.VERSIONS });
    return skipResult;
  }

  const frontendIdioms = availableIdioms.filter(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isFrontend
  );
  const result = await safeSelect({
    message: 'Which Frontend idiom / framework?',
    choices: [
      ...frontendIdioms.map((idiomFolderKey) => ({
        name: STACK_DISPLAY_NAMES[idiomFolderKey]?.name ?? idiomFolderKey,
        value: idiomFolderKey,
      })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.FLAVOR });
    return backResult;
  }

  const frontendIdiomResult = success({ nextStep: WIZARD_STEPS.VERSIONS, idiom: result });
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
        ...available.map((versionOption) => ({
          name: versionOption.name,
          value: versionOption.value,
        })),
        { name: 'Back', value: 'back' },
      ],
    });

    if (result === 'back') {
      const backResult = success({ nextStep: WIZARD_STEPS.FLAVOR });
      return backResult;
    }
    versions[idiom] = result;
  }

  const versionsResult = success({ nextStep: WIZARD_STEPS.DESIGN, versions });
  return versionsResult;
}

async function promptDesignPreset(context) {
  const { selections, scope } = context;

  const hasFrontend = selections.idioms.some(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isFrontend
  );
  if (scope === 'backend' || !hasFrontend) {
    const skipResult = success({ nextStep: WIZARD_STEPS.IDE });
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
    const backResult = success({ nextStep: WIZARD_STEPS.FRONTEND });
    return backResult;
  }

  if (result === 'other') {
    const noPresetResult = success({ nextStep: WIZARD_STEPS.IDE });
    return noPresetResult;
  }

  const presetResult = success({ nextStep: WIZARD_STEPS.IDE, designPreset: result });
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
    const backResult = success({ nextStep: WIZARD_STEPS.DESIGN });
    return backResult;
  }

  const ideResult = success({ nextStep: WIZARD_STEPS.BUMP, ide: result });
  return ideResult;
}

async function promptBumpAutomation(context) {
  const { selections } = context;

  const hasJavaScriptOrTypeScript = selections.idioms.some(
    (idiomFolderKey) => idiomFolderKey === 'javascript' || idiomFolderKey === 'typescript'
  );

  if (!hasJavaScriptOrTypeScript) {
    const noAutomationResult = success({ nextStep: WIZARD_STEPS.PARTNER, bump: false });
    return noAutomationResult;
  }

  const result = await safeConfirm({
    message: 'Enable automated versioning (Bump & Changelog)?',
    default: true,
  });

  const bumpResult = success({ nextStep: WIZARD_STEPS.PARTNER, bump: result });
  return bumpResult;
}

async function promptPartnerInfo(_context) {
  const name = await safeInput({
    message: 'Primary Developer Name or Nickname? (e.g. Thiago) [Optional]',
    minLength: 2,
    maxLength: 50,
  });

  if (name === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.BUMP });
    return backResult;
  }

  const role = await safeInput({
    message: 'Primary Role? (e.g. Dev founder, Tech Lead, CTO) [Optional]',
    maxLength: 50,
  });

  if (role === 'back') {
    const backToNameResult = success({ nextStep: WIZARD_STEPS.PARTNER }); // Re-ask name
    return backToNameResult;
  }

  const partner = {
    name: name || null,
    role: role || null,
  };

  return success({ nextStep: WIZARD_STEPS.DONE, partner });
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
    const flavorFailure = invalidFlavorResult;
    return flavorFailure;
  }

  if (!selections.idioms || selections.idioms.length === 0) {
    const missingIdiomResult = fail('At least one --idiom is required.', 'MISSING_IDIOM');
    return missingIdiomResult;
  }

  for (const idiom of selections.idioms) {
    if (!availableIdioms.includes(idiom)) {
      const invalidIdiomMessage = `Unknown idiom: "${idiom}". Available: ${availableIdioms.join(', ')}`;
      const invalidIdiomResult = fail(invalidIdiomMessage, 'INVALID_IDIOM');
      return invalidIdiomResult;
    }
  }

  const setupResult = success(selections);
  return setupResult;
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

export const WizardUtils = {
  gatherUserSelections,
  validateSelections,
  autoSelectVersions,
};

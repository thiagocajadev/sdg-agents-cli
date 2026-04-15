import path from 'node:path';
import { selectVersionByStyle } from '../../config/stack-versions.mjs';
import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';
import { DisplayUtils } from '../core/display-utils.mjs';
import { FsUtils } from '../core/fs-utils.mjs';
import { ResultUtils } from '../core/result-utils.mjs';
import { PromptUtils } from '../infra/prompt-utils.mjs';

const { displayName } = DisplayUtils;
const { getDirectories, getDirname } = FsUtils;
const { success, fail } = ResultUtils;
const { safeSelect, safeInput } = PromptUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(__dirname, '../../..', 'assets', 'instructions');

const WIZARD_STEPS = {
  INITIAL: 'initial',
  FLAVOR: 'flavor',
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  CODE_STYLE: 'codeStyle',
  DESIGN: 'design',
  IDE: 'ide',
  PARTNER: 'partner',
  DONE: 'done',
};

const STEP_ORDER = [
  WIZARD_STEPS.INITIAL,
  WIZARD_STEPS.FLAVOR,
  WIZARD_STEPS.BACKEND,
  WIZARD_STEPS.FRONTEND,
  WIZARD_STEPS.CODE_STYLE,
  WIZARD_STEPS.DESIGN,
  WIZARD_STEPS.IDE,
  WIZARD_STEPS.PARTNER,
  WIZARD_STEPS.DONE,
];

async function gatherUserSelections(targetDirectory = process.cwd()) {
  const availableFlavors = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'flavors'));
  const availableIdioms = getDirectories(path.join(SOURCE_INSTRUCTIONS, 'idioms'));

  let selections = {
    mode: 'agents',
    flavor: 'vertical-slice',
    idioms: [],
    versions: {},
    codeStyle: 'latest',
    ide: 'none',
  };
  let step = WIZARD_STEPS.INITIAL;
  let historyStack = [];

  while (step !== WIZARD_STEPS.DONE) {
    const context = {
      step,
      selections,
      availableFlavors,
      availableIdioms,
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
      } else {
        step = WIZARD_STEPS.INITIAL;
      }
    } else {
      historyStack.push({
        step,
        selections: JSON.parse(JSON.stringify(selections)),
      });
      step = stepResult.value.nextStep;
      applyStepResult(selections, stepResult.value);
    }
  }

  const wizardResult = success(selections);
  return wizardResult;
}

function applyStepResult(currentSelections, stepValue) {
  if (stepValue.mode) currentSelections.mode = stepValue.mode;
  if (stepValue.flavor) currentSelections.flavor = stepValue.flavor;
  if (stepValue.codeStyle) currentSelections.codeStyle = stepValue.codeStyle;
  if (stepValue.designPreset) currentSelections.designPreset = stepValue.designPreset;
  if (stepValue.idiom) currentSelections.idioms.push(stepValue.idiom);
  if (stepValue.ide) currentSelections.ide = stepValue.ide;
  if (stepValue.partner) {
    currentSelections.partner = currentSelections.partner || {};
    Object.assign(currentSelections.partner, stepValue.partner);
  }
}

async function executeWizardStep(step, context) {
  const STEP_HANDLERS = {
    [WIZARD_STEPS.INITIAL]: () => promptInitialChoice(),
    [WIZARD_STEPS.FLAVOR]: () => promptArchitectureFlavor(context),
    [WIZARD_STEPS.BACKEND]: () => promptBackendIdiom(context),
    [WIZARD_STEPS.FRONTEND]: () => promptFrontendIdiom(context),
    [WIZARD_STEPS.CODE_STYLE]: () => promptCodeStyle(context),
    [WIZARD_STEPS.DESIGN]: () => promptDesignPreset(context),
    [WIZARD_STEPS.IDE]: () => promptIdeSelection(),
    [WIZARD_STEPS.PARTNER]: () => promptPartnerInfo(),
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
        name: '1. Full Setup — configure architecture, language and AI agent',
        value: 'agents',
      },
      {
        name: '2. ⚡ Quick — install with defaults (lite + JS/TS, includes everything)',
        value: 'quick',
      },
      {
        name: '3. Creative Toolkit — branding, social media & landing pages',
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

  const initialChoiceResult = success({ nextStep: WIZARD_STEPS.FLAVOR, mode: result });
  return initialChoiceResult;
}

function handleQuickSetup() {
  const quickSetupResult = success({
    mode: 'quick',
    flavor: 'lite',
    idioms: ['javascript', 'typescript'],
    codeStyle: 'latest',
    designPreset: 'clean',
    ide: 'none',
    versions: {
      javascript: 'js@2025',
      typescript: 'ts@6.0',
    },
    partner: {
      name: 'Human Developer',
      role: 'Dev Partner',
    },
  });
  const quickResult = quickSetupResult;
  return quickResult;
}

async function promptArchitectureFlavor(context) {
  const { availableFlavors } = context;
  const flavorChoices = buildFlavorChoices(availableFlavors);

  const flavor = await safeSelect({
    message: 'Which architecture should the project follow?',
    choices: [...flavorChoices, { name: 'Back', value: 'back' }],
  });

  if (flavor === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.INITIAL });
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
    const rankDiff = rankA - rankB;
    return rankDiff;
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
  const { availableIdioms } = context;

  const backendIdioms = availableIdioms.filter(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isBackend
  );
  const result = await safeSelect({
    message: 'Backend language?',
    choices: [
      { name: '—  None / Skip', value: 'skip' },
      ...backendIdioms.map((idiomFolderKey) => ({
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

  const isSkipped = result === 'skip';
  const backendResult = success({
    nextStep: WIZARD_STEPS.FRONTEND,
    idiom: isSkipped ? null : result,
  });
  return backendResult;
}

async function promptFrontendIdiom(context) {
  const { availableIdioms, selections } = context;

  const frontendIdioms = availableIdioms.filter(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isFrontend
  );
  const result = await safeSelect({
    message: 'Frontend framework?',
    choices: [
      { name: '—  None / Skip', value: 'skip' },
      ...frontendIdioms.map((idiomFolderKey) => ({
        name: STACK_DISPLAY_NAMES[idiomFolderKey]?.name ?? idiomFolderKey,
        value: idiomFolderKey,
      })),
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.BACKEND });
    return backResult;
  }

  const isSkipped = result === 'skip';
  const hasBothSkipped = isSkipped && selections.idioms.length === 0;
  if (hasBothSkipped) {
    // why: at least one idiom is required to build a meaningful instruction set
    const noIdiomResult = success({ nextStep: WIZARD_STEPS.BACKEND, idiom: null });
    return noIdiomResult;
  }

  const frontendResult = success({
    nextStep: WIZARD_STEPS.CODE_STYLE,
    idiom: isSkipped ? null : result,
  });
  return frontendResult;
}

async function promptCodeStyle(context) {
  const { selections } = context;
  const hasNoIdioms = selections.idioms.length === 0;
  if (hasNoIdioms) {
    const skipResult = success({ nextStep: WIZARD_STEPS.DESIGN, codeStyle: 'latest' });
    return skipResult;
  }

  const result = await safeSelect({
    message: 'Code style preference?',
    choices: [
      { name: '1. Latest      — cutting-edge features and syntax', value: 'latest' },
      { name: '2. Conservative — LTS-safe, widely supported', value: 'conservative' },
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.FRONTEND });
    return backResult;
  }

  const codeStyleResult = success({ nextStep: WIZARD_STEPS.DESIGN, codeStyle: result });
  return codeStyleResult;
}

async function promptDesignPreset(context) {
  const { selections } = context;

  const hasFrontend = selections.idioms.some(
    (idiomFolderKey) => STACK_DISPLAY_NAMES[idiomFolderKey]?.isFrontend
  );
  if (!hasFrontend) {
    const skipResult = success({ nextStep: WIZARD_STEPS.IDE });
    return skipResult;
  }

  const result = await safeSelect({
    message: 'Design preset?',
    choices: [
      { name: '1. Clean       — Minimalist, flat, functional', value: 'clean' },
      { name: '2. Bold        — High-contrast, expressive (Neobrutalism)', value: 'bold' },
      { name: '3. Atmospheric — Depth and texture (Glass / Organic)', value: 'atmospheric' },
      { name: '4. None        — No preset', value: 'none' },
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.CODE_STYLE });
    return backResult;
  }

  const isNone = result === 'none';
  const presetResult = success({
    nextStep: WIZARD_STEPS.IDE,
    designPreset: isNone ? null : result,
  });
  return presetResult;
}

async function promptIdeSelection() {
  const result = await safeSelect({
    message: 'Primary IDE / AI agent for auto-load?',
    choices: [
      { name: '1. Claude Code (CLAUDE.md)', value: 'claude' },
      { name: '2. Antigravity / Raw (.ai/skill/AGENTS.md only)', value: 'none' },
      { name: '3. GitHub Copilot (.github/copilot-instructions.md)', value: 'vscode' },
      { name: '4. Cursor (.cursorrules)', value: 'cursor' },
      { name: '5. Windsurf (.windsurfrules)', value: 'windsurf' },
      { name: '6. Cline / Roo Code (.clinerules)', value: 'roocode' },
      { name: '7. Multi-agent — write all IDE config files', value: 'all' },
      { name: 'Back', value: 'back' },
    ],
  });

  if (result === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.DESIGN });
    return backResult;
  }

  const ideResult = success({ nextStep: WIZARD_STEPS.PARTNER, ide: result });
  return ideResult;
}

async function promptPartnerInfo() {
  const input = await safeInput({
    message: 'Your name and role? (e.g. "Thiago, Dev Founder") — Enter to skip',
    maxLength: 80,
  });

  if (input === 'back') {
    const backResult = success({ nextStep: WIZARD_STEPS.IDE });
    return backResult;
  }

  const partner = parsePartnerInput(input);
  const partnerResult = success({ nextStep: WIZARD_STEPS.DONE, partner });
  return partnerResult;
}

function parsePartnerInput(input) {
  const isEmpty = !input || input.trim().length === 0;
  if (isEmpty) return { name: null, role: null };

  const separatorIndex = input.indexOf(',');
  const hasComma = separatorIndex !== -1;

  if (!hasComma) {
    const noCommaPartner = { name: input.trim(), role: null };
    return noCommaPartner;
  }

  const parsedPartner = {
    name: input.slice(0, separatorIndex).trim() || null,
    role: input.slice(separatorIndex + 1).trim() || null,
  };
  return parsedPartner;
}

function validateSelections(selections) {
  if (selections.mode === 'quick') {
    selections.flavor = selections.flavor || 'lite';
    selections.idioms = selections.idioms?.length
      ? selections.idioms
      : ['javascript', 'typescript'];
    selections.codeStyle = selections.codeStyle || 'latest';
    selections.designPreset = selections.designPreset || 'clean';
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
      const invalidIdiomMessage = `Unknown idiom: "${idiom}". Available: ${availableIdioms.join(', ')}`;
      const invalidIdiomResult = fail(invalidIdiomMessage, 'INVALID_IDIOM');
      return invalidIdiomResult;
    }
  }

  const setupResult = success(selections);
  return setupResult;
}

function resolveVersionsByCodeStyle(selections) {
  if (!selections.versions) selections.versions = {};

  const codeStyle = selections.codeStyle ?? 'latest';

  for (const idiom of selections.idioms) {
    if (selections.versions[idiom]) continue;

    const resolvedVersion = selectVersionByStyle(idiom, codeStyle);
    if (resolvedVersion) selections.versions[idiom] = resolvedVersion;
  }
}

function inferScopeFromIdioms(idioms) {
  const hasBackend = idioms.some((key) => STACK_DISPLAY_NAMES[key]?.isBackend);
  const hasFrontend = idioms.some((key) => STACK_DISPLAY_NAMES[key]?.isFrontend);

  const isBothSelected = hasBackend && hasFrontend;
  if (isBothSelected) return 'fullstack';

  const isOnlyFrontend = hasFrontend && !hasBackend;
  if (isOnlyFrontend) return 'frontend';

  const defaultScope = 'backend';
  return defaultScope;
}

function autoDetectBump(selections) {
  const hasJsOrTs = selections.idioms.some((key) => key === 'javascript' || key === 'typescript');
  selections.bump = hasJsOrTs;
}

export const WizardUtils = {
  gatherUserSelections,
  validateSelections,
  resolveVersionsByCodeStyle,
  inferScopeFromIdioms,
  autoDetectBump,
};

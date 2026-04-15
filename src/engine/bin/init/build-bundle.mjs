/**
 * Build Bundle — Orchestrates wizard, injection, and assembly.
 */

import { createRequire } from 'node:module';
import path from 'node:path';

import { WizardUtils } from '../../lib/domain/wizard.mjs';
import { RulesetInjector } from '../../lib/domain/ruleset-injector.mjs';
import { InstructionAssembler } from '../../lib/domain/instruction-assembler.mjs';
import { ResultUtils } from '../../lib/core/result-utils.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';
import { BundleUI } from '../../lib/core/ui-utils.mjs';

const { gatherUserSelections, validateSelections, resolveVersionsByCodeStyle, autoDetectBump } =
  WizardUtils;
const { prepareProjectStructure, injectRulesets, injectPrompts } = RulesetInjector;
const {
  buildMasterInstructions,
  buildPromptModeStub,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
  writeAutomationScripts,
  getActiveAgents,
} = InstructionAssembler;
const { success } = ResultUtils;
const { runIfDirect } = FsUtils;
const {
  printWelcome,
  printStep,
  printAborted,
  printQuickSetupStart,
  printProjectRoot,
  printSuccessAgents,
  printSuccessPrompts,
  printQuickSuccess,
  printQuickDryRun,
  printDryRunPreview,
  printBuildSummary,
} = BundleUI;

const require = createRequire(import.meta.url);
const packageJson = require('../../../../package.json');

/**
 * Entry point for both interactive (wizard) and non-interactive (flags) modes.
 */
async function run(targetDirectory = process.cwd(), options = {}) {
  await orchestrateBuild(targetDirectory, options);
}

async function orchestrateBuild(targetDirectory, options) {
  printWelcome();

  if (options.selections) {
    const nonInteractiveResult = await runNonInteractive(targetDirectory, options);
    return nonInteractiveResult;
  }

  const interactiveResult = await runInteractive(targetDirectory, options);
  return interactiveResult;
}

async function runNonInteractive(targetDirectory, options) {
  const { dryRun = false, noDevGuides = true, selections } = options;

  const validationResult = validateSelections(selections);
  if (validationResult.isFailure) {
    console.log(`\n  ⚠️  ${validationResult.error.message}`);
    process.exit(1);
  }

  resolveVersionsByCodeStyle(selections);
  autoDetectBump(selections);

  const state = { step: 'execute', userSelections: selections };
  const result = await handleFinalExecutionPhase(state, targetDirectory, {
    dryRun,
    noDevGuides,
    skipConfirm: true,
  });
  if (result.isFailure) {
    console.log(`\n  ⚠️  ${result.error.message}`);
    process.exit(1);
  }
}

async function runInteractive(targetDirectory, options) {
  const state = { step: 'selections', userSelections: null };

  while (state.step !== 'done') {
    const result = await handleExecutionStep(state, targetDirectory, options);
    if (result.isFailure) {
      if (result.error.code !== 'USER_BACK') {
        process.stdout.write(`\n  ⚠️  ${result.error.message}\n`);
      }
      const interactionResult = result;
      return interactionResult;
    }
  }
}

async function handleExecutionStep(state, targetDirectory, options) {
  switch (state.step) {
    case 'selections': {
      const selectionStepResult = await handleSelectionPhase(state, targetDirectory);
      return selectionStepResult;
    }
    case 'execute': {
      const executionStepResult = await handleFinalExecutionPhase(state, targetDirectory, options);
      return executionStepResult;
    }
    default: {
      const defaultResult = success();
      return defaultResult;
    }
  }
}

async function handleSelectionPhase(state, targetDirectory) {
  const selectionResult = await gatherUserSelections(targetDirectory);
  if (selectionResult.isFailure) {
    const selectionFailure = selectionResult;
    return selectionFailure;
  }

  state.userSelections = selectionResult.value;
  state.step = 'execute';
  const phaseSuccess = success();
  return phaseSuccess;
}

async function handleFinalExecutionPhase(state, targetDirectory, options = {}) {
  const { dryRun = false, noDevGuides = true, skipConfirm = false } = options;
  const selections = state.userSelections;

  if (selections.mode === 'quick') {
    const quickModeResult = await runQuickMode(state, targetDirectory, { dryRun, noDevGuides });
    return quickModeResult;
  }

  if (dryRun) {
    printDryRunPreview(selections, targetDirectory);
    state.step = 'done';
    const dryRunSuccess = success();
    return dryRunSuccess;
  }

  if (selections.mode === 'prompts') {
    const promptsModeResult = await runPromptsMode(state, targetDirectory, selections, {
      skipConfirm,
    });
    return promptsModeResult;
  }

  if (selections.mode === 'creatives') {
    const creativesModeResult = await runCreativesMode(state, targetDirectory);
    return creativesModeResult;
  }

  const agentsModeResult = await runAgentsMode(state, targetDirectory, selections, {
    skipConfirm,
    noDevGuides,
  });
  return agentsModeResult;
}

async function runQuickMode(state, targetDirectory, { dryRun, noDevGuides = true }) {
  if (dryRun) {
    const dryRunResult = abortForDryRun(state, targetDirectory, printQuickDryRun);
    return dryRunResult;
  }

  printQuickSetupStart();
  executeQuickPipeline(targetDirectory, state.userSelections, { noDevGuides });

  printQuickSuccess(targetDirectory);
  state.step = 'done';
  const quickSuccessResult = success();
  return quickSuccessResult;
}

async function runPromptsMode(state, targetDirectory, selections, { skipConfirm = false } = {}) {
  const confirmed = skipConfirm || (await printBuildSummary(selections));
  if (!confirmed) {
    const abortResult = abortExecution(state);
    return abortResult;
  }

  printProjectRoot(targetDirectory);
  executePromptsPipeline(targetDirectory, selections);

  printSuccessPrompts(targetDirectory);
  state.step = 'done';
  const promptsResult = success();
  return promptsResult;
}

async function runAgentsMode(
  state,
  targetDirectory,
  selections,
  { skipConfirm = false, noDevGuides = true } = {}
) {
  const confirmed = skipConfirm || (await printBuildSummary(selections));
  if (!confirmed) {
    const abortResult = abortExecution(state);
    return abortResult;
  }

  printProjectRoot(targetDirectory);
  executeAgentsPipeline(targetDirectory, selections, { noDevGuides });

  printSuccessAgents(targetDirectory);
  state.step = 'done';
  const buildResult = success();
  return buildResult;
}

async function runCreativesMode(state, targetDirectory) {
  const { Creatives } = await import('./creatives-bundle.mjs');
  const creativesResult = await Creatives.run(targetDirectory);
  state.step = 'done';
  return creativesResult;
}

function abortForDryRun(state, targetDirectory, printer) {
  printer(targetDirectory);
  state.step = 'done';
  const dryRunAbortResult = success();
  return dryRunAbortResult;
}

function abortExecution(state) {
  printAborted();
  state.step = 'done';
  const userAbortResult = success();
  return userAbortResult;
}

function executeQuickPipeline(targetDirectory, selections, { noDevGuides = true } = {}) {
  printStep(1, 5, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDirectory);

  printStep(2, 5, 'Injecting rules...');
  const isCreativeEnabled = selections.creative === true;
  injectRulesets(targetDirectory, selections, { noDevGuides, noCreative: !isCreativeEnabled });

  printStep(3, 5, 'Assembling AGENTS.md...');
  const content = buildMasterInstructions(selections);

  printStep(4, 5, 'Writing agent config and backlog...');
  writeAgentConfig(targetDirectory, content, getActiveAgents(selections));
  writeBacklogFiles(targetDirectory, selections);
  writeGitignore(targetDirectory);

  printStep(5, 5, 'Injecting spec templates...');
  injectPrompts(targetDirectory, selections.track);
  writeAutomationScripts(targetDirectory, selections);
  writeManifest(targetDirectory, selections, packageJson.version);
}

function executePromptsPipeline(targetDirectory, selections) {
  printStep(1, 3, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDirectory);

  printStep(2, 3, `Injecting specification track: ${selections.track}...`);
  injectPrompts(targetDirectory, selections.track);

  printStep(3, 3, 'Writing prompts-only fallback config...');
  const stubContent = buildPromptModeStub();
  writeAgentConfig(targetDirectory, stubContent, getActiveAgents(selections));
  writeGitignore(targetDirectory);
}

function executeAgentsPipeline(targetDirectory, selections, { noDevGuides = true } = {}) {
  printStep(1, 5, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDirectory);

  printStep(2, 5, 'Injecting rules...');
  const isCreativeEnabled = selections.creative === true;
  injectRulesets(targetDirectory, selections, { noDevGuides, noCreative: !isCreativeEnabled });

  printStep(3, 5, 'Assembling AGENTS.md...');
  const content = buildMasterInstructions(selections);

  printStep(4, 5, 'Writing agent config and backlog...');
  writeAgentConfig(targetDirectory, content, getActiveAgents(selections));
  writeBacklogFiles(targetDirectory, selections);
  writeGitignore(targetDirectory);

  printStep(5, 5, 'Finalizing manifest...');
  writeAutomationScripts(targetDirectory, selections);
  writeManifest(targetDirectory, selections, packageJson.version);
}

// getActiveAgents is now imported from InstructionAssembler

export const SDG = {
  run,
};

runIfDirect(import.meta.url, launchFromCli);

function launchFromCli() {
  const targetDirectory = process.argv[2] ?? process.cwd();
  const dryRun = process.argv.includes('--dry-run');
  const buildResult = run(path.resolve(targetDirectory), { dryRun });
  return buildResult;
}

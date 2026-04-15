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
const { prepareProjectStructure, injectRulesets } = RulesetInjector;
const {
  buildMasterInstructions,
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
  const { dryRun = false, selections } = options;

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
  const { dryRun = false, skipConfirm = false } = options;
  const selections = state.userSelections;

  if (selections.mode === 'quick') {
    const quickModeResult = await runQuickMode(state, targetDirectory, { dryRun });
    return quickModeResult;
  }

  if (dryRun) {
    printDryRunPreview(selections, targetDirectory);
    state.step = 'done';
    const dryRunSuccess = success();
    return dryRunSuccess;
  }

  const agentsModeResult = await runAgentsMode(state, targetDirectory, selections, {
    skipConfirm,
  });
  return agentsModeResult;
}

async function runQuickMode(state, targetDirectory, { dryRun }) {
  if (dryRun) {
    const dryRunResult = abortForDryRun(state, targetDirectory, printQuickDryRun);
    return dryRunResult;
  }

  printQuickSetupStart();
  executeQuickPipeline(targetDirectory, state.userSelections);

  printQuickSuccess(targetDirectory);
  state.step = 'done';
  const quickSuccessResult = success();
  return quickSuccessResult;
}

async function runAgentsMode(state, targetDirectory, selections, { skipConfirm = false } = {}) {
  const confirmed = skipConfirm || (await printBuildSummary(selections));
  if (!confirmed) {
    const abortResult = abortExecution(state);
    return abortResult;
  }

  printProjectRoot(targetDirectory);
  executeAgentsPipeline(targetDirectory, selections);

  printSuccessAgents(targetDirectory);
  state.step = 'done';
  const buildResult = success();
  return buildResult;
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

function executeQuickPipeline(targetDirectory, selections) {
  printStep(1, 5, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDirectory);

  printStep(2, 5, 'Injecting rules...');
  injectRulesets(targetDirectory, selections);

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

function executeAgentsPipeline(targetDirectory, selections) {
  printStep(1, 5, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDirectory);

  printStep(2, 5, 'Injecting rules...');
  injectRulesets(targetDirectory, selections);

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

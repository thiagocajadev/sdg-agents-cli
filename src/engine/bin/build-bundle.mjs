/**
 * Build Bundle — Staff-level CLI Orchestrator
 * Delegates wizard, injection, and assembly to dedicated modules.
 */

import { createRequire } from 'node:module';
import path from 'node:path';

import { WizardUtils } from '../lib/wizard.mjs';
import { RulesetInjector } from '../lib/ruleset-injector.mjs';
import { InstructionAssembler } from '../lib/instruction-assembler.mjs';
import { ResultUtils } from '../lib/result-utils.mjs';
import { FsUtils } from '../lib/fs-utils.mjs';
import { BundleUI } from '../lib/ui-utils.mjs';

const { gatherUserSelections, validateSelections, autoSelectVersions } = WizardUtils;
const { prepareProjectStructure, injectRulesets, injectPrompts } = RulesetInjector;
const {
  buildMasterInstructions,
  buildPromptModeStub,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
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
const packageJson = require('../../../package.json');

/**
 * CLI Orchestrator: The Top-Down Narrative of Bundle Generation
 * Supports both interactive (wizard) and non-interactive (flags) modes.
 */
async function run(targetDir = process.cwd(), options = {}) {
  printWelcome();

  if (options.selections) {
    return runNonInteractive(targetDir, options);
  }

  return runInteractive(targetDir, options);
}

async function runNonInteractive(targetDir, options) {
  const { dryRun = false, selections } = options;

  const validationResult = validateSelections(selections);
  if (validationResult.isFailure) {
    console.log(`\n  ⚠️  ${validationResult.error.message}`);
    process.exit(1);
  }

  autoSelectVersions(selections);

  const state = { step: 'execute', userSelections: selections };
  const result = await handleFinalExecutionPhase(state, targetDir, { dryRun, skipConfirm: true });
  if (result.isFailure) {
    console.log(`\n  ⚠️  ${result.error.message}`);
    process.exit(1);
  }
}

async function runInteractive(targetDir, options) {
  const state = { step: 'selections', userSelections: null };

  while (state.step !== 'done') {
    const result = await handleExecutionStep(state, targetDir, options);
    if (result.isFailure) {
      if (result.error.code !== 'USER_BACK') {
        console.log(`\n  ⚠️  ${result.error.message}`);
      }
      return;
    }
  }
}

// --- Phase Handlers (Storytelling) ---

async function handleExecutionStep(state, targetDir, options) {
  switch (state.step) {
    case 'selections':
      return handleSelectionPhase(state, targetDir);
    case 'execute':
      return handleFinalExecutionPhase(state, targetDir, options);
    default:
      return success();
  }
}

async function handleSelectionPhase(state, targetDir) {
  const result = await gatherUserSelections(targetDir);
  if (result.isFailure) return result;

  state.userSelections = result.value;
  state.step = 'execute';
  return success();
}

async function handleFinalExecutionPhase(state, targetDir, options = {}) {
  const { dryRun = false, skipConfirm = false } = options;
  const selections = state.userSelections;

  if (selections.mode === 'quick') {
    return runQuickMode(state, targetDir, { dryRun });
  }

  if (dryRun) {
    printDryRunPreview(selections, targetDir);
    state.step = 'done';
    return success();
  }

  if (selections.mode === 'prompts') {
    return runPromptsMode(state, targetDir, selections, { skipConfirm });
  }

  return runAgentsMode(state, targetDir, selections, { skipConfirm });
}

// --- Mode Runners (Narrative Orchestration) ---

async function runQuickMode(state, targetDir, { dryRun }) {
  if (dryRun) return abortForDryRun(state, targetDir, printQuickDryRun);

  printQuickSetupStart();
  executeQuickPipeline(targetDir, state.userSelections);

  printQuickSuccess(targetDir);
  state.step = 'done';
  return success();
}

async function runPromptsMode(state, targetDir, selections, { skipConfirm = false } = {}) {
  const confirmed = skipConfirm || (await printBuildSummary(selections));
  if (!confirmed) return abortExecution(state);

  printProjectRoot(targetDir);
  executePromptsPipeline(targetDir, selections);

  printSuccessPrompts(targetDir);
  state.step = 'done';
  return success();
}

async function runAgentsMode(state, targetDir, selections, { skipConfirm = false } = {}) {
  const confirmed = skipConfirm || (await printBuildSummary(selections));
  if (!confirmed) return abortExecution(state);

  printProjectRoot(targetDir);
  executeAgentsPipeline(targetDir, selections);

  printSuccessAgents(targetDir);
  state.step = 'done';
  return success();
}

// --- Implementation Details ---

function abortForDryRun(state, targetDir, printer) {
  printer(targetDir);
  state.step = 'done';
  return success();
}

function abortExecution(state) {
  printAborted();
  state.step = 'done';
  return success();
}

function executeQuickPipeline(targetDir, selections) {
  printStep(1, 5, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDir);

  printStep(2, 5, 'Injecting Lite AI Rules (JS/TS + Glass)...');
  injectRulesets(targetDir, selections);

  printStep(3, 5, 'Generating master instructions...');
  const content = buildMasterInstructions(selections);

  printStep(4, 5, 'Writing agent config...');
  writeAgentConfig(targetDir, content, getActiveAgents(selections));
  writeBacklogFiles(targetDir, selections);
  writeGitignore(targetDir);

  printStep(5, 5, 'Injecting Lite Prompt Track...');
  injectPrompts(targetDir, selections.track);
  writeManifest(targetDir, selections, packageJson.version);
}

function executePromptsPipeline(targetDir, selections) {
  printStep(1, 3, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDir);

  printStep(2, 3, `Injecting specification track: ${selections.track}...`);
  injectPrompts(targetDir, selections.track);

  printStep(3, 3, 'Writing prompts-only fallback config...');
  const stubContent = buildPromptModeStub();
  writeAgentConfig(targetDir, stubContent, getActiveAgents(selections));
  writeGitignore(targetDir);
}

function executeAgentsPipeline(targetDir, selections) {
  printStep(1, 5, 'Preparing .ai/ structure...');
  prepareProjectStructure(targetDir);

  printStep(2, 5, 'Injecting rulesets...');
  injectRulesets(targetDir, selections);

  printStep(3, 5, 'Generating master instructions...');
  const content = buildMasterInstructions(selections);

  printStep(4, 5, 'Writing agent config...');
  writeAgentConfig(targetDir, content, getActiveAgents(selections));
  writeBacklogFiles(targetDir, selections);
  writeGitignore(targetDir);

  printStep(5, 5, 'Finalizing manifest...');
  writeManifest(targetDir, selections, packageJson.version);
}

function getActiveAgents(selections) {
  const agentCandidates = [...(selections.agents || []), selections.ide];
  const activeAgents = agentCandidates.filter((agent) => agent !== null && agent !== undefined);
  return activeAgents;
}

export const SDG = {
  run,
};

runIfDirect(import.meta.url, () => {
  const targetDir = process.argv[2] ?? process.cwd();
  const dryRun = process.argv.includes('--dry-run');
  return run(path.resolve(targetDir), { dryRun });
});

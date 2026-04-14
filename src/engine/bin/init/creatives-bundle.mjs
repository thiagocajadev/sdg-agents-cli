import { createRequire } from 'node:module';
import { RulesetInjector } from '../../lib/domain/ruleset-injector.mjs';
import { InstructionAssembler } from '../../lib/domain/instruction-assembler.mjs';
import { ManifestUtils } from '../../lib/domain/manifest-utils.mjs';
import { BundleUI } from '../../lib/core/ui-utils.mjs';
import { ResultUtils } from '../../lib/core/result-utils.mjs';

const { injectCreativeToolkit } = RulesetInjector;
const {
  buildMasterInstructions,
  writeAgentConfig,
  writeBacklogFiles,
  getActiveAgents,
  writeManifest,
} = InstructionAssembler;
const { loadManifest } = ManifestUtils;
const { printStep, printProjectRoot } = BundleUI;
const { success } = ResultUtils;

const require = createRequire(import.meta.url);
const packageJson = require('../../../../package.json');

async function run(targetDirectory = process.cwd()) {
  await orchestrateCreativeInjection(targetDirectory);
}

async function orchestrateCreativeInjection(targetDirectory) {
  console.log('\n  🎨 Creative Design Toolkit — Initializing...\n');

  const manifest = loadManifest(targetDirectory);
  const selections = manifest?.selections || {
    mode: 'agents',
    flavor: 'none',
    idioms: [],
    agents: ['antigravity'], // Default for creative flow
  };

  printProjectRoot(targetDirectory);

  printStep(1, 4, 'Injecting Creative Skills and Templates...');
  injectCreativeToolkit(targetDirectory);

  printStep(2, 4, 'Updating AGENTS.md with routing...');
  const content = buildMasterInstructions(selections);

  const activeAgents = getActiveAgents(selections);
  writeAgentConfig(targetDirectory, content, activeAgents);

  printStep(3, 4, 'Syncing Backlog...');
  writeBacklogFiles(targetDirectory, selections);

  printStep(4, 4, 'Finalizing Manifest...');
  writeManifest(targetDirectory, selections, packageJson.version);

  console.log('\n  ✅ Creative Design Toolkit injected successfully!');
  console.log('  👉 Use the chat to start your Design Thinking session.\n');

  const injectionResult = success();
  return injectionResult;
}

export const Creatives = { run };

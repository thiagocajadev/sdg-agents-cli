#!/usr/bin/env node

/**
 * sdg-agents — Main CLI Entry Point
 * Supports interactive and non-interactive modes.
 */

import { createRequire } from 'node:module';
import path from 'node:path';

import { FsUtils } from '../lib/fs-utils.mjs';
import { PromptUtils } from '../lib/prompt-utils.mjs';
import { CliParser } from '../lib/cli-parser.mjs';
import { BundleUI } from '../lib/ui-utils.mjs';

const { runIfDirect } = FsUtils;
const { safeSelect } = PromptUtils;
const { parseCliArgs, validateInit } = CliParser;

const require = createRequire(import.meta.url);
const packageJson = require('../../../package.json');

// --- Orchestrator ---

async function run() {
  const args = parseCliArgs(process.argv.slice(2));
  const version = packageJson.version;

  if (args.help) {
    BundleUI.printHelp(version);
    return;
  }

  if (args.version) {
    console.log(version);
    return;
  }

  // Resolve target directory early for the entire cycle
  args.targetDir = path.resolve(args.targetDir || process.cwd());

  if (args.subcommand) {
    await executeSubcommand(args);
  } else {
    await startInteractiveMode(args);
  }
}

// --- Interactive Mode ---

async function startInteractiveMode(args) {
  BundleUI.printHeader(packageJson.version);

  try {
    while (true) {
      const menuChoice = await safeSelect({
        message: 'What would you like to do?',
        choices: [
          {
            name: '1. 🏗️  Build Project Context  — Inject Staff-level engineering rules',
            value: 'init',
          },
          {
            name: '2. ⚙️  Settings & Maintenance — Review rules, sync patterns, and dev tools',
            value: 'settings',
          },
          { name: '3. ❌ Exit', value: 'exit' },
        ],
      });

      if (menuChoice === 'exit' || menuChoice === 'back') break;
      await executeMenuAction(menuChoice, args);
      console.log('\n' + '─'.repeat(50) + '\n');
    }
  } catch (error) {
    handleExitError(error);
  }

  BundleUI.printFooter();
}

async function executeMenuAction(menuChoice, args) {
  switch (menuChoice) {
    case 'init': {
      const { SDG } = await import('./build-bundle.mjs');
      await SDG.run(args.targetDir, { dryRun: args.dryRun });
      break;
    }
    case 'settings':
      await runSettingsMenu(args.targetDir);
      break;
  }
}

// --- Subcommand Router ---

async function executeSubcommand(args) {
  switch (args.subcommand) {
    case 'init':
      await handleInitSubcommand(args);
      break;
    case 'review': {
      const { Reviewer } = await import('./review-bundle.mjs');
      await Reviewer.run();
      break;
    }
    case 'sync': {
      const { Syncer } = await import('./sync-rulesets.mjs');
      await Syncer.run();
      break;
    }
    case 'update': {
      const { Versioning } = await import('./update-versions.mjs');
      await Versioning.run();
      break;
    }
    case 'add': {
      const { Idiomatic } = await import('./add-idiom.mjs');
      await Idiomatic.run();
      break;
    }
    case 'clear': {
      const { Cleaner } = await import('./clear-bundle.mjs');
      await Cleaner.run(args.targetDir);
      break;
    }
    default:
      console.log(`\n  Unknown command: "${args.subcommand}". Run with --help for usage.\n`);
  }
}

async function handleInitSubcommand(args) {
  const error = validateInit(args);
  if (error) {
    console.log(`\n${error}\n`);
    return;
  }

  const { SDG } = await import('./build-bundle.mjs');
  const isNonInteractive = args.mode || args.flavor || args.idioms.length > 0;

  const selectionPayload = isNonInteractive
    ? {
        mode: args.mode || 'agents',
        flavor: args.flavor,
        idioms: args.idioms || [],
        agents: args.agents || [],
        ide: args.ide || 'none',
        track: args.track,
        scope: args.scope || 'fullstack',
        versions: {},
      }
    : null;

  await SDG.run(args.targetDir, {
    dryRun: args.dryRun,
    noDevGuides: args.noDevGuides,
    selections: selectionPayload,
  });
}

// --- Settings Menu ---

async function runSettingsMenu(targetDir) {
  const settingsChoice = await safeSelect({
    message: 'Settings & Maintenance:',
    choices: [
      {
        name: '1. 🔄 Update Instructions — Re-apply latest rules (uses saved config)',
        value: 'update-instructions',
      },
      { name: '2. 🗑️  Clear Generated Content — Remove all generated files', value: 'clear' },
      { name: '3. Back', value: 'back' },
    ],
  });

  if (settingsChoice === 'back') return;

  switch (settingsChoice) {
    case 'update-instructions': {
      const { ManifestUtils } = await import('../lib/manifest-utils.mjs');
      const { SDG } = await import('./build-bundle.mjs');
      const manifest = ManifestUtils.loadManifest(targetDir);

      if (!manifest) {
        console.log('\n  ⚠️  No saved config found (.ai/.sdg-manifest.json).');
        console.log('  Run "Build Project Context" first to initialize the project.\n');
        return;
      }

      const { flavor, idioms } = manifest.selections;
      console.log(
        `\n  Re-applying latest rules — Flavor: ${flavor} | Idioms: ${idioms.join(', ')}\n`
      );

      try {
        await SDG.run(targetDir, { selections: manifest.selections });
      } catch (error) {
        console.log(`\n  ❌ Update failed: ${error.message}\n`);
      }
      break;
    }
    case 'clear': {
      const { Cleaner } = await import('./clear-bundle.mjs');
      await Cleaner.run(targetDir);
      break;
    }
  }
}

// --- System ---

function handleExitError(error) {
  if (error.message?.includes('force closed') || error.name === 'ExitPromptError') {
    console.log('\n\n  👋 Goodbye! See you soon engineer.');
    process.exit(0);
  }
  console.error('\n  ❌ Error:', error.message);
  process.exit(1);
}

export const CLI = { run };

runIfDirect(import.meta.url, run);

// Removed legacy logic - consolidated in run/startInteractiveMode/executeSubcommand above.

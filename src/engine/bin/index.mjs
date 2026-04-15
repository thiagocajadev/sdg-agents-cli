#!/usr/bin/env node

/**
 * sdg-agents — Main CLI Entry Point
 * Supports interactive and non-interactive modes.
 */

import { createRequire } from 'node:module';
import path from 'node:path';

import { FsUtils } from '../lib/core/fs-utils.mjs';
import { PromptUtils } from '../lib/infra/prompt-utils.mjs';
import { CliParser } from '../lib/infra/cli-parser.mjs';
import { BundleUI } from '../lib/core/ui-utils.mjs';
import { VersionUtils } from '../lib/domain/version-utils.mjs';

const { runIfDirect } = FsUtils;
const { safeSelect } = PromptUtils;
const { parseCliArgs, validateInit } = CliParser;

const require = createRequire(import.meta.url);
const packageJson = require('../../../package.json');

async function run() {
  return await orchestrateCommandLineLifecycle();
}

async function orchestrateCommandLineLifecycle() {
  const cliArgs = parseCommandLineArguments();
  const appVersion = packageJson.version;

  const isHelpRequested = cliArgs.help;
  if (isHelpRequested) {
    const helpResult = displayHelp(appVersion);
    return helpResult;
  }

  const isVersionRequested = cliArgs.version;
  if (isVersionRequested) {
    const versionResult = displayVersion(appVersion);
    return versionResult;
  }

  const executionContext = prepareExecutionContext(cliArgs);
  await handleMaintenanceSync(executionContext);

  if (executionContext.subcommand) {
    const subcommandResult = await executeSubcommand(executionContext);
    return subcommandResult;
  }

  const interactiveResult = await startInteractiveMode(executionContext);
  return interactiveResult;
}

function parseCommandLineArguments() {
  const rawArgs = process.argv.slice(2);
  const parsedArgs = parseCliArgs(rawArgs);
  return parsedArgs;
}

function displayHelp(version) {
  const helpOutput = BundleUI.printHelp(version);
  return helpOutput;
}

function displayVersion(version) {
  const versionOutput = console.log(version);
  return versionOutput;
}

function prepareExecutionContext(args) {
  const targetPath = path.resolve(args.targetDirectory || process.cwd());
  const context = { ...args, targetDirectory: targetPath };
  return context;
}

async function handleMaintenanceSync(args) {
  const isCommandRequest = args.subcommand || args.help || args.version;
  if (isCommandRequest) {
    const skipResult = null;
    return skipResult;
  }

  const syncResult = await ensureMaintainerSync(args.targetDirectory);
  return syncResult;
}

async function ensureMaintainerSync(targetDirectory) {
  const { isMaintainerMode } = PromptUtils;
  const isMaintainer = isMaintainerMode();
  if (!isMaintainer) {
    const idleResult = null;
    return idleResult;
  }

  const { SyncChecker } = await import('./audit/check-sync.mjs');
  const syncResult = SyncChecker.run();

  const isDriftDetected = syncResult.isFailure;
  if (isDriftDetected) {
    const resolutionResult = await performAutomaticSync(targetDirectory);
    return resolutionResult;
  }

  const healthyResult = null;
  return healthyResult;
}

async function performAutomaticSync(targetDirectory) {
  console.log('\n  🛠️  MAINTAINER MODE: Drift detected in core instructions.');
  console.log('  🔄 Automatic sync in progress...\n');

  const { ManifestUtils } = await import('../lib/domain/manifest-utils.mjs');
  const { SDG: SpecDrivenGuide } = await import('./init/build-bundle.mjs');
  const manifest = ManifestUtils.loadManifest(targetDirectory);

  if (!manifest) {
    const missingMsg = '  ⚠️  Cannot auto-sync: No manifest found. Run "init" once.\n';
    const missingManifestResult = console.log(missingMsg);
    return missingManifestResult;
  }

  try {
    await SpecDrivenGuide.run(targetDirectory, { selections: manifest.selections });
    const successMsg = '\n  ✅ Core instructions synchronized. Agent rules are up-to-date.\n';
    const successResult = console.log(successMsg + '─'.repeat(50) + '\n');
    return successResult;
  } catch (error) {
    const failureResult = console.log(`\n  ⚠️  Automatic sync failed: ${error.message}\n`);
    return failureResult;
  }
}

async function executeSubcommand(args) {
  switch (args.subcommand) {
    case 'init': {
      const initResult = await handleInitSubcommand(args);
      return initResult;
    }
    case 'review': {
      const { Reviewer } = await import('./maintenance/review-bundle.mjs');
      const reviewResult = await Reviewer.run();
      return reviewResult;
    }
    case 'sync': {
      const { Syncer } = await import('./maintenance/sync-rulesets.mjs');
      const syncResult = await Syncer.run();
      return syncResult;
    }
    case 'update': {
      const { Versioning } = await import('./maintenance/update-versions.mjs');
      const updateResult = await Versioning.run();
      return updateResult;
    }
    case 'add': {
      const { Idiomatic } = await import('./init/add-idiom.mjs');
      const addResult = await Idiomatic.run();
      return addResult;
    }
    case 'clear': {
      const { Cleaner } = await import('./maintenance/clear-bundle.mjs');
      const clearResult = await Cleaner.run(args.targetDirectory);
      return clearResult;
    }
    case 'audit': {
      const { AuditRunner } = await import('./audit/audit-bundle.mjs');
      const auditResult = await AuditRunner.run();
      return auditResult;
    }
    case 'narrative': {
      const { NarrativeChecker } = await import('./audit/check-narrative.mjs');
      const narrativeResult = await NarrativeChecker.run();
      return narrativeResult;
    }
    default: {
      const unknownMsg = `\n  Unknown command: "${args.subcommand}". Run with --help for usage.\n`;
      const unknownResult = console.log(unknownMsg);
      return unknownResult;
    }
  }
}

async function handleInitSubcommand(args) {
  const validationError = validateInit(args);
  const hasValidationError = !!validationError;
  if (hasValidationError) {
    const errorResult = console.log(`\n${validationError}\n`);
    return errorResult;
  }

  const { SDG: SpecDrivenGuide } = await import('./init/build-bundle.mjs');
  const isQuickMode = args.quick || args.mode === 'quick';
  const isNonInteractive = isQuickMode || args.mode || args.flavor || args.idioms.length > 0;

  const selectionPayload = isNonInteractive
    ? {
        mode: isQuickMode ? 'quick' : args.mode || 'agents',
        flavor: args.flavor,
        idioms: args.idioms || [],
        agents: args.agents || [],
        ide: args.ide || 'none',
        track: args.track,
        codeStyle: 'latest',
        versions: {},
      }
    : null;

  const buildParams = {
    dryRun: args.dryRun,
    noDevGuides: args.noDevGuides,
    selections: selectionPayload,
  };
  const buildResult = await SpecDrivenGuide.run(args.targetDirectory, buildParams);
  return buildResult;
}

async function startInteractiveMode(args) {
  BundleUI.printHeader(packageJson.version);

  const updateInfo = await VersionUtils.checkForUpdates(packageJson.version);
  const hasUpdate = updateInfo.hasUpdate;
  if (hasUpdate) {
    BundleUI.printUpdateNotification(packageJson.version, updateInfo.latest);
  }

  try {
    while (true) {
      const menuChoice = await safeSelect({
        message: 'What would you like to do?',
        choices: [
          {
            name: '1. 🏗️  Build Project — Inject staff-level engineering rules',
            value: 'init',
          },
          {
            name: '2. ⚙️  Settings — Audit, update rules, and maintenance',
            value: 'settings',
          },
          { name: '3. ❌ Exit', value: 'exit' },
        ],
      });

      const isExit = menuChoice === 'exit' || menuChoice === 'back';
      if (isExit) break;

      await executeMenuAction(menuChoice, args);
      console.log('\n' + '─'.repeat(50) + '\n');
    }
  } catch (error) {
    handleExitError(error);
  }

  const footerResult = BundleUI.printFooter();
  return footerResult;
}

function handleExitError(error) {
  const isForceClosed = error.message?.includes('force closed') || error.name === 'ExitPromptError';
  if (isForceClosed) {
    console.log('\n\n  👋 Goodbye! See you soon engineer.');
    process.exit(0);
  }
  console.error('\n  ❌ Error:', error.message);
  process.exit(1);
}

async function executeMenuAction(menuChoice, args) {
  switch (menuChoice) {
    case 'init': {
      const { SDG: SpecDrivenGuide } = await import('./init/build-bundle.mjs');
      const initResult = await SpecDrivenGuide.run(args.targetDirectory, { dryRun: args.dryRun });
      return initResult;
    }
    case 'settings': {
      const settingsResult = await runSettingsMenu(args.targetDirectory);
      return settingsResult;
    }
    case 'creatives': {
      const { Creatives } = await import('./init/creatives-bundle.mjs');
      const creativesResult = await Creatives.run(args.targetDirectory);
      return creativesResult;
    }
    default: {
      const idleResult = null;
      return idleResult;
    }
  }
}

async function runSettingsMenu(targetDirectory) {
  const settingsChoice = await safeSelect({
    message: 'Settings:',
    choices: [
      {
        name: '1. 🔍 Governance Audit — Detect drift and law violations',
        value: 'audit',
      },
      {
        name: '2. 🔄 Update Instructions — Re-apply latest rules (uses saved config)',
        value: 'update-instructions',
      },
      { name: '3. 🗑️  Clear Generated Content — Remove all generated files', value: 'clear' },
      { name: '4. Back', value: 'back' },
    ],
  });

  const isBack = settingsChoice === 'back';
  if (isBack) {
    const backResult = null;
    return backResult;
  }

  switch (settingsChoice) {
    case 'audit': {
      const { AuditRunner } = await import('./audit/audit-bundle.mjs');
      const auditResult = await AuditRunner.run();
      return auditResult;
    }
    case 'update-instructions': {
      const updateResult = await performUpdateInstructions(targetDirectory);
      return updateResult;
    }
    case 'clear': {
      const { Cleaner } = await import('./maintenance/clear-bundle.mjs');
      const clearResult = await Cleaner.run(targetDirectory);
      return clearResult;
    }
    default: {
      const idleResult = null;
      return idleResult;
    }
  }
}

async function performUpdateInstructions(targetDirectory) {
  const { ManifestUtils } = await import('../lib/domain/manifest-utils.mjs');
  const { SDG: SpecDrivenGuide } = await import('./init/build-bundle.mjs');
  const manifest = ManifestUtils.loadManifest(targetDirectory);

  if (!manifest) {
    const noManifestMsg = '\n  ⚠️  No saved config found (.ai/.sdg-manifest.json).\n';
    const noManifestResult = console.log(noManifestMsg + '  Run init first.\n');
    return noManifestResult;
  }

  const { flavor, idioms } = manifest.selections;
  console.log(`\n  Re-applying latest rules — Flavor: ${flavor} | Idioms: ${idioms.join(', ')}\n`);

  try {
    await SpecDrivenGuide.run(targetDirectory, { selections: manifest.selections });
    const successResult = null;
    return successResult;
  } catch (error) {
    const failureResult = console.log(`\n  ❌ Update failed: ${error.message}\n`);
    return failureResult;
  }
}

export const CLI = { run };

runIfDirect(import.meta.url, run);
// dummy change

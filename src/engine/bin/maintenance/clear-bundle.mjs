import fs from 'node:fs';
import path from 'node:path';
import { confirm } from '@inquirer/prompts';
import { ResultUtils } from '../../lib/core/result-utils.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const { success } = ResultUtils;
const { runIfDirect } = FsUtils;

/**
 * Spec Driven Guide — Reset/Clear Utility
 * Deletes all generated SDG files and the .ia directory.
 */
async function run(targetDirectory = process.cwd(), options = {}) {
  await orchestrateCleanup(targetDirectory, options);
}

async function orchestrateCleanup(targetDirectory, options = {}) {
  const dryRun = options.dryRun || process.argv.includes('--dry-run');

  console.log('\n  Spec Driven Guide — Clear Generated Content');
  console.log('  ' + '─'.repeat(50));

  const itemsToRemove = ['.ia', '.ai', '.sdg-prompts'];
  let existingItems = [];

  // Check current directory
  for (const item of itemsToRemove) {
    const fullPath = path.join(targetDirectory, item);
    if (fs.existsSync(fullPath)) {
      existingItems.push({ name: item, fullPath });
    }
  }

  // Check packages/* if we are in a monorepo
  const packagesDir = path.join(targetDirectory, 'packages');
  if (fs.existsSync(packagesDir)) {
    const subPackages = fs.readdirSync(packagesDir);
    for (const packageFolderName of subPackages) {
      for (const item of itemsToRemove) {
        const fullPath = path.join(packagesDir, packageFolderName, item);
        if (fs.existsSync(fullPath)) {
          existingItems.push({ name: `packages/${packageFolderName}/${item}`, fullPath });
        }
      }
    }
  }

  if (existingItems.length === 0) {
    console.log('\n  ✅ No Spec Driven Guide content found to clear.\n');
    const noContentResult = success();
    return noContentResult;
  }

  if (dryRun) {
    console.log('\n  [DRY RUN] The following items would be removed:');
    for (const item of existingItems) {
      console.log(`  - ${item.name}`);
    }
    console.log('\n  No files were deleted (dry-run mode).\n');
    const dryRunResult = success();
    return dryRunResult;
  }

  printWarning();
  printItemsToRemove(existingItems);

  const userConfirmed = await confirm({
    message: '\n  Are you sure you want to proceed?',
    default: false,
  });

  if (!userConfirmed) {
    console.log('\n  Aborted. No files were deleted.\n');
    const abortResult = success();
    return abortResult;
  }

  executeCleanup(existingItems);

  console.log('\n  ✨ Project cleared successfully!\n');
  console.log('\n  ✨ Project cleared successfully!\n');
  const cleanupResult = success();
  return cleanupResult;
}

function printWarning() {
  console.log('\n');
  console.log('  ┌──────────────────────────────────────────────────────┐ ');
  console.log('  │  ⚠️  WARNING: PERMANENT DELETION DETECTED             │ ');
  console.log('  │  This action will IRREVERSIBLY remove all SDG rules, │ ');
  console.log('  │  AI instructions, and project manifests.             │ ');
  console.log('  └──────────────────────────────────────────────────────┘ ');
}

function printItemsToRemove(items) {
  console.log('\n  The following items will be REMOVED:');
  for (const item of items) {
    console.log(`  - ${item.name}`);
  }
}

function executeCleanup(items) {
  console.log('\n  Cleaning up...');

  for (const item of items) {
    const { name, fullPath } = item;
    try {
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(`  [OK] Removed ${name}`);
    } catch (error) {
      console.log(`  [FAIL] Could not remove ${name}: ${error.message}`);
    }
  }
}

export const Cleaner = {
  run,
};

runIfDirect(import.meta.url, run);

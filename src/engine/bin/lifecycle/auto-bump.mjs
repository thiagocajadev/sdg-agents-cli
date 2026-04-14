import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { ResultUtils } from '../../lib/core/result-utils.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const { success } = ResultUtils;
const { runIfDirect } = FsUtils;

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
const PACKAGE_PATHS = [path.join(ROOT_DIR, 'package.json')];
const CHANGELOG_PATH = path.join(ROOT_DIR, 'CHANGELOG.md');

export function detectBumpType(commitMessage) {
  const firstLine = commitMessage.split('\n')[0].trim();
  const footer = commitMessage.split('\n').slice(1).join('\n');

  if (/^chore:\s*bump version/i.test(firstLine)) {
    const skipBump = 'skip';
    return skipBump;
  }
  if (/^[a-z]+!:/.test(firstLine)) {
    const majorBump = 'major';
    return majorBump;
  }
  if (/BREAKING CHANGE:/m.test(footer)) {
    const breakerBump = 'major';
    return breakerBump;
  }
  if (/^feat:/.test(firstLine)) {
    const minorBump = 'minor';
    return minorBump;
  }
  const defaultBump = 'patch';
  return defaultBump;
}

export function bumpVersion(current, bumpType) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (bumpType) {
    case 'major': {
      const majorVersion = `${major + 1}.0.0`;
      return majorVersion;
    }
    case 'minor': {
      const minorVersion = `${major}.${minor + 1}.0`;
      return minorVersion;
    }
    case 'patch': {
      const patchVersion = `${major}.${minor}.${patch + 1}`;
      return patchVersion;
    }
    default: {
      const currentVersion = current;
      return currentVersion;
    }
  }
}

async function run() {
  await orchestrateAutoBump();
}

async function orchestrateAutoBump() {
  const commitMessage = readLastCommitMessage();
  const bumpType = detectBumpType(commitMessage);

  if (bumpType === 'skip') {
    console.log('  auto-bump: skipped (version commit detected)');
    const skipResult = success({ from: null, to: null, bump: 'skip' });
    return skipResult;
  }

  const rootPackagePath = PACKAGE_PATHS[0];
  const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
  const nextVersion = bumpVersion(rootPackage.version, bumpType);

  updateChangelog(nextVersion);
  syncAllPackages(nextVersion);

  console.log(`  auto-bump: ${rootPackage.version} → ${nextVersion} (${bumpType})`);
  console.log('  auto-bump: files updated. Manual commit required.');
  const finalResult = success({ from: rootPackage.version, to: nextVersion, bump: bumpType });
  return finalResult;
}

function updateChangelog(newVersion) {
  if (!fs.existsSync(CHANGELOG_PATH)) return;

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const today = new Date().toLocaleDateString('en-CA');
  const unreleasedRegex = /##\s*\[Unreleased\](\s*-\s*\d{4}-\d{2}-\d{2})?/i;

  if (!unreleasedRegex.test(content)) return;

  const newHeader = `## [${newVersion}] - ${today}`;
  let updatedContent = content.replace(unreleasedRegex, newHeader);

  const insertIndex = updatedContent.indexOf(newHeader);
  const nextBlock = `## [Unreleased]\n\n### Added\n\n### Fixed\n\n`;

  updatedContent =
    updatedContent.slice(0, insertIndex) + nextBlock + updatedContent.slice(insertIndex);

  fs.writeFileSync(CHANGELOG_PATH, updatedContent);
}

function syncAllPackages(nextVersion) {
  const validPaths = PACKAGE_PATHS.filter((packagePath) => fs.existsSync(packagePath));
  for (const packagePath of validPaths) {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageData.version = nextVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
  }
}

function readLastCommitMessage() {
  const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  return commitMessage;
}

export const AutoBump = {
  run,
  detectBumpType,
  bumpVersion,
};

runIfDirect(import.meta.url, run);

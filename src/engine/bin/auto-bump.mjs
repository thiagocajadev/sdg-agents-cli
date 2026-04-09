import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { ResultUtils } from '../lib/result-utils.mjs';
import { FsUtils } from '../lib/fs-utils.mjs';

const { success } = ResultUtils;
const { runIfDirect } = FsUtils;

// bin/ → engine/ → src/ → cli/ → packages/ → root
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../');
const PACKAGE_PATHS = [
  path.join(ROOT_DIR, 'package.json'),
  path.join(ROOT_DIR, 'packages', 'cli', 'package.json'),
  path.join(ROOT_DIR, 'packages', 'app', 'package.json'),
];

// --- Orchestrator ---

async function run() {
  const commitMsg = readLastCommitMessage();

  const bumpType = detectBumpType(commitMsg);
  if (bumpType === 'skip') {
    console.log('  auto-bump: skipped (version commit detected)');
    return success({ from: null, to: null, bump: 'skip' });
  }

  const rootPkg = readPackageJson(resolveRootPackagePath());
  const nextVersion = bumpVersion(rootPkg.version, bumpType);

  syncAllPackages(nextVersion);
  stageAndCommit(nextVersion);

  console.log(`  auto-bump: ${rootPkg.version} → ${nextVersion} (${bumpType})`);
  return success({ from: rootPkg.version, to: nextVersion, bump: bumpType });
}

// --- Core Logic ---

function detectBumpType(commitMsg) {
  const firstLine = commitMsg.split('\n')[0].trim();
  const footer = commitMsg.split('\n').slice(1).join('\n');

  if (/^chore:\s*bump version/i.test(firstLine)) return 'skip';
  if (/^[a-z]+!:/.test(firstLine)) return 'major';
  if (/BREAKING CHANGE:/m.test(footer)) return 'major';
  if (/^feat:/.test(firstLine)) return 'minor';
  return 'patch';
}

function bumpVersion(current, bumpType) {
  const [major, minor, patch] = current.split('.').map(Number);

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

// --- Sync & Commit ---

function syncAllPackages(nextVersion) {
  const paths = resolvePackagePaths();
  for (const pkgPath of paths) {
    writeVersion(pkgPath, nextVersion);
  }
}

function stageAndCommit(nextVersion) {
  const paths = resolvePackagePaths();
  const files = paths.filter((p) => fs.existsSync(p)).join(' ');
  execSync(`git add ${files}`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${nextVersion}"`, { stdio: 'inherit' });
}

// --- File Helpers ---

function readLastCommitMessage() {
  return execSync('git log -1 --pretty=%B').toString().trim();
}

function resolveRootPackagePath() {
  const candidates = PACKAGE_PATHS.filter((p) => {
    if (!fs.existsSync(p)) return false;
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    return pkg.workspaces !== undefined;
  });
  return candidates[0] ?? PACKAGE_PATHS[0];
}

function resolvePackagePaths() {
  return PACKAGE_PATHS.filter((p) => fs.existsSync(p));
}

function readPackageJson(pkgPath) {
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function writeVersion(pkgPath, version) {
  if (!fs.existsSync(pkgPath)) return;
  const pkg = readPackageJson(pkgPath);
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

export const AutoBump = {
  run,
  detectBumpType,
  bumpVersion,
};

runIfDirect(import.meta.url, run);

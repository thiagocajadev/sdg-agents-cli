#!/usr/bin/env node

import fileSystem from 'node:fs';
import path from 'node:path';

const VALID_BUMP_TYPES = ['patch', 'minor', 'major'];

function run() {
  const bumpType = process.argv[2];
  const isValidBumpType = VALID_BUMP_TYPES.includes(bumpType);
  if (!isValidBumpType) {
    console.error(`❌ Usage: bump-version.mjs <${VALID_BUMP_TYPES.join('|')}>`);
    process.exit(1);
  }

  const packagePath = resolvePackagePath();
  const packageData = readPackageJson(packagePath);

  const currentVersion = packageData.version;
  const nextVersion = incrementVersion(currentVersion, bumpType);

  packageData.version = nextVersion;
  writePackageJson(packagePath, packageData);

  const transitionMessage = `${currentVersion} → ${nextVersion}`;
  console.log(transitionMessage);
}

function resolvePackagePath() {
  const packagePath = path.join(process.cwd(), 'package.json');
  return packagePath;
}

function readPackageJson(packagePath) {
  if (!fileSystem.existsSync(packagePath)) {
    console.error(`❌ Not found: ${packagePath}`);
    process.exit(1);
  }

  const rawContent = fileSystem.readFileSync(packagePath, 'utf8');
  const parsed = JSON.parse(rawContent);

  const hasVersion = typeof parsed.version === 'string' && parsed.version.length > 0;
  if (!hasVersion) {
    console.error(`❌ Missing "version" field in ${packagePath}`);
    process.exit(1);
  }

  return parsed;
}

function incrementVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map((value) => Number.parseInt(value, 10));
  const isSemverTriplet = parts.length === 3 && parts.every((value) => Number.isFinite(value));
  if (!isSemverTriplet) {
    console.error(`❌ Invalid semver: ${currentVersion}`);
    process.exit(1);
  }

  const [major, minor, patch] = parts;

  const INCREMENTERS = {
    major: () => `${major + 1}.0.0`,
    minor: () => `${major}.${minor + 1}.0`,
    patch: () => `${major}.${minor}.${patch + 1}`,
  };

  const nextVersion = INCREMENTERS[bumpType]();
  return nextVersion;
}

function writePackageJson(packagePath, packageData) {
  const serialized = `${JSON.stringify(packageData, null, 2)}\n`;
  fileSystem.writeFileSync(packagePath, serialized);
}

run();

import fileSystem from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { FsUtils } from '../../lib/core/fs-utils.mjs';
import { ResultUtils } from '../../lib/core/result-utils.mjs';

const { bootstrapIfDirect, isMaintainerMode } = FsUtils;
const { success, fail } = ResultUtils;

const PROJECT_ROOT = process.cwd();
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets', 'instructions');
const AI_DIR = path.join(PROJECT_ROOT, '.ai', 'instructions');

const MIRRORED_DIRS = ['templates', 'competencies', 'commands', 'flavors'];

function checkDrift() {
  const syncCheckOutcome = orchestrateSyncCheck();
  return syncCheckOutcome;
}

function orchestrateSyncCheck() {
  if (!isMaintainerMode()) {
    const skipResult = success();
    return skipResult;
  }

  const driftedFiles = [];

  for (const mirroredDirectory of MIRRORED_DIRS) {
    const liveDirectory = path.join(AI_DIR, mirroredDirectory);
    const sourceDirectory = path.join(ASSETS_DIR, mirroredDirectory);

    const directoryDrifts = collectDriftedFiles(liveDirectory, sourceDirectory, mirroredDirectory);
    driftedFiles.push(...directoryDrifts);
  }

  const driftReport = reportResult(driftedFiles);
  return driftReport;
}

function collectDriftedFiles(liveDirectory, sourceDirectory, relativePrefix) {
  if (!fileSystem.existsSync(liveDirectory)) {
    const emptyResult = [];
    return emptyResult;
  }

  const entries = fileSystem.readdirSync(liveDirectory, { withFileTypes: true });
  const localDrifts = [];

  for (const entry of entries) {
    const relativePath = path.join(relativePrefix, entry.name);
    const livePath = path.join(liveDirectory, entry.name);
    const sourcePath = path.join(sourceDirectory, entry.name);

    if (entry.isDirectory()) {
      const nestedDrifts = collectDriftedFiles(livePath, sourcePath, relativePath);
      localDrifts.push(...nestedDrifts);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const fileDrift = checkFileDrift(livePath, sourcePath, relativePath);
      if (fileDrift !== null) {
        localDrifts.push(fileDrift);
      }
    }
  }

  const foundDrifts = localDrifts;
  return foundDrifts;
}

function checkFileDrift(livePath, sourcePath, relativePath) {
  if (!fileSystem.existsSync(sourcePath)) {
    const missingDrift = { relativePath, reason: 'missing in src/assets/' };
    return missingDrift;
  }

  const liveHash = hashFile(livePath);
  const sourceHash = hashFile(sourcePath);

  if (liveHash !== sourceHash) {
    const contentDrift = { relativePath, reason: 'content differs' };
    return contentDrift;
  }

  return null;
}

function hashFile(filePath) {
  const content = fileSystem.readFileSync(filePath);
  const fileHash = crypto.createHash('sha256').update(content).digest('hex');
  return fileHash;
}

function reportResult(drifts) {
  if (drifts.length === 0) {
    console.log('\n  ✅ .ai/instructions/ is in sync with src/assets/instructions/\n');

    const syncOk = success();
    return syncOk;
  }

  console.error('\n  ❌ Drift detected — files in .ai/ differ from src/assets/:\n');
  for (const drift of drifts) {
    console.error(`     ${drift.relativePath} (${drift.reason})`);
  }

  console.error(
    '\n  Fix: apply the same edits to both copies, or re-run `npx sdg-agents init` to regenerate.\n'
  );

  const driftFailure = fail({ message: 'SYNC_DRIFT', count: drifts.length });
  return driftFailure;
}

export const SyncChecker = { check: checkDrift };

bootstrapIfDirect(import.meta.url, async () => {
  const result = checkDrift();
  if (result.isFailure) {
    process.exit(1);
  }
});

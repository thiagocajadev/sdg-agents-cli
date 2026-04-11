/**
 * Check Sync — Detects drift between the source-of-truth assets and the live .ai/ directory.
 * Compares only the mirrored directories — not flavor/ which is generated with a rename.
 * The .ai/ directory is a curated subset of src/assets/ — not a full mirror.
 *
 * FOLLOWS: Narrative Cascade & Lexical Scoping (nested helpers)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { FsUtils } from '../lib/fs-utils.mjs';
import { ResultUtils } from '../lib/result-utils.mjs';

const { runIfDirect } = FsUtils;
const { success, fail } = ResultUtils;

const PROJECT_ROOT = process.cwd();
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets', 'instructions');
const AI_DIR = path.join(PROJECT_ROOT, '.ai', 'instructions');

// why: flavor/ in .ai/ is populated by renaming flavors/{id}/ — no direct mirror exists in src/assets/flavor/
const MIRRORED_DIRS = ['core', 'idioms', 'templates', 'competencies'];

/**
 * Compares files present in .ai/ mirrored directories against src/assets/.
 * Reports any files that exist in .ai/ but differ from their src/assets/ counterpart.
 */
function run() {
  const driftedFiles = [];

  for (const mirroredDir of MIRRORED_DIRS) {
    const liveDir = path.join(AI_DIR, mirroredDir);
    const sourceDir = path.join(ASSETS_DIR, mirroredDir);
    const dirDrifts = collectDriftedFiles(liveDir, sourceDir, mirroredDir);
    driftedFiles.push(...dirDrifts);
  }

  const runResult = reportResult(driftedFiles);
  return runResult;

  // --- Scoped Internal Helpers (The Stepdown Rule & Lexical Scoping) ---

  function collectDriftedFiles(liveDir, sourceDir, relPrefix) {
    if (!fs.existsSync(liveDir)) return [];

    const entries = fs.readdirSync(liveDir, { withFileTypes: true });
    const localDrifts = [];

    for (const entry of entries) {
      const relPath = path.join(relPrefix, entry.name);
      const livePath = path.join(liveDir, entry.name);
      const sourcePath = path.join(sourceDir, entry.name);

      if (entry.isDirectory()) {
        const nestedDrifts = collectDriftedFiles(livePath, sourcePath, relPath);
        localDrifts.push(...nestedDrifts);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const fileDrift = checkFileDrift(livePath, sourcePath, relPath);
        if (fileDrift !== null) localDrifts.push(fileDrift);
      }
    }

    return localDrifts;
  }

  function checkFileDrift(livePath, sourcePath, relPath) {
    if (!fs.existsSync(sourcePath)) {
      const missingDrift = { relPath, reason: 'missing in src/assets/' };
      return missingDrift;
    }

    const liveHash = hashFile(livePath);
    const sourceHash = hashFile(sourcePath);

    if (liveHash !== sourceHash) {
      const contentDrift = { relPath, reason: 'content differs' };
      return contentDrift;
    }

    return null;

    function hashFile(filePath) {
      const content = fs.readFileSync(filePath);
      const fileHash = crypto.createHash('sha256').update(content).digest('hex');
      return fileHash;
    }
  }

  function reportResult(drifts) {
    if (drifts.length === 0) {
      console.log('\n  ✅ .ai/instructions/ is in sync with src/assets/instructions/\n');
      const syncOk = success();
      return syncOk;
    }

    console.error('\n  ❌ Drift detected — files in .ai/ differ from src/assets/:\n');
    for (const drift of drifts) {
      console.error(`     ${drift.relPath} (${drift.reason})`);
    }
    console.error(
      '\n  Fix: apply the same edits to both copies, or re-run `npx sdg-agents init` to regenerate.\n'
    );
    const driftFailure = fail({ message: 'SYNC_DRIFT', count: drifts.length });
    return driftFailure;
  }
}

export const SyncChecker = { run };

runIfDirect(import.meta.url, async () => {
  const result = run();
  if (result.isFailure) process.exit(1);
});

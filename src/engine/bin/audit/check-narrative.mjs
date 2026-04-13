import fs from 'node:fs';
import path from 'node:path';
import { NARRATIVE_CHECKLIST } from '../../config/governance.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

/**
 * Narrative Auditor — Specialized Law 3 compliance tool.
 */

const PROJECT_ROOT = process.cwd();
const { runIfDirect } = FsUtils;

async function run() {
  await orchestrateNarrativeAudit();
}

async function orchestrateNarrativeAudit() {
  printHeader();

  const files = collectTargetFiles();
  const { violationsByFile, totalViolations } = scanFilesForViolations(files);

  reportResults(violationsByFile, totalViolations);
}

function printHeader() {
  console.log('\n' + '─'.repeat(50));
  console.log('  📖 SDG NARRATIVE AUDIT — Law 3 Compliance');
  console.log('─'.repeat(50) + '\n');
}

function collectTargetFiles() {
  const targetDirectories = [
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'core'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'domain'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'infra'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'init'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'audit'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'maintenance'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'lifecycle'),
  ];

  const files = targetDirectories.flatMap((directory) => {
    if (!fs.existsSync(directory)) return [];
    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.mjs') && !file.endsWith('.test.mjs'))
      .map((file) => path.join(directory, file));
  });

  return files;
}

function scanFilesForViolations(files) {
  const violationsByFile = {};
  let totalViolations = 0;

  for (const filePath of files) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const fileViolations = [];

    for (const rule of NARRATIVE_CHECKLIST) {
      if (!rule.heuristic) continue;
      const result = rule.heuristic(content);
      if (!result.pass) {
        fileViolations.push({ label: rule.label, reason: result.reason });
        totalViolations++;
      }
    }

    if (fileViolations.length > 0) {
      violationsByFile[relativePath] = fileViolations;
    }
  }

  return { violationsByFile, totalViolations };
}

function reportResults(violationsByFile, totalViolations) {
  const filePaths = Object.keys(violationsByFile);

  if (filePaths.length === 0) {
    console.log('  ✅ ALL FILES NARRATIVE COMPLIANT. Scansion flow is healthy.\n');
    return;
  }

  for (const filePath of filePaths) {
    console.log(`  ❌ ${filePath}`);
    for (const violation of violationsByFile[filePath]) {
      console.log(`     — ${violation.label}: ${violation.reason}`);
    }
    console.log('');
  }

  console.log('─'.repeat(50));
  console.log(`  ⚠️  NARRATIVE DRIFT DETECTED: ${totalViolations} violations found.`);
  console.log('  Recommendation: Apply "Code as Documentation" (Law 3).');
  console.log('─'.repeat(50) + '\n');
}

export const NarrativeChecker = { run };

runIfDirect(import.meta.url, run);

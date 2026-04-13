import fs from 'node:fs';
import path from 'node:path';
import { NARRATIVE_CHECKLIST } from '../config/governance.mjs';
import { FsUtils } from '../lib/fs-utils.mjs';

/**
 * Narrative Auditor — Specialized Law 3 compliance tool.
 */

const PROJECT_ROOT = process.cwd();
const { runIfDirect } = FsUtils;

async function run() {
  console.log('\n' + '─'.repeat(50));
  console.log('  📖 SDG NARRATIVE AUDIT — Law 3 Compliance');
  console.log('─'.repeat(50) + '\n');

  const targetDirs = [
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin'),
  ];

  const files = targetDirs.flatMap((dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.mjs') && !f.endsWith('.test.mjs'))
      .map((f) => path.join(dir, f));
  });

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

  reportResults(violationsByFile, totalViolations);
}

function reportResults(violationsByFile, totalViolations) {
  const filePaths = Object.keys(violationsByFile);

  if (filePaths.length === 0) {
    console.log('  ✅ ALL FILES NARRATIVE COMPLIANT. Scansion flow is healthy.\n');
    return;
  }

  for (const filePath of filePaths) {
    console.log(`  ❌ ${filePath}`);
    for (const v of violationsByFile[filePath]) {
      console.log(`     — ${v.label}: ${v.reason}`);
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

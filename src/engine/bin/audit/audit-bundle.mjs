import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { SyncChecker } from './check-sync.mjs';
import { AuditFileScanner } from './audit-file-scanner.mjs';
import { NARRATIVE_CHECKLIST } from '../../config/governance.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';
import { DisplayUtils } from '../../lib/core/display-utils.mjs';

const { smartTruncate } = DisplayUtils;

const PROJECT_ROOT = process.cwd();
const { runIfDirect, isMaintainerMode } = FsUtils;

async function run() {
  await executeGovernanceAudit();
}

async function executeGovernanceAudit() {
  const auditResults = orchestrateGovernanceAudit();
  reportSummary(auditResults);
}

function orchestrateGovernanceAudit() {
  printHeader();

  const results = {
    drift: SyncChecker.run(),
    narrative: checkChangelogHealth(),
    laws: checkLawsCompliance(),
    tests: checkTestNamedExpectations(),
    soul: checkSoulPulse(),
    hygiene: checkHygienePulse(),
    backlog: checkBacklogHealth(),
    sovereign: checkSovereignCompliance(),
  };

  const auditResults = results;
  return auditResults;
}

function printHeader() {
  console.log('\n' + '─'.repeat(50));
  console.log('  🔍 SDG GOVERNANCE AUDIT — v2.0.0 compliance');
  console.log('─'.repeat(50) + '\n');
}

function checkChangelogHealth() {
  const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    const missingChangelogResult = { isFailure: true, reason: 'CHANGELOG.md missing' };
    return missingChangelogResult;
  }

  const content = fs.readFileSync(changelogPath, 'utf8');
  const hasUnreleased = /##\s*\[Unreleased\]/i.test(content);
  const unreleasedMatch = content.match(
    /##\s*\[Unreleased\].*?\n([\s\S]*?)(?=\n##\s|(?:\n){0,1}$)/i
  );
  const narrative = unreleasedMatch ? unreleasedMatch[1].replace(/###.*?\n/g, '').trim() : '';

  // 1. Block if narrative exists but wasn't promoted
  if (hasUnreleased && narrative.length > 5) {
    const pendingNarrativeIssue = {
      isFailure: true,
      reason: 'Pending narrative in [Unreleased]. Run npm run bump.',
    };
    return pendingNarrativeIssue;
  }

  // 2. Block if changes are staged but [Unreleased] is empty (The "Thiago" Gate)
  const stagedChanges = spawnSync('git', ['diff', '--staged', '--name-only'], {
    encoding: 'utf8',
  }).stdout.trim();

  const hasOtherStagedChanges =
    stagedChanges.split('\n').filter((file) => file && file !== 'CHANGELOG.md').length > 0;

  if (hasOtherStagedChanges && narrative.length <= 5) {
    const missingNarrativeIssue = {
      isFailure: true,
      reason: 'Staged changes detected but [Unreleased] is empty. Document your work!',
    };
    return missingNarrativeIssue;
  }

  const healthResult = { isFailure: false };
  return healthResult;
}

function checkLawsCompliance() {
  const files = isMaintainerMode()
    ? AuditFileScanner.getMaintainerFiles()
    : AuditFileScanner.getFilesRecursive(
        path.join(PROJECT_ROOT, 'src'),
        (fileName) => fileName.endsWith('.mjs') && !fileName.endsWith('.test.mjs')
      );

  const violations = [];
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    for (const rule of NARRATIVE_CHECKLIST) {
      if (!rule.heuristic) continue;
      const result = rule.heuristic(content);
      if (!result.pass) {
        violations.push(`${fileName}: ${result.reason}`);
      }
    }
  }

  const lawsResult = {
    isFailure: violations.length > 0,
    violations,
    score: violations.length === 0 ? '100%' : `${Math.max(0, 100 - violations.length * 10)}%`,
  };

  const finalLawsResult = lawsResult;
  return finalLawsResult;
}

function checkTestNamedExpectations() {
  const testFiles = isMaintainerMode()
    ? AuditFileScanner.getMaintainerTestFiles()
    : AuditFileScanner.getFilesRecursive(path.join(PROJECT_ROOT, 'src'), (fileName) =>
        fileName.endsWith('.test.mjs')
      );

  const violations = [];

  for (const testFile of testFiles) {
    const content = fs.readFileSync(testFile, 'utf8');
    const slopMatches = content.match(/\/\/\s*(Arrange|Act|Assert)/gi);
    if (slopMatches) {
      violations.push(
        `${testFile}: Detected narrative slop (${slopMatches.join(', ')}). Use Vertical Scansion.`
      );
    }

    if (!content.includes('actual') || !content.includes('expected')) {
      violations.push(`${testFile}: Missing Named Expectations triad (actual/expected variables).`);
    }

    const numberedMatches = content.match(/\b(input|actual|expected)[0-9]+\b/g);
    if (numberedMatches) {
      violations.push(
        `${testFile}: Detected numbered variables (${Array.from(new Set(numberedMatches)).join(
          ', '
        )}).`
      );
    }

    const strictMagicMatch = content.match(
      /assert\.(?:equal|deepEqual|strictEqual)\s*\([^,]+,\s*(?:['"`0-9]|\b(?:null|true|false)\b)/
    );
    if (strictMagicMatch) {
      violations.push(`${testFile}: Detected magic values in assertions. Use named constants.`);
    }
  }

  const expectationsResult = {
    isFailure: violations.length > 0,
    violations,
    score: violations.length === 0 ? '100%' : `${Math.max(0, 100 - violations.length * 10)}%`,
  };

  const finalExpectationsResult = expectationsResult;
  return finalExpectationsResult;
}

function checkSovereignCompliance() {
  const staffDnaPath = path.join(PROJECT_ROOT, '.ai', 'instructions', 'core', 'staff-dna.md');
  const agentsPath = path.join(PROJECT_ROOT, '.ai', 'skill', 'AGENTS.md');

  const violations = [];

  if (fs.existsSync(staffDnaPath)) {
    const dnaContent = fs.readFileSync(staffDnaPath, 'utf8');
    if (!dnaContent.includes('Law 0: The Law of Protocol')) {
      violations.push('staff-dna.md: Missing Law 0 (Sovereignty Gate)');
    }
    if (!dnaContent.includes('Law 7: The Law of Contextual Efficiency')) {
      violations.push('staff-dna.md: Missing Law 7 (Token Discipline)');
    }
  } else {
    violations.push('staff-dna.md: File missing from .ai/');
  }

  if (fs.existsSync(agentsPath)) {
    const agentsContent = fs.readFileSync(agentsPath, 'utf8');
    if (!agentsContent.includes('DNA-GATE & MENTAL RESET [LOCKED]')) {
      violations.push('AGENTS.md: Missing DNA-GATE [LOCKED] mandatory protocol');
    }
  } else {
    violations.push('AGENTS.md: File missing from .ai/');
  }

  const sovereignComplianceResult = {
    isFailure: violations.length > 0,
    violations,
    message: violations.length > 0 ? violations.join(' | ') : 'Sovereign Protocol active.',
  };
  return sovereignComplianceResult;
}

function checkBacklogHealth() {
  const backlogDir = path.join(PROJECT_ROOT, '.ai-backlog');
  if (!fs.existsSync(backlogDir)) {
    const missingBacklogResult = { isFailure: false, message: 'Backlog not initialized' };
    return missingBacklogResult;
  }

  const files = fs.readdirSync(backlogDir);
  const largeFiles = files.filter((file) => {
    const stats = fs.statSync(path.join(backlogDir, file));
    const isLarge = stats.size > 1024 * 50; // > 50KB
    return isLarge;
  });

  const isFailure = largeFiles.length > 0;
  const backlogHealthResult = {
    isFailure,
    largeFiles,
    message: isFailure
      ? `Detected context bloat in: ${largeFiles.join(', ')}. Run 'context-reset'.`
      : 'Healthy (no bloat)',
  };
  return backlogHealthResult;
}

function checkSoulPulse() {
  const requiredFiles = ['README.md'];
  const maintainerOnlyFiles = isMaintainerMode() ? ['docs/README.pt-BR.md', 'docs/ROADMAP.md'] : [];
  const files = [...requiredFiles, ...maintainerOnlyFiles];
  const missing = files.filter((file) => !fs.existsSync(path.join(PROJECT_ROOT, file)));
  const soulPulse = { isFailure: missing.length > 0, missing };
  return soulPulse;
}

function checkHygienePulse() {
  const results = { lint: 'SKIPPED', test: 'SKIPPED', isFailure: false };
  try {
    const lint = spawnSync('npm', ['run', 'lint', '--silent'], {
      cwd: PROJECT_ROOT,
      shell: false,
      encoding: 'utf8',
    });
    results.lint = lint.status === 0 ? 'PASS' : 'FAIL';
  } catch {
    results.lint = 'UNAVAILABLE';
  }

  try {
    const test = spawnSync('npm', ['test', '--silent'], {
      cwd: PROJECT_ROOT,
      shell: false,
      encoding: 'utf8',
    });
    results.test = test.status === 0 ? 'PASS' : 'FAIL';
  } catch {
    results.test = 'UNAVAILABLE';
  }

  results.isFailure = results.lint === 'FAIL' || results.test === 'FAIL';
  const finalHygieneResults = results;
  return finalHygieneResults;
}

function reportSummary(results) {
  console.log('\n' + '─'.repeat(50));
  console.log('  AUDIT SUMMARY');
  console.log('─'.repeat(50));

  printResult('Instruction Sync', !results.drift.isFailure);
  printResult('Narrative (Changelog)', !results.narrative.isFailure, results.narrative.reason);
  printResult(
    'Laws Compliance',
    !results.laws.isFailure,
    results.laws.isFailure
      ? `found ${results.laws.violations.length} violations:\n      - ` +
          results.laws.violations.join('\n      - ')
      : null
  );
  printResult('Test Expectations', !results.tests.isFailure, results.tests.violations[0]);
  printResult(
    'Writing Soul',
    !results.soul.isFailure,
    results.soul.missing.length ? `Missing: ${results.soul.missing.join(', ')}` : null
  );
  printResult(
    'Code Hygiene',
    !results.hygiene.isFailure,
    `Lint: ${results.hygiene.lint} | Tests: ${results.hygiene.test}`
  );
  printResult('Backlog Health', !results.backlog.isFailure, results.backlog.message);
  printResult('Sovereign Protocol', !results.sovereign.isFailure, results.sovereign.message);

  const totalFailures = [
    results.drift,
    results.narrative,
    results.laws,
    results.soul,
    results.tests,
    results.hygiene,
    results.sovereign,
    results.backlog,
  ].filter((result) => result && result.isFailure).length;

  if (totalFailures === 0) {
    console.log('\n  ✅ PROJECT COMPLIANT. Governance at 100%.\n');
  } else {
    console.log(`\n  ⚠️  PROJECT DRIFT: ${totalFailures} governance gaps found.\n`);
  }
}

function printResult(label, success, reason) {
  const icon = success ? '✅' : '❌';
  const truncatedReason = smartTruncate(reason, 10, 5); // Conservative truncation for UI
  console.log(`  ${icon} ${label.padEnd(25)} ${reason ? `— ${truncatedReason}` : ''}`);
}

export const AuditRunner = { run };

runIfDirect(import.meta.url, () => run().catch(handleAuditError));

function handleAuditError(error) {
  console.error('Audit failed:', error);
  process.exit(1);
}

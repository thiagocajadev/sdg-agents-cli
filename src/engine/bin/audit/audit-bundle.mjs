import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { SyncChecker } from './check-sync.mjs';
import { NARRATIVE_CHECKLIST } from '../../config/governance.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const PROJECT_ROOT = process.cwd();
const { runIfDirect } = FsUtils;

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

  if (hasUnreleased && narrative.length > 5) {
    const pendingNarrativeIssue = {
      isFailure: true,
      reason: 'Pending narrative in [Unreleased]. Run npm run bump.',
    };
    return pendingNarrativeIssue;
  }

  const healthResult = { isFailure: false };
  return healthResult;
}

function checkLawsCompliance() {
  const targetDirectories = [
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'core'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'domain'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'infra'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'init'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'audit'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'maintenance'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'lifecycle'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'config'),
  ];

  const files = targetDirectories.flatMap((directory) => {
    if (!fs.existsSync(directory)) {
      const emptyDirFiles = [];
      return emptyDirFiles;
    }

    const directoryFiles = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.mjs') && !file.endsWith('.test.mjs'))
      .map((file) => path.join(directory, file));

    return directoryFiles;
  });

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
  const scanDirectories = [
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'core'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'domain'),
    path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'infra'),
  ];

  const violations = [];

  for (const directory of scanDirectories) {
    if (!fs.existsSync(directory)) continue;
    const testFiles = fs.readdirSync(directory).filter((file) => file.endsWith('.test.mjs'));

    for (const testFile of testFiles) {
      const content = fs.readFileSync(path.join(directory, testFile), 'utf8');
      const slopMatches = content.match(/\/\/\s*(Arrange|Act|Assert)/gi);
      if (slopMatches) {
        violations.push(
          `${testFile}: Detected narrative slop (${slopMatches.join(', ')}). Use Vertical Scansion.`
        );
      }

      if (!content.includes('actual') || !content.includes('expected')) {
        violations.push(
          `${testFile}: Missing Named Expectations triad (actual/expected variables).`
        );
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
  }

  const expectationsResult = {
    isFailure: violations.length > 0,
    violations,
    score: violations.length === 0 ? '100%' : `${Math.max(0, 100 - violations.length * 10)}%`,
  };

  const finalExpectationsResult = expectationsResult;
  return finalExpectationsResult;
}

function checkSoulPulse() {
  const files = ['README.md', 'docs/README.pt-BR.md', 'docs/ROADMAP.md'];
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

  const totalFailures = [
    results.drift,
    results.narrative,
    results.law3,
    results.soul,
    results.tests,
    results.hygiene,
  ].filter((result) => result && result.isFailure).length;

  if (totalFailures === 0) {
    console.log('\n  ✅ PROJECT COMPLIANT. Governance at 100%.\n');
  } else {
    console.log(`\n  ⚠️  PROJECT DRIFT: ${totalFailures} governance gaps found.\n`);
  }
}

function printResult(label, success, reason) {
  const icon = success ? '✅' : '❌';
  console.log(`  ${icon} ${label.padEnd(25)} ${reason ? `— ${reason}` : ''}`);
}

export const AuditRunner = { run };

runIfDirect(import.meta.url, () => run().catch(handleAuditError));

function handleAuditError(error) {
  console.error('Audit failed:', error);
  process.exit(1);
}

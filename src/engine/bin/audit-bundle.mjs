import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { SyncChecker } from './check-sync.mjs';
import { NARRATIVE_CHECKLIST } from '../config/governance.mjs';
import { FsUtils } from '../lib/fs-utils.mjs';

const PROJECT_ROOT = process.cwd();
const { runIfDirect } = FsUtils;

async function run() {
  console.log('\n' + '─'.repeat(50));
  console.log('  🔍 SDG GOVERNANCE AUDIT — v2.0.0 compliance');
  console.log('─'.repeat(50) + '\n');

  const auditResults = {
    drift: null,
    narrative: null,
    law3: null,
    soul: null,
    tests: null,
    hygiene: null,
  };

  console.log('  [1/6] Checking Instruction Sync...');
  auditResults.drift = SyncChecker.run();

  console.log('  [2/6] Checking Narrative Health...');
  auditResults.narrative = checkChangelogHealth();

  console.log('  [3/6] Validating Law 3 (Narrative Cascade)...');
  auditResults.law3 = checkLaw3Compliance();

  console.log('  [4/6] Verifying Writing Soul...');
  auditResults.soul = checkSoulPulse();

  console.log('  [5/6] Auditing Test Expectations...');
  auditResults.tests = checkTestNamedExpectations();

  console.log('  [6/6] Verifying Code Hygiene (Soft check)...');
  auditResults.hygiene = checkHygienePulse();

  reportSummary(auditResults);

  function checkChangelogHealth() {
    const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) return { isFailure: true, reason: 'CHANGELOG.md missing' };

    const content = fs.readFileSync(changelogPath, 'utf8');
    const hasUnreleased = /##\s*\[Unreleased\]/i.test(content);
    const unreleasedMatch = content.match(
      /##\s*\[Unreleased\].*?\n([\s\S]*?)(?=\n##\s|(?:\n){0,1}$)/i
    );
    const narrative = unreleasedMatch ? unreleasedMatch[1].replace(/###.*?\n/g, '').trim() : '';

    if (hasUnreleased && narrative.length > 5) {
      return { isFailure: true, reason: 'Pending narrative in [Unreleased]. Run npm run bump.' };
    }
    return { isFailure: false };
  }

  function checkLaw3Compliance() {
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

    return {
      isFailure: violations.length > 0,
      violations,
      score: violations.length === 0 ? '100%' : `${Math.max(0, 100 - violations.length * 10)}%`,
    };
  }

  function checkTestNamedExpectations() {
    const libDir = path.join(PROJECT_ROOT, 'src', 'engine', 'lib');
    if (!fs.existsSync(libDir)) return { isFailure: false, violations: [] };

    const files = fs.readdirSync(libDir).filter((f) => f.endsWith('.test.mjs'));
    const violations = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(libDir, file), 'utf8');
      const slopMatches = content.match(/\/\/\s*(Arrange|Act|Assert)/gi);
      if (slopMatches) {
        violations.push(
          `${file}: Detected narrative slop (${slopMatches.join(', ')}). Use Vertical Scansion.`
        );
      }

      if (!content.includes('actual') || !content.includes('expected')) {
        violations.push(`${file}: Missing Named Expectations triad (actual/expected variables).`);
      }

      const numberedMatches = content.match(/\b(input|actual|expected)[0-9]+\b/g);
      if (numberedMatches) {
        violations.push(
          `${file}: Detected numbered variables (${Array.from(new Set(numberedMatches)).join(', ')}).`
        );
      }

      const strictMagicMatch = content.match(
        /assert\.(?:equal|deepEqual|strictEqual)\s*\([^,]+,\s*(?:['"`0-9]|\b(?:null|true|false)\b)/
      );
      if (strictMagicMatch) {
        violations.push(`${file}: Detected magic values in assertions. Use named constants.`);
      }
    }

    return {
      isFailure: violations.length > 0,
      violations,
      score: violations.length === 0 ? '100%' : `${Math.max(0, 100 - violations.length * 10)}%`,
    };
  }

  function checkSoulPulse() {
    const files = ['README.md', 'docs/README.pt-BR.md', 'docs/ROADMAP.md'];
    const missing = files.filter((f) => !fs.existsSync(path.join(PROJECT_ROOT, f)));
    return { isFailure: missing.length > 0, missing };
  }

  function checkHygienePulse() {
    const results = { lint: 'SKIPPED', test: 'SKIPPED', isFailure: false };
    try {
      const lint = spawnSync('npm', ['run', 'lint', '--silent'], {
        cwd: PROJECT_ROOT,
        shell: true,
        encoding: 'utf8',
      });
      results.lint = lint.status === 0 ? 'PASS' : 'FAIL';
    } catch {
      results.lint = 'UNAVAILABLE';
    }

    try {
      const test = spawnSync('npm', ['test', '--silent'], {
        cwd: PROJECT_ROOT,
        shell: true,
        encoding: 'utf8',
      });
      results.test = test.status === 0 ? 'PASS' : 'FAIL';
    } catch {
      results.test = 'UNAVAILABLE';
    }

    results.isFailure = results.lint === 'FAIL' || results.test === 'FAIL';
    return results;
  }

  function reportSummary(results) {
    console.log('\n' + '─'.repeat(50));
    console.log('  AUDIT SUMMARY');
    console.log('─'.repeat(50));

    printResult('Instruction Sync', !results.drift.isFailure);
    printResult('Narrative (Changelog)', !results.narrative.isFailure, results.narrative.reason);
    printResult('Law 3 compliance', !results.law3.isFailure, results.law3.violations[0]);
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
    ].filter((r) => r && r.isFailure).length;

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
}

export const AuditRunner = { run };

runIfDirect(import.meta.url, () => {
  run().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
});

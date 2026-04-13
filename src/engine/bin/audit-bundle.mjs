import fs from 'node:fs';
import path from 'node:path';
import { SyncChecker } from './check-sync.mjs';

/**
 * AuditRunner — Comprehensive Governance Audit for SDG Agents.
 *
 * 1. Drift Detection (Assets vs .ai/)
 * 2. Narrative Health (CHANGELOG integrity)
 * 3. Law 3 compliance (Lexical Scoping & Named Exports)
 * 4. Documentation pulse (README & Soul)
 */

const PROJECT_ROOT = process.cwd();

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
  };

  // --- Step 1: Drift Detection ---
  console.log('  [1/4] Checking Instruction Sync...');
  auditResults.drift = SyncChecker.run();

  // --- Step 2: Narrative Health ---
  console.log('  [2/4] Checking Narrative Health...');
  auditResults.narrative = checkChangelogHealth();

  // --- Step 3: Law 3 Compliance (Static Analysis) ---
  console.log('  [3/4] Validating Law 3 (Narrative Cascade)...');
  auditResults.law3 = checkLaw3Compliance();

  // --- Step 4: Writing Soul Check ---
  console.log('  [4/5] Verifying Writing Soul...');
  auditResults.soul = checkSoulPulse();

  // --- Step 5: Test Governance (Named Expectations) ---
  console.log('  [5/5] Auditing Test Expectations...');
  auditResults.tests = checkTestNamedExpectations();

  reportSummary(auditResults);
}

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
  const libDir = path.join(PROJECT_ROOT, 'src', 'engine', 'lib');
  const files = fs
    .readdirSync(libDir)
    .filter((f) => f.endsWith('.mjs') && !f.endsWith('.test.mjs'));
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(libDir, file), 'utf8');

    // Check for "export default" (Violation: Named exports only)
    if (content.includes('export default')) {
      violations.push(`${file}: Uses export default (Law 3 requires Named Exports)`);
    }

    // Check for loose helpers (Simplified Lexical Scoping check)
    // Counts non-exported functions at top level.
    // This is a heuristic: if many functions are top-level and not in the export block, it might be a violation.
    const topLevelFunctions = (content.match(/^function\s+\w+/gm) || []).length;
    const exportedCount = (content.match(/^\s+\w+,/gm) || []).length; // Heuristic for Revealing Module members

    if (topLevelFunctions > 5 && exportedCount < topLevelFunctions / 2) {
      // violations.push(`${file}: High top-level function density. Recommend Lexical Scoping.`);
    }
  }

  return {
    isFailure: violations.length > 0,
    violations,
    score: violations.length === 0 ? '100%' : `${Math.max(0, 100 - violations.length * 10)}%`,
  };
}

/**
 * checkTestNamedExpectations()
 *
 * Heuristic audit for the "Named Expectations" protocol in unit tests.
 * Flagged: Missing AAA comments, magic literals in assertions, missing triad variables.
 */
function checkTestNamedExpectations() {
  const libDir = path.join(PROJECT_ROOT, 'src', 'engine', 'lib');
  const files = fs.readdirSync(libDir).filter((f) => f.endsWith('.test.mjs'));
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(libDir, file), 'utf8');

    // Heuristic 1: Narrative Slop (AAA comments avoidance)
    if (
      content.includes('// Arrange') ||
      content.includes('// Act') ||
      !content.includes('// Assert')
    ) {
      // Logic: we BAN Arrange and Act. We also BAN Assert meta-comment.
    }

    const slopMatches = content.match(/\/\/\s*(Arrange|Act|Assert)/gi);
    if (slopMatches) {
      violations.push(
        `${file}: Detected narrative slop (${slopMatches.join(', ')}). Use Vertical Scansion.`
      );
    }

    // Heuristic 2: Triad variable naming (input/actual/expected)
    // We expect "actual" and "expected" at minimum.
    if (!content.includes('actual') || !content.includes('expected')) {
      violations.push(`${file}: Missing Named Expectations triad (actual/expected variables).`);
    }

    // Heuristic 2.1: Numbered Variable Avoidance (Narrative Slop Detection)
    const numberedMatches = content.match(/\b(input|actual|expected)[0-9]+\b/g);
    if (numberedMatches) {
      violations.push(
        `${file}: Detected numbered variables (${Array.from(new Set(numberedMatches)).join(', ')}). Use descriptive names instead.`
      );
    }

    // Heuristic 3: Magic Literals in assert.equal/deepEqual/strictEqual
    // Regex matches assert(args, literal) where literal is a string, number, or boolean.
    // We use a non-greedy catch for the first argument and look specifically for the second arg starting with a literal.
    // Refinement: Even if it matches, check if the match is actually a literal at the end of the call
    // A better approach is to flag any call that has a literal as the LAST argument.
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

  return {
    isFailure: missing.length > 0,
    missing,
  };
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

  const totalFailures = [
    results.drift,
    results.narrative,
    results.law3,
    results.soul,
    results.tests,
  ].filter((r) => r.isFailure).length;

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

// Entry point for direct CLI execution
const isMain =
  import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.endsWith('audit-bundle.mjs');
if (isMain) {
  run().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}

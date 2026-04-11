#!/usr/bin/env node

/**
 * Narrative Guard — Blocks feat: and fix: commits if CHANGELOG.md [Unreleased] is empty.
 * Ensures the auto-bump pipeline always has content to promote.
 */

import fs from 'node:fs';
import path from 'node:path';

import { execSync } from 'node:child_process';

const PROJECT_ROOT = process.cwd();
const CHANGELOG_PATH = path.join(PROJECT_ROOT, 'CHANGELOG.md');

async function run() {
  const isPrePush = process.argv.includes('--pre-push');
  const commitMsgFile = isPrePush ? null : process.argv[2];

  if (!isPrePush) {
    if (!commitMsgFile) {
      console.error('  ❌ Error: No commit message file provided.');
      process.exit(1);
    }
    if (!fs.existsSync(commitMsgFile)) {
      console.error(`  ❌ Error: Commit message file not found at ${commitMsgFile}`);
      process.exit(1);
    }

    const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();
    const firstLine = commitMsg.split('\n')[0].trim();

    // ONLY target feat: and fix: (SDG Cycle Triggers) as per maintainer instruction
    const isSdgTrigger = /^feat:/.test(firstLine) || /^fix:/.test(firstLine);
    if (!isSdgTrigger) {
      process.exit(0);
    }
  }

  let changelog = '';
  try {
    // Read STAGED version of CHANGELOG.md (if possible)
    changelog = execSync('git show :CHANGELOG.md', {
      stdio: ['pipe', 'pipe', 'ignore'],
    }).toString();
  } catch {
    if (fs.existsSync(CHANGELOG_PATH)) {
      changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    }
  }

  if (!changelog) {
    process.exit(0);
  }

  const unreleasedMatch = changelog.match(
    /##\s*\[Unreleased\].*?\n([\s\S]*?)(?=\n##\s|(?:\n){0,1}$)/i
  );

  if (!unreleasedMatch) {
    if (isPrePush) process.exit(0);
    console.error('\n  ❌ NARRATIVE VIOLATION: "## [Unreleased]" section missing in CHANGELOG.md.');
    process.exit(1);
  }

  const narrative = unreleasedMatch[1]
    .replace(/###\s*(Added|Fixed|Changed|Removed|Security|Deprecated)/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const isNarrativeEmpty = !narrative || narrative.length < 3;

  if (isPrePush) {
    if (!isNarrativeEmpty) {
      console.error('\n  ❌ DELIVERY BLOCKED: Unreleased narrative detected.');
      console.error('  You have documented changes in CHANGELOG.md that have not been versioned.');
      console.error(
        '  Action: Run "npm run bump <fix|feat>" to finalize the cycle before pushing.\n'
      );
      process.exit(1);
    }
    process.exit(0);
  } else {
    // commit-msg mode
    if (isNarrativeEmpty) {
      console.error('\n  ❌ NARRATIVE VIOLATION: The [Unreleased] section is empty.');
      console.error('  SDG cycles (feat/fix) MUST have a technical narrative before committing.\n');
      process.exit(1);
    }
    console.log('  ✅ Narrative Guard: CHANGELOG.md validated.');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('  ❌ Narrative Guard Exception:', err.message);
  process.exit(1);
});
// test

/**
 * SDG-Agents: Bump & Changelog Automation
 * Automates semantic versioning and promotes Unreleased changes in CHANGELOG.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const CHANGELOG_PATH = path.join(ROOT_DIR, 'CHANGELOG.md');

function run() {
  const args = process.argv.slice(2);
  const bumpType = args[0]; // feat, fix, major

  if (!['feat', 'fix', 'major'].includes(bumpType)) {
    console.error('❌ Error: Please specify bump type (feat, fix, or major).');
    console.log('Usage: npm run bump <feat|fix|major>');
    process.exit(1);
  }

  const typeMap = {
    feat: 'minor',
    fix: 'patch',
    major: 'major',
  };

  const npmType = typeMap[bumpType];

  try {
    // 1. Get current version
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const oldVersion = pkg.version;

    // 2. Bump version in package.json (no git tag/commit yet)
    console.log(`🚀 Bumping version (${npmType})...`);
    execSync(`npm version ${npmType} --no-git-tag-version`, { stdio: 'inherit' });

    // 3. Get new version
    const newPkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const newVersion = newPkg.version;

    // 4. Update CHANGELOG.md
    updateChangelog(newVersion);

    // 5. Commit the bump
    console.log('📦 Committing release...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore: release ${newVersion}"`, { stdio: 'inherit' });

    console.log(`✅ Success: ${oldVersion} → ${newVersion}`);
    console.log('🔗 CHANGELOG.md updated and promoted to current date.');
  } catch (error) {
    console.error('❌ Error during bump strategy:', error.message);
    process.exit(1);
  }
}

function updateChangelog(newVersion) {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.warn('⚠️  CHANGELOG.md not found. Skipping changelog update.');
    return;
  }

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Pattern to find the [Unreleased] section
  // It handles both formats: ## [Unreleased] and ## [Unreleased] - YYYY-MM-DD
  const unreleasedRegex = /##\s*\[Unreleased\](\s*-\s*\d{4}-\d{2}-\d{2})?/i;

  if (!unreleasedRegex.test(content)) {
    console.warn('⚠️  Could not find "## [Unreleased]" header in CHANGELOG.md.');
    console.log('Skipping content promotion.');
    return;
  }

  const newHeader = `## [${newVersion}] - ${today}`;

  // 1. Promote Unreleased to New Version
  let updatedContent = content.replace(unreleasedRegex, newHeader);

  // 2. Inject new [Unreleased] block at the top
  const insertIndex = updatedContent.indexOf(newHeader);
  const nextBlock = `## [Unreleased]\n\n### Added\n\n### Fixed\n\n`;

  updatedContent =
    updatedContent.slice(0, insertIndex) + nextBlock + updatedContent.slice(insertIndex);

  fs.writeFileSync(CHANGELOG_PATH, updatedContent);
}

run();

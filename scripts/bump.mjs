/**
 * SDG-Agents: Bump & Changelog Automation
 * Automates semantic versioning and promotes Unreleased changes in CHANGELOG.md.
 */

import fileSystem from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");
const CHANGELOG_PATH = path.join(ROOT_DIR, "CHANGELOG.md");

function run() {
  const args = process.argv.slice(2);
  const bumpType = args[0]; // feat, fix, major

  if (!["feat", "fix", "docs", "land", "audit", "major"].includes(bumpType)) {
    console.error(
      "❌ Error: Please specify bump type (feat, fix, docs, land, audit, or major)."
    );

    console.log("Usage: npm run bump <feat|fix|docs|land|audit|major>");
    process.exit(1);
  }

  const typeMap = {
    feat: "minor",
    fix: "patch",
    docs: "patch",
    land: "patch",
    audit: "minor",
    major: "major",
  };

  const npmType = typeMap[bumpType];
  const oldVersion = JSON.parse(
    fileSystem.readFileSync(PACKAGE_JSON_PATH, "utf8")
  ).version;

  const oldChangelog = fileSystem.existsSync(CHANGELOG_PATH)
    ? fileSystem.readFileSync(CHANGELOG_PATH, "utf8")
    : null;

  try {
    // 1. Bump version in package.json (no git tag/commit yet)
    console.log(`🚀 Bumping version (${npmType})...`);
    execSync(`npm version ${npmType} --no-git-tag-version`, {
      stdio: "inherit",
    });

    // 2. Get new version
    const newVersion = JSON.parse(
      fileSystem.readFileSync(PACKAGE_JSON_PATH, "utf8")
    ).version;

    // 3. Update CHANGELOG.md
    updateChangelog(newVersion);

    // 4. Verification message
    console.log(`✅ Success: ${oldVersion} → ${newVersion}`);
    console.log("🔗 CHANGELOG.md updated and promoted.");
    console.log('⚠️  Files staged. Run "git commit" manually after approval.');
  } catch {
    console.error(
      "\n❌ Release failed. Attempting to revert versioning changes...\n"
    );

    // Restoration focus: only metadata files. Developer code is safely preserved.
    fileSystem.writeFileSync(
      PACKAGE_JSON_PATH,
      JSON.stringify(
        {
          ...JSON.parse(fileSystem.readFileSync(PACKAGE_JSON_PATH, "utf8")),
          version: oldVersion,
        },
        null,
        2
      )
    );

    if (oldChangelog !== null) {
      fileSystem.writeFileSync(CHANGELOG_PATH, oldChangelog);
    }

    // Try to sync lockfile if it exists
    if (fileSystem.existsSync(path.join(ROOT_DIR, "package-lock.json"))) {
      try {
        execSync("npm install --package-lock-only", { stdio: "ignore" });
      } catch {
        // Silent fail for lockfile sync
      }
    }

    console.error("⚠️  Metadata reverted to", oldVersion);
    console.error(
      '🛠️  Fix the issue (e.g. lint errors) and run "npm run bump" again.'
    );

    process.exit(1);
  }
}

function updateChangelog(newVersion) {
  if (!fileSystem.existsSync(CHANGELOG_PATH)) {
    console.warn("⚠️  CHANGELOG.md not found. Skipping changelog update.");
    return;
  }

  const content = fileSystem.readFileSync(CHANGELOG_PATH, "utf8");
  const today = new Date().toISOString().split("T").at(0);

  // Pattern to find the [Unreleased] section
  // It handles both formats: ## [Unreleased] and ## [Unreleased] - YYYY-MM-DD
  const unreleasedRegex = /##\s*\[Unreleased\](\s*-\s*\d{4}-\d{2}-\d{2})?/i;

  if (!unreleasedRegex.test(content)) {
    console.warn(
      '⚠️  Could not find "## [Unreleased]" header in CHANGELOG.md.'
    );

    console.log("Skipping content promotion.");
    return;
  }

  const newHeader = `## [${newVersion}] - ${today}`;

  // 1. Promote Unreleased to New Version
  let updatedContent = content.replace(unreleasedRegex, newHeader);

  // 2. Inject new [Unreleased] block at the top
  const insertIndex = updatedContent.indexOf(newHeader);
  const nextBlock = `## [Unreleased]\n\n### Added\n\n### Fixed\n\n`;

  updatedContent =
    updatedContent.slice(0, insertIndex) +
    nextBlock +
    updatedContent.slice(insertIndex);

  fileSystem.writeFileSync(CHANGELOG_PATH, updatedContent);
}

run();

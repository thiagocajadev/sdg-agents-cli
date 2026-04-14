import fs from 'node:fs';
import path from 'node:path';
import { input, confirm, select } from '@inquirer/prompts';
import { PromptUtils } from '../../lib/infra/prompt-utils.mjs';
import { ResultUtils } from '../../lib/core/result-utils.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const { printPromptUI } = PromptUtils;
const { success, fail } = ResultUtils;
const { getDirname, runIfDirect } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_ROOT = path.join(__dirname, '../../..');
const SOURCE_INSTRUCTIONS = path.join(SOURCE_ROOT, 'assets', 'instructions');

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Generates a prompt for an AI Agent to create a new idiom ruleset.
 */
async function run() {
  await orchestrateIdiomAddition();
}

async function orchestrateIdiomAddition() {
  printWelcome();

  const idiomFolderKey = await input({
    message: 'Folder name for the idiom (e.g. ruby, go, rust, swift):',
    validate: (rawInput) =>
      /^[a-z0-9-]+$/.test(rawInput.trim()) || 'Use lowercase letters, numbers and hyphens only.',
  });

  const idiomDisplayNameInput = await input({
    message: 'Display name shown in the build menu (e.g. Go / Gin, Rust / Axum):',
    validate: (rawInput) => rawInput.trim().length > 0 || 'Required.',
  });

  const hasLtsLifecycle = await confirm({
    message: 'Does this idiom follow a formal LTS/versioning cycle? (no = "Latest Stable" labels)',
    default: true,
  });

  const architecturalScope = await select({
    message: 'What is the primary scope of this idiom?',
    choices: [
      { name: '1. Backend', value: 'backend' },
      { name: '2. Frontend', value: 'frontend' },
      { name: '3. Both / Universal', value: 'both' },
    ],
  });

  const targetDirectory = path.join(SOURCE_INSTRUCTIONS, 'idioms', idiomFolderKey);

  if (fs.existsSync(targetDirectory)) {
    console.log(
      `\n  Idiom "${idiomFolderKey}" already exists at ${path.relative(SOURCE_ROOT, targetDirectory)}.\n`
    );
    const existingResult = success();
    return existingResult;
  }

  let stackVersionsContent, stackDisplayContent, corePrinciples;
  try {
    stackVersionsContent = fs.readFileSync(
      path.join(SOURCE_ROOT, 'src/engine/config/stack-versions.mjs'),
      'utf8'
    );
    stackDisplayContent = fs.readFileSync(
      path.join(SOURCE_ROOT, 'src/engine/config/stack-display.mjs'),
      'utf8'
    );
    corePrinciples = fs.readFileSync(
      path.join(SOURCE_INSTRUCTIONS, 'core', 'engineering-standards.md'),
      'utf8'
    );
  } catch (error) {
    console.error(`\n  Error: could not read required file — ${error.message}\n`);
    const failureResult = fail(error.message, 'READ_ERROR');
    return failureResult;
  }

  const prompt = buildPrompt({
    key: idiomFolderKey,
    displayName: idiomDisplayNameInput.trim(),
    hasLts: hasLtsLifecycle,
    scope: architecturalScope,
    stackVersionsContent,
    stackDisplayContent,
    corePrinciples,
  });

  await printPromptUI(prompt, 'Spec Driven Guide — Add New Idiom');

  console.log('\n  After the AI responds, apply the files:');
  console.log(`  - src/instructions/idioms/${idiomFolderKey}/patterns.md  (create)
  - src/config/stack-versions.mjs              (update)
  - src/config/stack-display.mjs               (update)\n`);

  const orchestrateResult = success();
  return orchestrateResult;
}

function printWelcome() {
  console.log('\n  Spec Driven Guide — Add New Idiom');
  console.log('  ' + '─'.repeat(50));
  console.log('  Generates a prompt for an AI Agent to create the idiom ruleset.');
}

function buildPrompt({
  key,
  displayName,
  hasLts,
  scope,
  stackVersionsContent,
  stackDisplayContent,
  corePrinciples,
}) {
  const versionHint = hasLts
    ? `Use the LTS → Preview → Legacy LTS convention (see existing entries in stack-versions.mjs).`
    : `This idiom has no formal LTS cycle — use "Latest Stable" and "Previous" labels. Add it to the NO_LTS_STACKS set.`;

  const isBackend = scope === 'backend' || scope === 'both';
  const isFrontend = scope === 'frontend' || scope === 'both';

  const idiomPrompt = `
Today is ${TODAY}.

## Task: Add a new Idiom to the Spec Driven Guide project
Low: You will create all files needed to add **${displayName}** as a new idiom option in Spec Driven Guide.

---

## Files to create or update

### 1. CREATE: src/instructions/idioms/${key}/patterns.md

Write a complete \`patterns.md\` ruleset for **${displayName}** following the XML Ruleset standard used in this project.

Rules for this file:
- Use \`<ruleset name="...">\` as the root element.
- Each rule uses \`<rule name="...">\`, with \`<description>\`, \`<instructions>\`, \`<good-example>\` and optionally \`<bad-example>\`.
- Cover the most impactful patterns for this idiom: language-specific syntax, idiomatic collections, async/await patterns, error handling, and testing conventions.
- The patterns must COMPLEMENT (not repeat) the universal rules already defined in core/engineering-standards.md — those cover the Result Pattern, Step-Down Rule, API design, and persistence rules.
- Be concise and token-efficient. The audience is an LLM.

### 2. UPDATE: src/config/stack-versions.mjs

Add a new entry for \`${key}\` under \`idioms\` in the \`STACK_VERSIONS\` object.
${versionHint}
Search the web for the current LTS, Preview, and Legacy versions of **${displayName}** before writing the entries.

### 3. UPDATE: src/config/stack-display.mjs

Add the following entry for \`${key}\` to the \`STACK_DISPLAY_NAMES\` object:
\`\`\`js
'${key}': { name: '${displayName}', isBackend: ${isBackend}, isFrontend: ${isFrontend} },
\`\`\`

---

## Context files

### src/config/stack-versions.mjs
\`\`\`js
${stackVersionsContent}
\`\`\`

### src/config/stack-display.mjs
\`\`\`js
${stackDisplayContent}
\`\`\`

### src/instructions/core/engineering-standards.md (universal rules — do NOT repeat these)
<core_principles>
${corePrinciples}
</core_principles>

---

Return:
1. The full content of \`src/instructions/idioms/${key}/patterns.md\`
2. The full updated content of \`src/config/stack-versions.mjs\`
3. The full updated content of \`src/config/stack-display.mjs\`
`;
  return idiomPrompt;
}

export const Idiomatic = {
  run,
};

runIfDirect(import.meta.url, run);

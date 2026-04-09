import { STACK_VERSIONS, NO_LTS_STACKS } from '../config/stack-versions.mjs';
import { PromptUtils } from '../lib/prompt-utils.mjs';
import { ResultUtils } from '../lib/result-utils.mjs';
import { FsUtils } from '../lib/fs-utils.mjs';

const { printPromptUI } = PromptUtils;
const { success } = ResultUtils;
const { runIfDirect } = FsUtils;

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Prints a ready-to-use prompt for an AI Agent to check and update stack versions.
 */
async function run() {
  const stackList = buildStackList();
  const prompt = buildPrompt(stackList);

  await printPromptUI(prompt, 'Spec Driven Guide — Version Check');

  console.log('\n  After the AI responds, apply the updated content to:');
  console.log('  src/config/stack-versions.mjs\n');

  return success();
}

function buildStackList() {
  const stacks = [];
  const entries = STACK_VERSIONS.idioms || {};
  for (const idiomKey of Object.keys(entries)) {
    stacks.push({ section: 'idioms', key: idiomKey, hasLts: !NO_LTS_STACKS.has(idiomKey) });
  }
  return stacks;
}

function buildPrompt(stackList) {
  const ltsStacks = stackList
    .filter((stack) => stack.hasLts)
    .map((stack) => `  - ${stack.key}`)
    .join('\n');
  const noLtsStacks = stackList
    .filter((stack) => !stack.hasLts)
    .map((stack) => `  - ${stack.key}`)
    .join('\n');

  return `
Today is ${TODAY}. Search the web for the current release status of each technology below
and return an updated stack-versions.mjs file.

Technologies WITH formal LTS lifecycle (use: LTS → Preview → Legacy LTS):
${ltsStacks}

Technologies WITHOUT formal LTS (use: Latest Stable → Previous Stable):
${noLtsStacks || '  (none)'}

Rules:
- Ignore Standard Term Support (STS) versions — short-lived, not LTS, not Preview.
- Include a Preview entry only if an active preview/RC exists today.
- Legacy LTS = previous LTS still receiving security patches.
- At most 3 entries per idiom.

Return the complete updated src/config/stack-versions.mjs file content.
Keep the STACK_VERSIONS and NO_LTS_STACKS exports.
`;
}

export const Versioning = {
  run,
};

runIfDirect(import.meta.url, run);

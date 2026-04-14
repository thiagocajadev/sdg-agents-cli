import { STACK_VERSIONS, NO_LTS_STACKS } from '../../config/stack-versions.mjs';
import { PromptUtils } from '../../lib/infra/prompt-utils.mjs';
import { ResultUtils } from '../../lib/core/result-utils.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const { printPromptUI } = PromptUtils;
const { success } = ResultUtils;
const { runIfDirect } = FsUtils;

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Prints a ready-to-use prompt for an AI Agent to check and update stack versions.
 */
async function run() {
  await orchestrateVersionUpdate();
}

async function orchestrateVersionUpdate() {
  const stackList = buildStackList();
  const prompt = buildPrompt(stackList);

  await printPromptUI(prompt, 'Spec Driven Guide — Version Check');

  console.log('\n  After the AI responds, apply the updated content to:');
  console.log('  src/config/stack-versions.mjs\n');

  const updateResult = success();
  return updateResult;
}

function buildStackList() {
  const stacks = [];
  const entries = STACK_VERSIONS.idioms || {};
  for (const idiomFolderKey of Object.keys(entries)) {
    stacks.push({
      section: 'idioms',
      key: idiomFolderKey,
      hasLts: !NO_LTS_STACKS.has(idiomFolderKey),
    });
  }
  const resolvedStacks = stacks;
  return resolvedStacks;
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

  const versionPrompt = `
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
  const finalPrompt = versionPrompt;
  return finalPrompt;
}

export const Versioning = {
  run,
};

runIfDirect(import.meta.url, run);

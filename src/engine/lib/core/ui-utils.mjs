/**
 * Bundle UI — All console output and user confirmation for the bundle lifecycle.
 * Single responsibility: presentation and interaction only, no file I/O.
 */

import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';
import { RulesetInjector } from '../domain/ruleset-injector.mjs';
import { PromptUtils } from '../infra/prompt-utils.mjs';

const { collectOutputSummary } = RulesetInjector;
const { safeConfirm } = PromptUtils;

function printWelcome() {
  console.log('\n  Installing instruction set...');
  console.log('  ' + '─'.repeat(55));
}

function printStep(step, total, message) {
  console.log(`[${step}/${total}] ${message}`);
}

function printAborted() {
  console.log('\n  Aborted. No files were written.\n');
}

function printQuickSetupStart() {
  console.log(`\n  ⚡ Quick setup — installing with defaults...`);
}

function printProjectRoot(targetDir) {
  console.log(`\n  Project Root: ${targetDir}`);
}

function printActivationGuide() {
  console.log('\n  Your agent is ready. Start with a task.');
  console.log('  If it does not auto-load the rules, paste this once:');
  console.log('\n    Read .ai/skill/AGENTS.md\n');
}

function printSuccessAgents(targetDir) {
  console.log('\n  ✅ Done.');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log('  .ai/');
  console.log('  .ai-backlog/             (gitignored)');
  printActivationGuide();
}

function printSuccessPrompts(targetDir) {
  console.log('\n  ✅ Done.');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log('  .ai/prompts/dev-tracks/  — specification templates\n');
}

function printQuickSuccess(targetDir) {
  console.log('\n  ⚡ Done.');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log('  .ai/');
  console.log('  .ai-backlog/             (gitignored)');
  printActivationGuide();
}

function printQuickDryRun(targetDir) {
  console.log(`\n  ⚡ [DRY RUN] Quick setup — nothing will be written.`);
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log(`  [1/5] Would prepare .ai/ structure`);
  console.log(`  [2/5] Would inject rules and dev-guides → .ai/`);
  console.log(`  [3/5] Would assemble AGENTS.md`);
  console.log(`  [4/5] Would write agent config and backlog`);
  console.log(`  [5/5] Would inject spec templates → .ai/prompts/dev-tracks/`);
  console.log('\n  Run without --dry-run to apply.\n');
}

function printDryRunPreview(selections, targetDir) {
  const summary = collectOutputSummary(selections);

  renderPreviewHeader(targetDir);
  renderPreviewDirectories(summary.directories);
  renderPreviewInstructionSet();
  renderPreviewIdeTargets(selections);
  renderPreviewManifest(selections.mode);
  renderPreviewFooter();
}

function renderPreviewHeader(targetDir) {
  console.log('\n  📋 DRY RUN — Preview of files that would be created:');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project Root: ${targetDir}\n`);
}

function renderPreviewDirectories(directories) {
  console.log('  Instruction directories:');
  for (const directoryName of directories) {
    console.log(`    📁 ${directoryName}`);
  }
}

function renderPreviewInstructionSet() {
  console.log(`    📄 .ai/skill/AGENTS.md`);
}

function renderPreviewIdeTargets(selections) {
  const ideTargets = {
    cursor: '.cursor/rules/sdg-agents.mdc',
    windsurf: '.windsurfrules',
    vscode: '.github/copilot-instructions.md',
    copilot: '.github/copilot-instructions.md',
    claude: 'CLAUDE.md',
    roocode: '.clinerules',
    gemini: 'AI_INSTRUCTIONS.md',
  };

  const activeAgents = [...(selections.agents || []), selections.ide].filter(Boolean);

  for (const agentKey of activeAgents) {
    const isSpecialAgent = agentKey === 'none' || agentKey === 'antigravity' || agentKey === 'all';
    if (isSpecialAgent) continue;

    const targetPath = ideTargets[agentKey];
    if (targetPath) {
      console.log(`    📄 ${targetPath}`);
    }
  }
}

function renderPreviewManifest(mode) {
  if (mode === 'agents') {
    console.log('    📄 .ai/.sdg-manifest.json');
  }
}

function renderPreviewFooter() {
  console.log('\n  ' + '─'.repeat(55));
  console.log('  Run without --dry-run to apply.\n');
}

async function printBuildSummary(selections) {
  renderSummaryHeader();
  renderSummaryRows(selections);
  renderSummaryFooter();

  const isConfirmed = await safeConfirm({ message: '  Proceed?', default: true });
  return isConfirmed;
}

function renderSummaryHeader() {
  console.log('\n  ┌─ Build Summary ──────────────────────────────────────┐');
}

function renderSummaryRows(selections) {
  const { flavor, idioms, versions, designPreset, mode, track } = selections;

  if (mode === 'prompts') {
    const trackLabel = track === 'all' ? '00, 01, 02 (Full Training)'.padEnd(43) : track.padEnd(43);
    console.log(`  │  Track:   ${trackLabel}│`);
  } else {
    const flavorLabel = STACK_DISPLAY_NAMES[flavor]?.name ?? flavor;
    const idiomsLabel = formatIdiomsLabel(idioms, versions);

    console.log(`  │  Flavor:  ${flavorLabel.padEnd(43)}│`);
    console.log(`  │  Idioms:  ${idiomsLabel.padEnd(43)}│`);

    if (designPreset) {
      console.log(`  │  Preset:  ${designPreset.padEnd(43)}│`);
    }
  }
}

function formatIdiomsLabel(idioms, versions) {
  const labels = idioms.map((idiomKey) => {
    const name = STACK_DISPLAY_NAMES[idiomKey]?.name ?? idiomKey;
    const versionLabel = versions?.[idiomKey] ? ` (${versions[idiomKey]})` : '';
    const label = `${name}${versionLabel}`;
    return label;
  });

  const idiomsLabel = labels.join(', ');
  return idiomsLabel;
}

function renderSummaryFooter() {
  console.log('  └──────────────────────────────────────────────────────┘');
}

function printHeader(version) {
  console.log(`\n  Spec-Driven Guide — Agents v${version}`);
  console.log('  ' + '─'.repeat(50));
  console.log('  A working protocol and engineering rules for your AI agent.');
  console.log('  Press Ctrl+C to exit.\n');
}

function printUpdateNotification(current, latest) {
  console.log('  ┌──────────────────────────────────────────────────────┐');
  console.log(`  │  🚀 NEW VERSION AVAILABLE: v${latest.padEnd(25)} │`);
  console.log(`  │  Your version: v${current.padEnd(32)} │`);
  console.log('  │                                                      │');
  console.log('  │  Update with: npm install -g sdg-agents              │');
  console.log('  └──────────────────────────────────────────────────────┘\n');
}

function printFooter() {
  console.log('\n  See you.\n');
}

function printHelp(version) {
  console.log(`
  sdg-agents v${version}
  Installs a structured instruction set for AI agents into your project.

  Usage:
    npx sdg-agents [command] [options]

  Commands:
    init         Install the instruction set (interactive or via flags)
    review       Compare local rules vs source
    sync         Update patterns from source
    update       Refresh the LTS version registry
    add          Add a language idiom to an existing project
    clear        Remove the .ai/ folder

  Global Options:
    -h, --help       Show this help
    -v, --version    Show version

  Init Options:
    --flavor <name>      Architecture flavor (vertical-slice, mvc, lite, legacy)
    --idiom <name>       Language idiom — repeatable or comma-separated
    --no-dev-guides      Skip reference files and spec templates
    --dry-run            Preview without writing files

  Examples:
    npx sdg-agents
    npx sdg-agents init --flavor vertical-slice --idiom typescript
    npx sdg-agents init --flavor mvc --idiom typescript,python
    npx sdg-agents init --flavor lite --idiom go --no-dev-guides
    npx sdg-agents init --flavor mvc --idiom python --dry-run
    npx sdg-agents add
    npx sdg-agents clear
`);
}

export const BundleUI = {
  printWelcome,
  printStep,
  printAborted,
  printQuickSetupStart,
  printProjectRoot,
  printActivationGuide,
  printSuccessAgents,
  printSuccessPrompts,
  printQuickSuccess,
  printQuickDryRun,
  printDryRunPreview,
  printBuildSummary,
  printHeader,
  printUpdateNotification,
  printFooter,
  printHelp,
};

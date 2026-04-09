/**
 * Bundle UI — All console output and user confirmation for the bundle lifecycle.
 * Single responsibility: presentation and interaction only, no file I/O.
 */

import { STACK_DISPLAY_NAMES } from '../config/stack-display.mjs';
import { RulesetInjector } from './ruleset-injector.mjs';
import { PromptUtils } from './prompt-utils.mjs';

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

  console.log('\n  📋 DRY RUN — Preview of files that would be created:');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project Root: ${targetDir}\n`);

  console.log('  Instruction directories:');
  for (const dir of summary.directories) {
    console.log(`    📁 ${dir}`);
  }

  console.log(`    📄 .ai/skill/AGENTS.md`);

  const activeAgents = [...(selections.agents || []), selections.ide].filter(Boolean);
  const ideTargets = {
    cursor: '.cursor/rules/sdg-agents.mdc',
    windsurf: '.windsurfrules',
    vscode: '.github/copilot-instructions.md',
    copilot: '.github/copilot-instructions.md',
    claude: 'CLAUDE.md',
    roocode: '.clinerules',
    gemini: 'AI_INSTRUCTIONS.md',
  };

  for (const agent of activeAgents) {
    if (agent === 'none' || agent === 'antigravity' || agent === 'all') continue;
    if (ideTargets[agent]) {
      console.log(`    📄 ${ideTargets[agent]}`);
    }
  }

  if (selections.mode === 'agents') {
    console.log('    📄 .ai/.sdg-manifest.json');
  }

  console.log('\n  ' + '─'.repeat(55));
  console.log('  Run without --dry-run to apply.\n');
}

async function printBuildSummary(selections) {
  const { flavor, idioms, versions, designPreset, mode, track } = selections;

  const flavorLabel = STACK_DISPLAY_NAMES[flavor]?.name ?? flavor;
  const idiomsLabel = idioms
    .map((id) => {
      const name = STACK_DISPLAY_NAMES[id]?.name ?? id;
      const ver = versions?.[id] ? ` (${versions[id]})` : '';
      return `${name}${ver}`;
    })
    .join(', ');

  console.log('\n  ┌─ Build Summary ──────────────────────────────────────┐');

  if (mode === 'prompts') {
    console.log(
      '  │  Track:   ' +
        (track === 'all' ? '00, 01, 02 (Full Training)'.padEnd(43) : track.padEnd(43)) +
        '│'
    );
  } else {
    console.log(`  │  Flavor:  ${flavorLabel.padEnd(43)}│`);
    console.log(`  │  Idioms:  ${idiomsLabel.padEnd(43)}│`);
    if (designPreset) {
      console.log(`  │  Preset:  ${designPreset.padEnd(43)}│`);
    }
  }

  console.log('  └──────────────────────────────────────────────────────┘');

  return safeConfirm({ message: '  Proceed?', default: true });
}

function printHeader(version) {
  console.log(`\n  Spec-Driven Guide — Agents v${version}`);
  console.log('  ' + '─'.repeat(50));
  console.log('  A working protocol and engineering rules for your AI agent.');
  console.log('  Press Ctrl+C to exit.\n');
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

const BundleUI = {
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
  printFooter,
  printHelp,
};

export { BundleUI };

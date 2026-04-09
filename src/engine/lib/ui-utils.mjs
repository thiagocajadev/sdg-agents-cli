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
  console.log('\n  Spec Driven Guide — Inject Staff rules into project');
  console.log('  ' + '─'.repeat(55));
}

function printStep(step, total, message) {
  console.log(`[${step}/${total}] ${message}`);
}

function printAborted() {
  console.log('\n  Aborted. No files were written.\n');
}

function printQuickSetupStart() {
  console.log(`\n  ⚡ Quick Setup: Initializing Full Staff Toolkit...`);
}

function printProjectRoot(targetDir) {
  console.log(`\n  Project Root: ${targetDir}`);
}

function printActivationGuide() {
  console.log('\n  ┌─ Activate your context ─────────────────────────────────┐');
  console.log('  │  Paste to your AI Agent:                                │');
  console.log('  │                                                         │');
  console.log('  │  Read .ai/skill/AGENTS.md — routes to only the rules    │');
  console.log("  │  relevant to this project's stack.                      │");
  console.log('  └─────────────────────────────────────────────────────────┘\n');
}

function printSuccessAgents(targetDir) {
  console.log('\n  ✅ Agent instructions injected successfully!');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log('  .ai/skill/AGENTS.md  — universal entry point for all AI Agents');
  console.log('  .ai/instructions/           — rules loaded on demand (backend, frontend, idiom)');
  console.log('  .ai/commands/               — feat / fix / docs cycles');
  printActivationGuide();
}

function printSuccessPrompts(targetDir) {
  console.log('\n  ✅ Specification Pipeline injected successfully!');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log('  .ai/prompts/dev-tracks/  — specification templates\n');
}

function printQuickSuccess(targetDir) {
  console.log('\n  ⚡ Staff Engineering Toolkit Ready!');
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project: ${targetDir}\n`);
  console.log('  .ai/skill/AGENTS.md  — universal entry point for all AI Agents');
  console.log('  .ai/instructions/           — rules loaded on demand (backend, frontend, idiom)');
  console.log('  .ai/prompts/                — specification templates');
  printActivationGuide();
}

function printQuickDryRun(targetDir) {
  console.log(`\n  ⚡ [DRY RUN] Quick Setup: Initializing Full Staff Toolkit...`);
  console.log('  ' + '─'.repeat(55));
  console.log(`  Project Root: ${targetDir}\n`);
  console.log(`  [1/5] Would prepare .ai/ structure`);
  console.log(`  [2/5] Would inject Lite AI Rules (JS/TS + Glass) -> .ai/`);
  console.log(`  [3/5] Would write .ai/skill/AGENTS.md`);
  console.log(`  [4/5] Would inject Lite Prompt Track -> .ai/prompts/dev-tracks/`);
  console.log(`  [5/5] Finalizing...`);
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

/**
 * Renders the build summary box and asks for confirmation.
 * Returns true if the user confirms, false otherwise.
 */
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

/**
 * Renders the CLI header with version info.
 */
function printHeader(version) {
  console.log(`\n  Spec Driven Guide v${version} — Staff-level Context for AI Agents`);
  console.log('  ' + '─'.repeat(50));
  console.log('  Standardizing engineering excellence for AI Agents.');
  console.log('  Press Ctrl+C to exit.\n');
}

/**
 * Renders the CLI footer with GitHub link.
 */
function printFooter() {
  console.log('  Check out this project on GitHub: https://github.com/thiagocajadev/sdg-agents');
  console.log('\n  Goodbye engineer!\n');
}

/**
 * Renders the CLI help text.
 */
function printHelp(version) {
  console.log(`
  Spec Driven Guide v${version}
  Transform any repository into a high-discipline environment for AI Agents.

  Usage:
    npx sdg-agents [command] [options]

  Commands:
    init         Build project context (inject Staff-level rules)
    review       Compare local rules vs core source
    sync         Generate prompt to update patterns via web
    update       Refresh LTS versions registry
    add          Generate prompt for a new idiom
    clear        Reset all generated content

  Global Options:
    -h, --help       Show this help message
    -v, --version    Show version number

  Init Options:
    --flavor <name>    Architecture flavor (vertical-slice, mvc, lite, legacy)
    --idiom <name>     Language/framework (repeatable or comma-separated)
    --dry-run          Preview files without writing

  Examples:
    npx sdg-agents                                            Interactive mode
    npx sdg-agents init                                       Interactive build wizard
    npx sdg-agents init --flavor vertical-slice --idiom typescript
    npx sdg-agents init --idiom go,rust --flavor mvc --dry-run
    npx sdg-agents review                                     Check for rule updates
    npx sdg-agents clear                                      Remove all generated files

  Documentation: https://github.com/thiagocajadev/sdg-agents
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
  printFooter,
  printHelp,
};

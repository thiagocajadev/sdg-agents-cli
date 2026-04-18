import { GatePrompt } from '../../lib/domain/gate-prompt.mjs';
import { GateChecker } from '../../lib/domain/gate-checker.mjs';
import { FsUtils } from '../../lib/core/fs-utils.mjs';

const { bootstrapIfDirect } = FsUtils;

async function dispatchGate(args) {
  const isPromptMode = args?.prompt === true;
  const isCheckMode = args?.check === true;

  if (isPromptMode) {
    const promptResult = await processPromptMode();
    return promptResult;
  }

  if (isCheckMode) {
    const checkResult = await processCheckMode();
    return checkResult;
  }

  const usageResult = printUsage();
  return usageResult;
}

async function processPromptMode() {
  const diff = await readStdin();

  const isEmpty = diff.trim().length === 0;
  if (isEmpty) {
    const emptyResult = null;
    return emptyResult;
  }

  const prompt = GatePrompt.buildPrompt(diff);
  process.stdout.write(prompt);

  const promptResult = null;
  return promptResult;
}

async function processCheckMode() {
  const jsonInput = await readStdin();

  const result = GateChecker.checkResult(jsonInput);

  const hasParseError = !!result.parseError;
  if (hasParseError) {
    console.error(`  ⚠️  SDG Gate: ${result.parseError}. Skipping review.`);
    process.exit(0);
  }

  const hasBlockViolations = !result.canCommit;
  if (hasBlockViolations) {
    const report = GateChecker.formatViolationReport(result.blockViolations);
    console.error(`\n  ❌ SDG Gate — Commit blocked\n\n${report}\n`);
    process.exit(1);
  }

  const hasWarnViolations = result.violations.length > result.blockViolations.length;
  if (hasWarnViolations) {
    const warnViolations = result.violations.filter((violation) => violation.tier === 'WARN');
    const report = GateChecker.formatViolationReport(warnViolations);
    console.error(`\n  ⚠️  SDG Gate — Warnings (not blocking)\n\n${report}\n`);
  }

  const passResult = null;
  return passResult;
}

async function readStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const stdin = Buffer.concat(chunks).toString('utf8');
  return stdin;
}

function printUsage() {
  const message = [
    '',
    '  SDG Gate — Language-agnostic pre-commit code reviewer',
    '',
    '  Usage:',
    '    git diff --staged | sdg-agents gate --prompt | <llm-cli> | sdg-agents gate --check',
    '',
    '  Flags:',
    '    --prompt   Read diff from stdin, print review prompt to stdout',
    '    --check    Read LLM JSON result from stdin, exit 0 (pass) or 1 (block)',
    '',
  ].join('\n');

  const usageResult = console.log(message);
  return usageResult;
}

export const GateRunner = { dispatch: dispatchGate };

bootstrapIfDirect(import.meta.url, () => dispatchGate({}));

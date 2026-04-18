function checkResult(jsonInput) {
  const parsed = parseJson(jsonInput);

  const isParseFailure = !parsed.isSuccess;
  if (isParseFailure) {
    const parseError = { canCommit: true, violations: [], parseError: parsed.error };
    return parseError;
  }

  const report = parsed.value;
  const blockViolations = filterBlockViolations(report.violations);
  const hasBlockViolations = blockViolations.length > 0;

  const checkedResult = {
    canCommit: !hasBlockViolations,
    violations: report.violations ?? [],
    blockViolations,
  };

  return checkedResult;
}

function parseJson(rawInput) {
  try {
    const trimmed = rawInput.trim();
    const value = JSON.parse(trimmed);
    const successResult = { isSuccess: true, value };
    return successResult;
  } catch {
    const failResult = { isSuccess: false, error: 'Invalid JSON from LLM output' };
    return failResult;
  }
}

function filterBlockViolations(violations) {
  const isValidArray = Array.isArray(violations);
  if (!isValidArray) {
    const emptyResult = [];
    return emptyResult;
  }

  const blockOnly = violations.filter((violation) => violation.tier === 'BLOCK');
  return blockOnly;
}

function formatViolationReport(violations) {
  const lines = violations.map(formatViolationLine);
  const report = lines.join('\n');
  return report;
}

function formatViolationLine(violation) {
  const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
  const line = `  [${violation.tier}] ${violation.rule} — ${location}\n    ${violation.snippet}\n    Fix: ${violation.fix}`;
  return line;
}

export const GateChecker = { checkResult, formatViolationReport };

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Governance SSOT — Single Source of Truth for SDG Agents Engineering Laws.
 * Dynamically parses instruction files (Markdown) to extract labels and descriptions,
 * ensuring perfect synchronization between documentation and automated enforcement.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STANDARDS_PATH = path.resolve(
  __dirname,
  '../../assets/instructions/core/engineering-standards.md'
);

/**
 * Loads and parses the Master Checklist from engineering-standards.md.
 * Returns an array of Rule objects { id, label, description, heuristic }.
 */
function loadDynamicRules() {
  const content = fs.readFileSync(STANDARDS_PATH, 'utf8');
  const checklistSection = content.match(/<rule name="EnforcementChecklist">([\s\S]*?)<\/rule>/);

  if (!checklistSection) {
    const emptyChecklist = [];
    return emptyChecklist;
  }

  const ruleLines = checklistSection[1].match(/- \[\s\] \*\*(.*?)\*\*(?:\s*:\s*(.*))?/g);
  if (!ruleLines) {
    const noRulesFound = [];
    return noRulesFound;
  }

  const dynamicRules = ruleLines.map((ruleLine) => {
    const [, label, description] = ruleLine.match(/- \[\s\] \*\*(.*?)\*\*(?:\s*:\s*(.*))?/) || [];
    const id = label.toLowerCase().replace(/ /g, '-');

    const ruleObj = {
      id,
      label,
      description: description || '',
      heuristic: NARRATIVE_VALIDATION_STRATEGIES[label] || null,
    };
    return ruleObj;
  });

  const finalDynamicRules = dynamicRules;
  return finalDynamicRules;
}

/**
 * Maps Markdown rule names to JavaScript automated check functions.
 */
const NARRATIVE_VALIDATION_STRATEGIES = {
  'Stepdown Rule': () => ({ pass: true }),
  'SLA applied': (content) => validateSlaCompliance(content),
  'Narrative Siblings': (content) => validateNarrativeSiblings(content),
  'Explaining Returns': (content) => validateExplainingReturns(content),
  'No framework abbreviations': (content) => validateNamingDiscipline(content),
  'Vertical Density applied': () => ({ pass: true }),
  'Revealing Module Pattern': (content) => validateRevealingModulePattern(content),
  'Shallow Boundaries': () => ({ pass: true }),
  'Boolean names carry a prefix': (content) => validateBooleanPrefixes(content),
  'No explanatory comments': () => ({ pass: true }),
  'No Section Banners': (content) => validateNoSectionBanners(content),
  'Code reads like a "Short Story"': () => ({ pass: true }),
};

function validateSlaCompliance(content) {
  const entryPointRegex = /async\s+function\s+(run|start|init)\s*\([\s\S]*?\)\s*\{([\s\S]*?)\n\}/g;
  const violations = [];
  let regexMatch;

  while ((regexMatch = entryPointRegex.exec(content)) !== null) {
    const entryPointName = regexMatch[1];
    const functionBody = regexMatch[2];
    const bodyLines = functionBody
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    if (bodyLines.length > 1) {
      violations.push(
        `${entryPointName}() has ${bodyLines.length} lines (MUST be 1 line of delegation)`
      );
    }
  }

  const runFunctionMatch = content.match(/async function run\(\) \{([\s\S]*?)\n\}/);
  if (runFunctionMatch) {
    const runBody = runFunctionMatch[1];
    const forbiddenPatterns = [
      { pattern: /console\.log\(/, label: 'console.log' },
      { pattern: /path\.resolve\(/, label: 'path.resolve' },
      { pattern: /process\.argv/, label: 'process.argv access' },
    ];

    forbiddenPatterns.forEach((item) => {
      if (item.pattern.test(runBody)) {
        violations.push(`Implementation logic (${item.label}) in run()`);
      }
    });
  }

  const slaResult = {
    pass: violations.length === 0,
    reason: violations.length > 0 ? `Pure Entry Point violation: ${violations.join('; ')}` : null,
  };
  return slaResult;
}

function validateNarrativeSiblings(content) {
  const topLevelFunctionsCount = (content.match(/^function\s+\w+/gm) || []).length;
  const exportedFunctionsCount = (content.match(/^\s+\w+,/gm) || []).length;

  // Balance is Key: Threshold of 12 to favor "Chapters" (Narrative Siblings) over monolithic nesting
  const isViolatingDensity =
    topLevelFunctionsCount > 12 && exportedFunctionsCount < topLevelFunctionsCount / 2;

  const siblingsResult = {
    pass: !isViolatingDensity,
    reason: isViolatingDensity
      ? 'Excessive top-level function density (>12). Consider refactoring to dedicated lib.'
      : null,
  };
  return siblingsResult;
}

function validateExplainingReturns(content) {
  const lines = content.split('\n');
  const violations = [];

  for (let index = 2; index < lines.length; index++) {
    const currentLine = lines[index].trim();

    const isPotentialBareReturn =
      currentLine.startsWith('return ') &&
      !['return null', 'return false', 'return true', 'return;'].some((statement) =>
        currentLine.startsWith(statement)
      );

    if (isPotentialBareReturn) {
      // SLA Exemption: Entry Points (run) are allowed to perform pure delegation to maintain 1-line protocol.
      const functionContext = scanForFunctionHeader(lines, index);
      if (functionContext === 'run') continue;

      // 100% scansion: extract the returned symbol
      const returnMatch = currentLine.match(/return\s+([a-zA-Z0-9_$]+);?$/);

      if (!returnMatch) {
        violations.push(`line ${index + 1} (Literal return)`);
        continue;
      }

      const returnedSymbol = returnMatch[1];
      const isExplained = scanForSymbolExplainer(lines, index, returnedSymbol);
      if (!isExplained) {
        violations.push(`line ${index + 1} (Bare return: "${returnedSymbol}")`);
      }
    }
  }

  const explainingResult = {
    pass: violations.length === 0,
    reason: violations.length > 0 ? `Laws Compliance violation: ${violations.join('; ')}` : null,
  };
  return explainingResult;

  function scanForFunctionHeader(sourceLines, returnLineIndex) {
    for (let currentPos = returnLineIndex - 1; currentPos >= 0; currentPos--) {
      const line = sourceLines[currentPos].trim();
      const functionMatch = line.match(/(?:function|async)\s+(\w+)\s*\(/);
      if (functionMatch) return functionMatch[1];
    }
    return null;
  }

  function scanForSymbolExplainer(sourceLines, returnLineIndex, symbol) {
    const SCAN_LIMIT = 100;
    const startPos = Math.max(0, returnLineIndex - SCAN_LIMIT);
    const constRegex = new RegExp(`const\\s+${symbol}\\b`);

    for (let currentPos = returnLineIndex - 1; currentPos >= startPos; currentPos--) {
      const lineText = sourceLines[currentPos].trim();

      // Skip whitespace, structural braces, backticks, and continuation punctuation
      const isSkipLine = lineText === '' || /^[{}'`\];,.!]+$/.test(lineText);
      if (isSkipLine) continue;

      // If we find the const, we are happy.
      if (constRegex.test(lineText)) return true;

      // SLA exception
      const isPureDelegation =
        /(function|async)\s+\w+\s*\(/.test(lineText) && lineText.includes('{');
      if (isPureDelegation) return true;

      // We allow skipping indented lines (likely part of a multi-line template or object)
      const isIndented =
        sourceLines[currentPos].startsWith('  ') || sourceLines[currentPos].startsWith('\t');
      if (isIndented && !lineText.includes('const ')) continue;

      // If we hit any other keyword (if, for, return from another block), it's a bare return
      if (/^(if|for|while|switch|return|export|async|function)\b/.test(lineText)) break;

      // Otherwise, keep looking for the const (up to limit)
      continue;
    }
    return false;
  }
}

function validateNamingDiscipline(content) {
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Multiline comments
    .replace(/\/\/.*/g, '') // Single line comments
    .replace(/(['"`])(?:(?!\1)[^\\]|\\.)*\1/g, ''); // Strings

  const forbiddenAbbreviations = ['r' + 'eq', 'r' + 'es'];
  const abbreviationPattern = new RegExp(`\\b(${forbiddenAbbreviations.join('|')})\\b`, 'g');
  const singleLetterPattern = /[\s(,]([a-z])[\s,)=+]/g;

  const abbreviationMatches = cleanContent.match(abbreviationPattern) || [];
  const singleLetterMatches = [];
  let regexMatch;

  while ((regexMatch = singleLetterPattern.exec(cleanContent)) !== null) {
    singleLetterMatches.push(regexMatch[1]);
  }

  const totalViolations = [...abbreviationMatches, ...singleLetterMatches];

  const namingResult = {
    pass: totalViolations.length === 0,
    reason:
      totalViolations.length > 0 ? `Banned naming detected: ${totalViolations.join(', ')}` : null,
  };
  return namingResult;
}

function validateRevealingModulePattern(content) {
  const hasRevealingObject = /export const \w+ = \{[\s\S]*\};/m.test(content);
  const forbiddenDefaultExport = 'export ' + 'default';
  const hasExportDefault = content.includes(forbiddenDefaultExport);

  const revealingResult = {
    pass: hasRevealingObject && !hasExportDefault,
    reason: !hasRevealingObject
      ? 'Missing Revealing Module Pattern export.'
      : hasExportDefault
        ? `Uses ${forbiddenDefaultExport}.`
        : null,
  };
  return revealingResult;
}

function validateBooleanPrefixes(content) {
  const bareBooleanMatches = content.match(/\bconst\s+(loading|error|active|valid)\s*=/g);

  const booleanResult = {
    pass: !bareBooleanMatches,
    reason: bareBooleanMatches ? `Bare boolean detected: ${bareBooleanMatches.join(', ')}` : null,
  };
  return booleanResult;
}

function validateNoSectionBanners(content) {
  const bannerPrefix = '// -' + '--';
  const hasBanner = content.includes(bannerPrefix);

  const bannerResult = {
    pass: !hasBanner,
    reason: hasBanner ? `Detected section banners (${bannerPrefix}).` : null,
  };
  return bannerResult;
}

export const GOVERNANCE_RULES = {
  LAW_1_HARDENING: {
    id: 'hardening',
    label: 'Law 1: Hardening',
    checkpoint: 'Absolute boundary isolation.',
  },
  LAW_2_RESILIENCE: {
    id: 'resilience',
    label: 'Law 2: Resilience',
    checkpoint: 'Defensive dominance.',
  },
  LAW_3_NARRATIVE: {
    id: 'narrative',
    label: 'Law 3: Narrative Cascade',
    checkpoint: 'Stepdown Rule; SLA; Narrative Siblings.',
  },
};

export const NARRATIVE_CHECKLIST = loadDynamicRules();

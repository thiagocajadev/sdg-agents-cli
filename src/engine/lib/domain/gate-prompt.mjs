import { RulesLoader } from './rules-loader.mjs';

function buildPrompt(diff) {
  const rules = RulesLoader.loadRules();
  const rulesSection = formatRulesSection(rules);
  const responseSchema = buildResponseSchema();
  const exclusionsNote = formatExclusionsNote(rules.exclude);

  const prompt = [
    'You are a code reviewer enforcing SDG (Spec Driven Guide) engineering rules.',
    '',
    'Review the git diff below. Respond with ONLY valid JSON — no markdown, no explanation.',
    '',
    responseSchema,
    '',
    'Rules:',
    rulesSection,
    '',
    exclusionsNote,
    '',
    '`canCommit` MUST be false if ANY BLOCK violation is found.',
    'For each violation include the exact snippet and a corrected `fix`.',
    '',
    'Diff:',
    diff,
  ].join('\n');

  return prompt;
}

function formatRulesSection(rules) {
  const formatted = rules.all.map(formatRule).join('\n');
  return formatted;
}

function formatRule(rule) {
  const line = `[${rule.tier}] ${rule.id}: ${rule.description}`;
  return line;
}

function buildResponseSchema() {
  const schema = JSON.stringify(
    {
      canCommit: 'boolean',
      violations: [
        {
          file: 'string',
          line: 'number | null',
          rule: 'rule-id string',
          tier: 'BLOCK | WARN',
          snippet: 'string',
          fix: 'string',
        },
      ],
    },
    null,
    2
  );

  const schemaSection = `Response schema:\n${schema}`;
  return schemaSection;
}

function formatExclusionsNote(excludePatterns) {
  const patternList = excludePatterns.join(', ');
  const note = `Skip files matching: ${patternList}`;
  return note;
}

export const GatePrompt = { buildPrompt };

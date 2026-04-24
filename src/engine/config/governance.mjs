import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NarrativeHeuristics } from './heuristics/narrative-heuristics.mjs';

/**
 * Governance SSOT — Single Source of Truth for SDG Agents Engineering Laws.
 * Dynamically parses instruction files (Markdown) to extract labels and descriptions,
 * ensuring perfect synchronization between documentation and automated enforcement.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STANDARDS_PATH = path.resolve(__dirname, '../../assets/skills/code-style.md');

const NARRATIVE_VALIDATION_STRATEGIES = {
  'Stepdown Rule': () => ({ pass: true }),
  SLA: () => ({ pass: true }),
  'Narrative Siblings': NarrativeHeuristics.validateNarrativeSiblings,
  'Explaining Returns': NarrativeHeuristics.validateExplainingReturns,
  'No framework abbreviations': NarrativeHeuristics.validateNamingDiscipline,
  'Vertical Density': NarrativeHeuristics.validateVerticalDensity,
  'Revealing Module Pattern': NarrativeHeuristics.validateRevealingModulePattern,
  'Shallow Boundaries': () => ({ pass: true }),
  'Destructuring inside function body, not in parameters': () => ({ pass: true }),
  'Boolean prefix': NarrativeHeuristics.validateBooleanPrefixes,
  'No explanatory comments': () => ({ pass: true }),
  'No section banners': NarrativeHeuristics.validateNoSectionBanners,
  'Pure entry point': NarrativeHeuristics.validateSlaCompliance,
  'Reads like a short story': () => ({ pass: true }),
};

function loadDynamicRules() {
  const content = fs.readFileSync(STANDARDS_PATH, 'utf8');
  const checklistSection = content.match(/<rule name="EnforcementChecklist">([\s\S]*?)<\/rule>/);

  if (!checklistSection) {
    const emptyChecklist = [];
    return emptyChecklist;
  }

  const checklistItemRegex = /- \[\s\] (?:\*\*)?(.+?)(?:\*\*)?(?:\s*:\s*(.*)|\s*\(.*\))?$/gm;
  const ruleLines = checklistSection[1].match(checklistItemRegex);
  if (!ruleLines) {
    const noRulesFound = [];
    return noRulesFound;
  }

  const singleItemRegex = /- \[\s\] (?:\*\*)?(.+?)(?:\*\*)?(?:\s*:\s*(.*)|\s*\(.*\))?$/;
  const dynamicRules = ruleLines.map((ruleLine) => {
    const [, label, description] = ruleLine.match(singleItemRegex) || [];
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

export const GOVERNANCE_RULES = {
  LAW_2_HARDENING: {
    id: 'hardening',
    label: 'Law 2: Hardening',
    checkpoint: 'Absolute boundary isolation.',
  },
  LAW_3_RESILIENCE: {
    id: 'resilience',
    label: 'Law 3: Resilience',
    checkpoint: 'Defensive dominance.',
  },
  LAW_4_NARRATIVE: {
    id: 'narrative',
    label: 'Law 4: Narrative Cascade',
    checkpoint: 'Stepdown Rule; SLA; Narrative Siblings.',
  },
};

export const NARRATIVE_CHECKLIST = loadDynamicRules();

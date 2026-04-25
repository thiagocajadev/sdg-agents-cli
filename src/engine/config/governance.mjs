import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NarrativeHeuristics } from "./heuristics/narrative-heuristics.mjs";

/**
 * Governance SSOT — extracts the Pre-Finish Gate checklist from code-style.md
 * and wires each labeled item to its narrative-heuristic validator.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STANDARDS_PATH = path.resolve(
  __dirname,
  "../../assets/skills/code-style.md"
);

const NARRATIVE_VALIDATION_STRATEGIES = {
  "Narrative Siblings": NarrativeHeuristics.validateNarrativeSiblings,
  "Explaining Returns": NarrativeHeuristics.validateExplainingReturns,
  "No framework abbreviations": NarrativeHeuristics.validateNamingDiscipline,
  "Vertical Density": NarrativeHeuristics.validateVerticalDensity,
  "Revealing Module Pattern":
    NarrativeHeuristics.validateRevealingModulePattern,
  "Boolean prefix": NarrativeHeuristics.validateBooleanPrefixes,
  "No section banners": NarrativeHeuristics.validateNoSectionBanners,
  "Pure entry point": NarrativeHeuristics.validateSlaCompliance,
};

function loadDynamicRules() {
  const content = fileSystem.readFileSync(STANDARDS_PATH, "utf8");
  const checklistSection = content.match(
    /<rule name="PreFinishGate">([\s\S]*?)<\/rule>/
  );

  if (!checklistSection) {
    const emptyChecklist = [];
    return emptyChecklist;
  }

  const checklistItemRegex =
    /- \[\s\] (?:\*\*)?(.+?)(?:\*\*)?(?:\s*:\s*(.*)|\s*\(.*\))?$/gm;

  const ruleLines = checklistSection[1].match(checklistItemRegex);
  if (!ruleLines) {
    const noRulesFound = [];
    return noRulesFound;
  }

  const singleItemRegex =
    /- \[\s\] (?:\*\*)?(.+?)(?:\*\*)?(?:\s*:\s*(.*)|\s*\(.*\))?$/;

  const dynamicRules = ruleLines.map((ruleLine) => {
    const [, label, description] = ruleLine.match(singleItemRegex) || [];
    const id = label.toLowerCase().replace(/ /g, "-");

    const ruleObj = {
      id,
      label,
      description: description || "",
      heuristic: NARRATIVE_VALIDATION_STRATEGIES[label] || null,
    };

    return ruleObj;
  });

  const finalDynamicRules = dynamicRules;
  return finalDynamicRules;
}

export const NARRATIVE_CHECKLIST = loadDynamicRules();

export const Governance = {
  NARRATIVE_CHECKLIST,
};

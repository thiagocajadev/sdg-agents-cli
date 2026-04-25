import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "../../../../");
const rulesPath = path.join(projectRoot, "src/assets/rules/sdg-rules.json");

const require = createRequire(import.meta.url);

function loadRules() {
  const raw = require(rulesPath);
  const rules = parseRules(raw);
  return rules;
}

function parseRules(raw) {
  const blockRules = raw.rules.filter((rule) => rule.tier === "BLOCK");
  const warnRules = raw.rules.filter((rule) => rule.tier === "WARN");

  const parsed = {
    version: raw.version,
    exclude: raw.exclude,
    block: blockRules,
    warn: warnRules,
    all: raw.rules,
  };

  return parsed;
}

export const RulesLoader = { loadRules };

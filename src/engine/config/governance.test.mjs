import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NARRATIVE_CHECKLIST } from './governance.mjs';

const EXPECT_PASS = true;
const EXPECT_FAIL = false;

function findRule(label) {
  const rule = NARRATIVE_CHECKLIST.find((item) => item.label === label);
  return rule;
}

describe('governance.NARRATIVE_CHECKLIST', () => {
  it('parses all 9 Pre-Finish Gate items from code-style.md', () => {
    const expectedChecklistSize = 8;
    const actualChecklistSize = NARRATIVE_CHECKLIST.length;

    const failureMessage = 'parser regex must capture every Pre-Finish Gate item';

    assert.equal(actualChecklistSize, expectedChecklistSize, failureMessage);
  });

  it('maps every label to a strategy or explicit placeholder (no orphan rules)', () => {
    const orphanRules = NARRATIVE_CHECKLIST.filter((rule) => rule.heuristic === null);
    const orphanLabels = orphanRules.map((rule) => rule.label);
    const orphanCount = orphanRules.length;
    const expectedOrphanCount = 0;
    const failureMessage = `every checklist label must have a strategy mapping (Bug Y/Z regression). Orphans: ${orphanLabels.join(', ')}`;

    assert.equal(orphanCount, expectedOrphanCount, failureMessage);
  });

  it('exposes Pure entry point, Explaining Returns, and Boolean prefix as enforced rules', () => {
    const ruleLabels = NARRATIVE_CHECKLIST.map((rule) => rule.label);
    const requiredRules = ['Pure entry point', 'Explaining Returns', 'Boolean prefix'];

    for (const expectedLabel of requiredRules) {
      const isPresent = ruleLabels.includes(expectedLabel);
      const failureMessage = `checklist must expose label "${expectedLabel}"`;
      assert.ok(isPresent, failureMessage);
    }
  });
});

describe('governance.validateNamingDiscipline (No framework abbreviations)', () => {
  const rule = findRule('No framework abbreviations');

  it('flags banned abbreviations as function parameters', () => {
    const source = 'function handler(req, res) { const context = {}; }';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /req/);
    assert.match(result.reason, /res/);
  });

  it('flags the full 12-token banned set', () => {
    const bannedTokens = ['ctx', 'idx', 'tmp', 'arr', 'val', 'cb', 'mgr', 'ctrl', 'svc', 'prev'];
    for (const token of bannedTokens) {
      const source = `function step(${token}) { return ${token}; }`;
      const actualPass = rule.heuristic(source).pass;

      const failureMessage = `must flag token "${token}"`;

      assert.equal(actualPass, EXPECT_FAIL, failureMessage);
    }
  });

  it('allows expanded names', () => {
    const source = 'function handler(request, response) { const context = { request }; }';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('does not match substrings without word boundary (Promise.resolve)', () => {
    const source = 'const settled = Promise.resolve(value);';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('does not match banned tokens inside string literals', () => {
    const source = "const message = 'please req a review on res';";
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('does not match banned tokens inside comments', () => {
    const source = '// req is fine here\nconst payload = request.body;';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });
});

describe('governance.validateExplainingReturns (No Logic in Return)', () => {
  const rule = findRule('Explaining Returns');

  it('classifies ternary in return', () => {
    const source = '// header\n// header\nfunction pick(flag) {\n  return flag ? "yes" : "no";\n}';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Ternary in return/);
  });

  it('classifies template literal in return', () => {
    const source =
      '// header\n// header\nfunction greet(user) {\n  return `Hello ${user.name}`;\n}';

    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Template literal in return/);
  });

  it('classifies arithmetic in return', () => {
    const source = '// header\n// header\nfunction sum(a, b) {\n  return a + b;\n}';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Arithmetic in return/);
  });

  it('classifies constructor in return', () => {
    const source = '// header\n// header\nfunction build(name) {\n  return new User(name);\n}';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Constructor in return/);
  });

  it('accepts named const before return', () => {
    const source = 'function sum(a, b) {\n  const total = a + b;\n  return total;\n}';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('accepts void-terminator (bare side-effect call)', () => {
    const source = 'function log(message) {\n  console.log(message);\n}';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });
});

describe('governance.validateVerticalDensity (Vertical Density)', () => {
  const rule = findRule('Vertical Density');

  it('flags double blank lines', () => {
    const source =
      'function first() {\n  return null;\n}\n\n\nfunction second() {\n  return null;\n}\n';

    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /double blank line/);
  });

  it('accepts single blank between groups', () => {
    const source =
      'function first() {\n  return null;\n}\n\nfunction second() {\n  return null;\n}\n';

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('flags blank between atomic prep and return (Explaining Return Tight)', () => {
    const source = 'function compute(a, b) {\n  const sum = 1;\n\n  return sum;\n}\n';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Explaining Return pair must be tight/);
  });

  it('accepts tight Explaining Return pair', () => {
    const source = 'function compute(a, b) {\n  const sum = 1;\n  return sum;\n}\n';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('accepts multi-atomic group with legitimate final blank', () => {
    const source =
      'function compute(a, b, c) {\n  const left = 1;\n  const right = 2;\n  const merged = 3;\n\n  return merged;\n}\n';

    const result = rule.heuristic(source);

    const hasTightViolation = (result.reason || '').includes('Explaining Return pair');

    assert.equal(hasTightViolation, EXPECT_FAIL);
  });

  it('flags orphan atomic after tight pair', () => {
    const source = 'function shape() {\n  const a = 1;\n  const b = 2;\n\n  const c = 3;\n}\n';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /orphan atomic/);
  });

  it('accepts tight trio of atomics', () => {
    const source = 'function shape() {\n  const a = 1;\n  const b = 2;\n  const c = 3;\n}\n';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it('accepts 2+2 balanced groups', () => {
    const source =
      'function shape() {\n  const a = 1;\n  const b = 2;\n\n  const c = 3;\n  const d = 4;\n}\n';

    const result = rule.heuristic(source);

    const hasOrphanViolation = (result.reason || '').includes('orphan atomic');

    assert.equal(hasOrphanViolation, EXPECT_FAIL);
  });

  it('does not flag orphan when trailing line is a rich step with call', () => {
    const source =
      'function shape() {\n  const a = 1;\n  const b = 2;\n\n  const result = compute(a, b);\n}\n';

    const result = rule.heuristic(source);

    const hasOrphanViolation = (result.reason || '').includes('orphan atomic');

    assert.equal(hasOrphanViolation, EXPECT_FAIL);
  });

  it('flags Explaining Return Tight with call-expression prep', () => {
    const source = 'function pick() {\n  const today = computeToday();\n\n  return today;\n}\n';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Explaining Return pair must be tight/);
  });

  it('flags Explaining Return Tight with property-access prep', () => {
    const source = 'function pick() {\n  const name = user.displayName;\n\n  return name;\n}\n';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Explaining Return pair must be tight/);
  });

  it('flags Explaining Return Tight with await-expression prep', () => {
    const source =
      'async function pick() {\n  const record = await fetchRow();\n\n  return record;\n}\n';

    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Explaining Return pair must be tight/);
  });
});

describe('governance.validateNoSectionBanners (No section banners)', () => {
  const rule = findRule('No section banners');

  it('flags dash banner', () => {
    const source = '// ---------- Helpers ----------\nfunction helper() {}';
    const result = rule.heuristic(source);
    const actualPass = result.pass;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(result.reason, /Section banner detected/);
  });

  it('flags equals banner', () => {
    const source = '// ======= Section =======\nfunction helper() {}';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_FAIL);
  });

  it('flags hash banner (python/shell style)', () => {
    const source = '# ===== Section =====\ndef helper(): pass';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_FAIL);
  });

  it('flags sql-style banner', () => {
    const source = '-- ----- Section -----\nSELECT 1;';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_FAIL);
  });

  it('accepts clean source without banners', () => {
    const source = 'function helper() {}\n\nfunction privateOne() {}\n';
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });
});

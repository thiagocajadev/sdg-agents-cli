import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RulesLoader } from './rules-loader.mjs';

describe('RulesLoader', () => {
  describe('loadRules()', () => {
    it('should load rules with a version field', () => {
      const expected = 1;

      const actual = RulesLoader.loadRules();

      assert.equal(actual.version, expected);
    });

    it('should separate BLOCK and WARN rules into distinct arrays', () => {
      const actual = RulesLoader.loadRules();

      const isBlockArray = Array.isArray(actual.block);
      const isWarnArray = Array.isArray(actual.warn);

      assert.ok(isBlockArray);
      assert.ok(isWarnArray);

      const hasOnlyBlockRules = actual.block.every((rule) => rule.tier === 'BLOCK');
      const hasOnlyWarnRules = actual.warn.every((rule) => rule.tier === 'WARN');

      assert.ok(hasOnlyBlockRules);
      assert.ok(hasOnlyWarnRules);
    });

    it('should include all rules in the all array', () => {
      const actual = RulesLoader.loadRules();

      const expectedTotal = actual.block.length + actual.warn.length;

      assert.equal(actual.all.length, expectedTotal);
    });

    it('should load exclude patterns', () => {
      const actual = RulesLoader.loadRules();

      const isExcludeArray = Array.isArray(actual.exclude);
      const hasExcludes = actual.exclude.length > 0;

      assert.ok(isExcludeArray);
      assert.ok(hasExcludes);
    });

    it('should include explaining-returns as a BLOCK rule', () => {
      const expectedId = 'explaining-returns';
      const expectedTier = 'BLOCK';

      const actual = RulesLoader.loadRules();
      const rule = actual.block.find((r) => r.id === expectedId);
      const ruleFound = rule !== undefined;
      assert.ok(ruleFound);
      assert.equal(rule.tier, expectedTier);
    });

    it('should carry void-terminator exemption in explaining-returns description', () => {
      const expectedFragment = 'void-terminator';

      const actual = RulesLoader.loadRules();

      const rule = actual.block.find((r) => r.id === 'explaining-returns');
      const hasExemption = rule.description.includes(expectedFragment);
      assert.ok(hasExemption);
    });

    it('should include ceremonial-void-return as a WARN rule', () => {
      const expectedId = 'ceremonial-void-return';
      const expectedTier = 'WARN';

      const actual = RulesLoader.loadRules();
      const rule = actual.warn.find((r) => r.id === expectedId);
      const ruleFound = rule !== undefined;
      assert.ok(ruleFound);
      assert.equal(rule.tier, expectedTier);
    });

    it('should enumerate binary-comparison and unary-negation forms in named-const-before-call', () => {
      const expectedBinaryFragment = 'binary-comparison';
      const expectedNegationFragment = 'unary-negation';

      const actual = RulesLoader.loadRules();
      const rule = actual.block.find((r) => r.id === 'named-const-before-call');

      const hasBinaryForm = rule.description.includes(expectedBinaryFragment);
      const hasNegationForm = rule.description.includes(expectedNegationFragment);

      assert.ok(hasBinaryForm);
      assert.ok(hasNegationForm);
    });

    it('should carry test-framework title exemption in named-const-before-call', () => {
      const expectedFragment = 'Test-framework title exemption';

      const actual = RulesLoader.loadRules();

      const rule = actual.block.find((r) => r.id === 'named-const-before-call');
      const hasExemption = rule.description.includes(expectedFragment);
      assert.ok(hasExemption);
    });

    it('should prime method-call-as-boolean-subject case in named-const-before-call', () => {
      const expectedFragment = 'assert.ok(actual.includes(expected))';

      const actual = RulesLoader.loadRules();

      const rule = actual.block.find((r) => r.id === 'named-const-before-call');
      const hasMethodCallPriming = rule.description.includes(expectedFragment);
      assert.ok(hasMethodCallPriming);
    });
  });
});

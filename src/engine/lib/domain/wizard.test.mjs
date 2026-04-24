import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WizardUtils } from './wizard.mjs';

const { validateSelections } = WizardUtils;

describe('WizardUtils (Non-Interactive)', () => {
  describe('validateSelections()', () => {
    it('should accept valid flavor', () => {
      const input = { flavor: 'vertical-slice' };
      const expectedSuccess = true;

      const actual = validateSelections(input);

      assert.equal(actual.isSuccess, expectedSuccess);
    });

    it('should reject missing flavor', () => {
      const input = {};
      const expectedFailure = true;
      const expectedCode = 'MISSING_FLAVOR';

      const actual = validateSelections(input);

      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.error.code, expectedCode);
    });

    it('should reject unknown flavor', () => {
      const input = { flavor: 'nonexistent' };
      const expectedFailure = true;
      const expectedCode = 'INVALID_FLAVOR';
      const expectedInMessage = 'nonexistent';

      const actual = validateSelections(input);

      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.error.code, expectedCode);
      const hasExpectedInMessage = actual.error.message.includes(expectedInMessage);
      assert.ok(hasExpectedInMessage);
    });

    it('should apply default flavor for quick mode', () => {
      const input = { mode: 'quick' };
      const expectedSuccess = true;
      const expectedFlavor = 'lite';

      const actual = validateSelections(input);

      assert.equal(actual.isSuccess, expectedSuccess);
      assert.equal(actual.value.flavor, expectedFlavor);
    });

    it('should accept each supported flavor', () => {
      const expectedSuccess = true;
      for (const flavor of ['lite', 'vertical-slice', 'mvc', 'legacy']) {
        const actual = validateSelections({ flavor });
        assert.equal(actual.isSuccess, expectedSuccess, `flavor ${flavor} should be accepted`);
      }
    });
  });

  describe('WizardUtils surface', () => {
    it('should only export gatherUserSelections and validateSelections', () => {
      const expectedKeys = ['gatherUserSelections', 'validateSelections'];
      const actualKeys = Object.keys(WizardUtils).sort();
      assert.deepEqual(actualKeys, expectedKeys.sort());
    });
  });
});

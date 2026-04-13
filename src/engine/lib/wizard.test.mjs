import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WizardUtils } from './wizard.mjs';

const { validateSelections, autoSelectVersions } = WizardUtils;

describe('WizardUtils (Non-Interactive)', () => {
  describe('validateSelections()', () => {
    it('should accept valid flavor and idioms', () => {
      const input = {
        flavor: 'vertical-slice',
        idioms: ['typescript'],
        versions: {},
      };
      const expectedSuccess = true;

      const actual = validateSelections(input);

      assert.equal(actual.isSuccess, expectedSuccess);
    });

    it('should reject missing flavor', () => {
      const input = { idioms: ['typescript'], versions: {} };
      const expectedFailure = true;
      const expectedCode = 'MISSING_FLAVOR';

      const actual = validateSelections(input);

      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.error.code, expectedCode);
    });

    it('should reject unknown flavor', () => {
      const input = {
        flavor: 'nonexistent',
        idioms: ['typescript'],
        versions: {},
      };
      const expectedFailure = true;
      const expectedCode = 'INVALID_FLAVOR';
      const expectedInMessage = 'nonexistent';

      const actual = validateSelections(input);

      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.error.code, expectedCode);
      assert.ok(actual.error.message.includes(expectedInMessage));
    });

    it('should reject empty idioms', () => {
      const input = {
        flavor: 'mvc',
        idioms: [],
        versions: {},
      };
      const expectedFailure = true;
      const expectedCode = 'MISSING_IDIOM';

      const actual = validateSelections(input);

      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.error.code, expectedCode);
    });

    it('should reject unknown idiom', () => {
      const input = {
        flavor: 'mvc',
        idioms: ['cobol'],
        versions: {},
      };
      const expectedFailure = true;
      const expectedCode = 'INVALID_IDIOM';
      const expectedInMessage = 'cobol';

      const actual = validateSelections(input);

      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.error.code, expectedCode);
      assert.ok(actual.error.message.includes(expectedInMessage));
    });

    it('should accept multiple valid idioms', () => {
      const input = {
        flavor: 'vertical-slice',
        idioms: ['typescript', 'python', 'go'],
        versions: {},
      };
      const expectedSuccess = true;

      const actual = validateSelections(input);

      assert.equal(actual.isSuccess, expectedSuccess);
    });
  });

  describe('autoSelectVersions()', () => {
    it('should auto-select the latest version for each idiom', () => {
      const input = { flavor: 'mvc', idioms: ['typescript', 'csharp'], versions: {} };

      autoSelectVersions(input);

      assert.ok(input.versions.typescript);
      assert.ok(input.versions.csharp);
    });

    it('should not override explicitly set versions', () => {
      const input = {
        flavor: 'mvc',
        idioms: ['typescript'],
        versions: { typescript: 'ts@5.9' },
      };
      const expected = 'ts@5.9';

      autoSelectVersions(input);

      assert.equal(input.versions.typescript, expected);
    });

    it('should not throw when versions object is missing and auto-populate from registry', () => {
      const input = { flavor: 'mvc', idioms: ['typescript'], versions: {} };

      assert.doesNotThrow(() => autoSelectVersions(input));
      assert.ok(input.versions.typescript);
    });
  });
});

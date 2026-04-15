import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WizardUtils } from './wizard.mjs';

const { validateSelections, resolveVersionsByCodeStyle } = WizardUtils;

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

  describe('resolveVersionsByCodeStyle()', () => {
    it('should resolve latest versions for each idiom when codeStyle is latest', () => {
      const input = {
        flavor: 'mvc',
        idioms: ['typescript', 'csharp'],
        versions: {},
        codeStyle: 'latest',
      };

      resolveVersionsByCodeStyle(input);

      assert.ok(input.versions.typescript);
      assert.ok(input.versions.csharp);
    });

    it('should not override explicitly set versions', () => {
      const input = {
        flavor: 'mvc',
        idioms: ['typescript'],
        versions: { typescript: 'ts@5.9' },
        codeStyle: 'latest',
      };
      const expected = 'ts@5.9';

      resolveVersionsByCodeStyle(input);

      assert.equal(input.versions.typescript, expected);
    });

    it('should resolve conservative versions when codeStyle is conservative', () => {
      const input = { flavor: 'mvc', idioms: ['csharp'], versions: {}, codeStyle: 'conservative' };

      resolveVersionsByCodeStyle(input);

      // why: csharp first entry is LTS (.NET 10), conservative should still resolve a version
      assert.ok(input.versions.csharp);
    });

    it('should not throw when versions object is missing and auto-populate from registry', () => {
      const input = { flavor: 'mvc', idioms: ['typescript'], versions: {}, codeStyle: 'latest' };

      assert.doesNotThrow(() => resolveVersionsByCodeStyle(input));
      assert.ok(input.versions.typescript);
    });
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WizardUtils } from './wizard.mjs';

const { validateSelections, autoSelectVersions } = WizardUtils;

describe('WizardUtils (Non-Interactive)', () => {
  describe('validateSelections()', () => {
    it('should accept valid flavor and idioms', () => {
      const result = validateSelections({
        flavor: 'vertical-slice',
        idioms: ['typescript'],
        versions: {},
      });

      assert.equal(result.isSuccess, true);
    });

    it('should reject missing flavor', () => {
      const result = validateSelections({ idioms: ['typescript'], versions: {} });

      assert.equal(result.isFailure, true);
      assert.equal(result.error.code, 'MISSING_FLAVOR');
    });

    it('should reject unknown flavor', () => {
      const result = validateSelections({
        flavor: 'nonexistent',
        idioms: ['typescript'],
        versions: {},
      });

      assert.equal(result.isFailure, true);
      assert.equal(result.error.code, 'INVALID_FLAVOR');
      assert.ok(result.error.message.includes('nonexistent'));
    });

    it('should reject empty idioms', () => {
      const result = validateSelections({
        flavor: 'mvc',
        idioms: [],
        versions: {},
      });

      assert.equal(result.isFailure, true);
      assert.equal(result.error.code, 'MISSING_IDIOM');
    });

    it('should reject unknown idiom', () => {
      const result = validateSelections({
        flavor: 'mvc',
        idioms: ['cobol'],
        versions: {},
      });

      assert.equal(result.isFailure, true);
      assert.equal(result.error.code, 'INVALID_IDIOM');
      assert.ok(result.error.message.includes('cobol'));
    });

    it('should accept multiple valid idioms', () => {
      const result = validateSelections({
        flavor: 'vertical-slice',
        idioms: ['typescript', 'python', 'go'],
        versions: {},
      });

      assert.equal(result.isSuccess, true);
    });
  });

  describe('autoSelectVersions()', () => {
    it('should auto-select the latest version for each idiom', () => {
      const selections = { flavor: 'mvc', idioms: ['typescript', 'csharp'], versions: {} };

      autoSelectVersions(selections);

      assert.ok(selections.versions.typescript);
      assert.ok(selections.versions.csharp);
    });

    it('should not override explicitly set versions', () => {
      const selections = {
        flavor: 'mvc',
        idioms: ['typescript'],
        versions: { typescript: 'ts@5.9' },
      };

      autoSelectVersions(selections);

      assert.equal(selections.versions.typescript, 'ts@5.9');
    });

    it('should not throw when versions object is missing and auto-populate from registry', () => {
      const selections = { flavor: 'mvc', idioms: ['typescript'], versions: {} };

      autoSelectVersions(selections);

      assert.ok(selections.versions.typescript);
    });
  });
});

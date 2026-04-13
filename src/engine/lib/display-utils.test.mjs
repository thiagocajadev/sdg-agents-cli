import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DisplayUtils } from './display-utils.mjs';

const { displayName } = DisplayUtils;

describe('DisplayUtils', () => {
  describe('displayName()', () => {
    it('should return "(none)" for null or empty input', () => {
      const inputNull = null;
      const inputEmpty = '';
      const inputNone = 'none';
      const expected = '(none)';

      const actualNull = displayName(inputNull);
      const actualEmpty = displayName(inputEmpty);
      const actualNone = displayName(inputNone);

      assert.equal(actualNull, expected);
      assert.equal(actualEmpty, expected);
      assert.equal(actualNone, expected);
    });

    it('should return hardcoded labels for core flavors', () => {
      const inputLite = 'lite';
      const inputVS = 'vertical-slice';
      const inputMVC = 'mvc';
      const inputLegacy = 'legacy';

      const expectedLite = 'Lite';
      const expectedVS = 'Vertical Slice';
      const expectedMVC = 'MVC';
      const expectedLegacy = 'Legacy Pipeline';

      const actualLite = displayName(inputLite);
      const actualVS = displayName(inputVS);
      const actualMVC = displayName(inputMVC);
      const actualLegacy = displayName(inputLegacy);

      assert.equal(actualLite, expectedLite);
      assert.equal(actualVS, expectedVS);
      assert.equal(actualMVC, expectedMVC);
      assert.equal(actualLegacy, expectedLegacy);
    });

    it('should return name from STACK_DISPLAY_NAMES config if available', () => {
      const input = 'javascript';
      const expected = 'JavaScript (Vanilla / ESM)';

      const actual = displayName(input);

      assert.equal(actual, expected);
    });

    it('should return the key itself if no display name is found', () => {
      const input = 'unknown-stack-key';
      const expected = input;

      const actual = displayName(input);

      assert.equal(actual, expected);
    });
  });
});

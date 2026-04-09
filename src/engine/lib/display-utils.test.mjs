import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DisplayUtils } from './display-utils.mjs';

const { displayName } = DisplayUtils;

describe('DisplayUtils', () => {
  describe('displayName()', () => {
    it('should return "(none)" for null or empty input', () => {
      assert.equal(displayName(null), '(none)');
      assert.equal(displayName(''), '(none)');
      assert.equal(displayName('none'), '(none)');
    });

    it('should return hardcoded labels for core flavors', () => {
      assert.equal(displayName('lite'), 'Lite');
      assert.equal(displayName('vertical-slice'), 'Vertical Slice');
      assert.equal(displayName('mvc'), 'MVC');
      assert.equal(displayName('legacy'), 'Legacy Pipeline');
    });

    it('should return name from STACK_DISPLAY_NAMES config if available', () => {
      // Testing a known key from stack-display.mjs
      assert.equal(displayName('javascript'), 'JavaScript (Vanilla / ESM)');
    });

    it('should return the key itself if no display name is found', () => {
      assert.equal(displayName('unknown-stack-key'), 'unknown-stack-key');
    });
  });
});

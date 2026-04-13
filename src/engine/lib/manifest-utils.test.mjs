import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ManifestUtils } from './manifest-utils.mjs';

const { compareHashes, daysAgo } = ManifestUtils;

describe('ManifestUtils', () => {
  describe('compareHashes()', () => {
    it('should classify unchanged files correctly', () => {
      const stored = { 'core/staff-dna.md': 'abc123', 'core/security.md': 'def456' };
      const current = { 'core/staff-dna.md': 'abc123', 'core/security.md': 'def456' };
      const expectedUnchanged = ['core/staff-dna.md', 'core/security.md'];
      const expectedEmpty = [];

      const actual = compareHashes(stored, current);

      assert.deepEqual(actual.unchanged, expectedUnchanged);
      assert.deepEqual(actual.changed, expectedEmpty);
      assert.deepEqual(actual.added, expectedEmpty);
    });

    it('should detect changed files', () => {
      const stored = { 'core/staff-dna.md': 'abc123' };
      const current = { 'core/staff-dna.md': 'xyz789' };
      const expectedChanged = ['core/staff-dna.md'];
      const expectedEmpty = [];

      const actual = compareHashes(stored, current);

      assert.deepEqual(actual.changed, expectedChanged);
      assert.deepEqual(actual.unchanged, expectedEmpty);
    });

    it('should detect newly added files', () => {
      const stored = { 'core/staff-dna.md': 'abc123' };
      const current = { 'core/staff-dna.md': 'abc123', 'core/new-file.md': 'new456' };
      const expectedAdded = ['core/new-file.md'];
      const expectedUnchanged = ['core/staff-dna.md'];

      const actual = compareHashes(stored, current);

      assert.deepEqual(actual.added, expectedAdded);
      assert.deepEqual(actual.unchanged, expectedUnchanged);
    });

    it('should handle mixed changes, additions, and unchanged', () => {
      const stored = {
        'core/a.md': 'hash1',
        'core/b.md': 'hash2',
        'core/c.md': 'hash3',
      };
      const current = {
        'core/a.md': 'hash1', // unchanged
        'core/b.md': 'hash2_updated', // changed
        'core/c.md': 'hash3', // unchanged
        'core/d.md': 'hash4', // added
      };
      const expectedUnchanged = ['core/a.md', 'core/c.md'];
      const expectedChanged = ['core/b.md'];
      const expectedAdded = ['core/d.md'];

      const actual = compareHashes(stored, current);

      assert.deepEqual(actual.unchanged, expectedUnchanged);
      assert.deepEqual(actual.changed, expectedChanged);
      assert.deepEqual(actual.added, expectedAdded);
    });

    it('should handle empty stored hashes (fresh install scenario)', () => {
      const stored = {};
      const current = { 'core/a.md': 'hash1', 'core/b.md': 'hash2' };
      const expectedAdded = ['core/a.md', 'core/b.md'];
      const expectedEmpty = [];

      const actual = compareHashes(stored, current);

      assert.deepEqual(actual.added, expectedAdded);
      assert.deepEqual(actual.changed, expectedEmpty);
      assert.deepEqual(actual.unchanged, expectedEmpty);
    });

    it('should handle empty current hashes', () => {
      const stored = { 'core/a.md': 'hash1' };
      const current = {};
      const expectedEmpty = [];

      const actual = compareHashes(stored, current);

      // Files in stored but not in current are simply not reported
      assert.deepEqual(actual.added, expectedEmpty);
      assert.deepEqual(actual.changed, expectedEmpty);
      assert.deepEqual(actual.unchanged, expectedEmpty);
    });
  });

  describe('daysAgo()', () => {
    it('should return "today" for current date', () => {
      const input = new Date().toISOString();
      const expected = 'today';

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });

    it('should return "1 day ago" for yesterday', () => {
      const input = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const expected = '1 day ago';

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });

    it('should return "N days ago" for older dates', () => {
      const input = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString();
      const expected = '5 days ago';

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });

    it('should handle ISO date strings correctly', () => {
      const input = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString();
      const expected = '10 days ago';

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });
  });
});

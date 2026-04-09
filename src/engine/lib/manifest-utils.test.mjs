import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ManifestUtils } from './manifest-utils.mjs';

const { compareHashes, daysAgo } = ManifestUtils;

describe('ManifestUtils', () => {
  describe('compareHashes()', () => {
    it('should classify unchanged files correctly', () => {
      const stored = { 'core/staff-dna.md': 'abc123', 'core/security.md': 'def456' };
      const current = { 'core/staff-dna.md': 'abc123', 'core/security.md': 'def456' };

      const result = compareHashes(stored, current);

      assert.deepEqual(result.unchanged, ['core/staff-dna.md', 'core/security.md']);
      assert.deepEqual(result.changed, []);
      assert.deepEqual(result.added, []);
    });

    it('should detect changed files', () => {
      const stored = { 'core/staff-dna.md': 'abc123' };
      const current = { 'core/staff-dna.md': 'xyz789' };

      const result = compareHashes(stored, current);

      assert.deepEqual(result.changed, ['core/staff-dna.md']);
      assert.deepEqual(result.unchanged, []);
    });

    it('should detect newly added files', () => {
      const stored = { 'core/staff-dna.md': 'abc123' };
      const current = { 'core/staff-dna.md': 'abc123', 'core/new-file.md': 'new456' };

      const result = compareHashes(stored, current);

      assert.deepEqual(result.added, ['core/new-file.md']);
      assert.deepEqual(result.unchanged, ['core/staff-dna.md']);
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

      const result = compareHashes(stored, current);

      assert.deepEqual(result.unchanged, ['core/a.md', 'core/c.md']);
      assert.deepEqual(result.changed, ['core/b.md']);
      assert.deepEqual(result.added, ['core/d.md']);
    });

    it('should handle empty stored hashes (fresh install scenario)', () => {
      const stored = {};
      const current = { 'core/a.md': 'hash1', 'core/b.md': 'hash2' };

      const result = compareHashes(stored, current);

      assert.deepEqual(result.added, ['core/a.md', 'core/b.md']);
      assert.deepEqual(result.changed, []);
      assert.deepEqual(result.unchanged, []);
    });

    it('should handle empty current hashes', () => {
      const stored = { 'core/a.md': 'hash1' };
      const current = {};

      const result = compareHashes(stored, current);

      // Files in stored but not in current are simply not reported
      assert.deepEqual(result.added, []);
      assert.deepEqual(result.changed, []);
      assert.deepEqual(result.unchanged, []);
    });
  });

  describe('daysAgo()', () => {
    it('should return "today" for current date', () => {
      const now = new Date().toISOString();
      assert.equal(daysAgo(now), 'today');
    });

    it('should return "1 day ago" for yesterday', () => {
      const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      assert.equal(daysAgo(yesterday), '1 day ago');
    });

    it('should return "N days ago" for older dates', () => {
      const fiveDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString();
      assert.equal(daysAgo(fiveDaysAgo), '5 days ago');
    });

    it('should handle ISO date strings correctly', () => {
      const tenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString();
      assert.equal(daysAgo(tenDaysAgo), '10 days ago');
    });
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FsUtils } from './fs-utils.mjs';

const {
  parseVersionNumber,
  evaluateVersionCondition,
  filterContentByVersion,
  getDirname,
  getDirectories,
} = FsUtils;

describe('FsUtils', () => {
  describe('parseVersionNumber()', () => {
    it('should parse a simple integer version', () => {
      assert.equal(parseVersionNumber('10'), 10);
    });

    it('should parse a decimal version', () => {
      assert.equal(parseVersionNumber('3.14'), 3.14);
    });

    it('should parse an integer version with @ prefix', () => {
      assert.equal(parseVersionNumber('dotnet@10'), 10);
    });

    it('should parse a version with v prefix', () => {
      assert.equal(parseVersionNumber('v1.2.3'), 1.2);
    });

    it('should parse a decimal version with @ prefix', () => {
      assert.equal(parseVersionNumber('py@3.13'), 3.13);
    });

    it('should return null for a string with no numbers', () => {
      assert.equal(parseVersionNumber('latest'), null);
    });

    it('should return null for empty string', () => {
      assert.equal(parseVersionNumber(''), null);
    });
  });

  describe('evaluateVersionCondition()', () => {
    it('should return true when value equals or exceeds the >= threshold', () => {
      assert.equal(evaluateVersionCondition('>=10', 10), true);
      assert.equal(evaluateVersionCondition('>=10', 11), true);
    });

    it('should return false when value is below the >= threshold', () => {
      assert.equal(evaluateVersionCondition('>=10', 9), false);
    });

    it('should return true when value equals or is below the <= threshold', () => {
      assert.equal(evaluateVersionCondition('<=10', 10), true);
      assert.equal(evaluateVersionCondition('<=10', 9), true);
    });

    it('should return false when value exceeds the <= threshold', () => {
      assert.equal(evaluateVersionCondition('<=10', 11), false);
    });

    it('should return true when value strictly exceeds the > threshold', () => {
      assert.equal(evaluateVersionCondition('>10', 11), true);
    });

    it('should return false when value equals the > threshold', () => {
      assert.equal(evaluateVersionCondition('>10', 10), false);
    });

    it('should return true when value is strictly below the < threshold', () => {
      assert.equal(evaluateVersionCondition('<10', 9), true);
    });

    it('should return false when value equals the < threshold', () => {
      assert.equal(evaluateVersionCondition('<10', 10), false);
    });

    it('should return true when value exactly matches the == condition', () => {
      assert.equal(evaluateVersionCondition('==10', 10), true);
    });

    it('should return false when value does not match the == condition', () => {
      assert.equal(evaluateVersionCondition('==10', 11), false);
    });

    it('should return true when value matches the = condition (single equal)', () => {
      assert.equal(evaluateVersionCondition('=10', 10), true);
    });

    it('should return false when value does not match the = condition (single equal)', () => {
      assert.equal(evaluateVersionCondition('=10', 11), false);
    });

    it('should default to == when no operator is present and value matches', () => {
      assert.equal(evaluateVersionCondition('10', 10), true);
    });

    it('should default to == when no operator is present and value does not match', () => {
      assert.equal(evaluateVersionCondition('10', 11), false);
    });

    it('should return true when decimal value meets the >= threshold', () => {
      assert.equal(evaluateVersionCondition('>=3.13', 3.14), true);
    });

    it('should return false when decimal value is below the >= threshold', () => {
      assert.equal(evaluateVersionCondition('>=3.13', 3.12), false);
    });

    it('should return true for unparseable condition (permissive fallback)', () => {
      assert.equal(evaluateVersionCondition('invalid', 10), true);
    });
  });

  describe('filterContentByVersion()', () => {
    it('should keep blocks matching the target version', () => {
      const content = '<section version=">=10">Keep this</section>';
      const filtered = filterContentByVersion(content, 'dotnet@10');

      assert.equal(filtered, '<section version=">=10">Keep this</section>');
    });

    it('should remove blocks NOT matching the target version', () => {
      const content = 'Before\n<section version=">=11">Remove this</section>\nAfter';
      const filtered = filterContentByVersion(content, 'dotnet@10');

      assert.equal(filtered, 'Before\n\nAfter');
    });

    it('should keep matching blocks and remove non-matching blocks when multiple are present', () => {
      const content = [
        '<block version=">=8">Legacy block</block>',
        '<block version=">=10">Current block</block>',
        '<block version=">=12">Future block</block>',
      ].join('\n');

      const filtered = filterContentByVersion(content, 'dotnet@10');

      assert.ok(filtered.includes('Legacy block'));
      assert.ok(filtered.includes('Current block'));
      assert.ok(!filtered.includes('Future block'));
    });

    it('should return content unchanged when targetVersion is null', () => {
      const content = '<block version=">=10">Some content</block>';
      const filtered = filterContentByVersion(content, null);

      assert.equal(filtered, content);
    });

    it('should return content unchanged when targetVersion is unparseable', () => {
      const content = '<block version=">=10">Some content</block>';
      const filtered = filterContentByVersion(content, 'latest');

      assert.equal(filtered, content);
    });

    it('should preserve non-versioned content', () => {
      const content = 'Regular content without version tags.';
      const filtered = filterContentByVersion(content, 'dotnet@10');

      assert.equal(filtered, content);
    });
  });

  describe('getDirname()', () => {
    it('should return a valid directory path from a file URL', () => {
      const resolvedDirname = getDirname('file:///home/user/project/src/index.mjs');

      assert.equal(resolvedDirname, '/home/user/project/src');
    });

    it('should return the directory of the current test file', () => {
      const resolvedDirname = getDirname(import.meta.url);

      assert.ok(
        resolvedDirname.endsWith('/src/engine/lib') ||
          resolvedDirname.endsWith('\\src\\engine\\lib')
      );
    });
  });

  describe('getDirectories()', () => {
    it('should return an empty array when the path does not exist', () => {
      const result = getDirectories('/non-existent-path-sdg-test');

      assert.deepEqual(result, []);
    });

    it('should return only directory names for a valid path', () => {
      const parentDir = getDirname(import.meta.url);
      const result = getDirectories(parentDir);

      assert.ok(Array.isArray(result));
      assert.ok(result.every((directoryName) => typeof directoryName === 'string'));
    });
  });
});

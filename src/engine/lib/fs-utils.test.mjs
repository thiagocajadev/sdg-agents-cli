import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FsUtils } from './fs-utils.mjs';

const { filterContentByVersion, getDirname, getDirectories, copyRecursiveSync } = FsUtils;

describe('FsUtils', () => {
  describe('filterContentByVersion()', () => {
    it('should keep blocks matching the target version', () => {
      const input = '<section version=">=10">Keep this</section>';
      const expected = input;

      const actual = filterContentByVersion(input, 'dotnet@10');

      assert.equal(actual, expected);
    });

    it('should remove blocks NOT matching the target version', () => {
      const input = 'Before\n<section version=">=11">Remove this</section>\nAfter';
      const expected = 'Before\n\nAfter';

      const actual = filterContentByVersion(input, 'dotnet@10');

      assert.equal(actual, expected);
    });

    it('should keep matching blocks and remove non-matching blocks when multiple are present', () => {
      const input = [
        '<block version=">=8">Legacy block</block>',
        '<block version=">=10">Current block</block>',
        '<block version=">=12">Future block</block>',
      ].join('\n');
      const expectedToContain = ['Legacy block', 'Current block'];
      const expectedToExclude = 'Future block';

      const actual = filterContentByVersion(input, 'dotnet@10');

      assert.ok(actual.includes(expectedToContain[0]));
      assert.ok(actual.includes(expectedToContain[1]));
      assert.ok(!actual.includes(expectedToExclude));
    });

    it('should return content unchanged when targetVersion is null', () => {
      const input = '<block version=">=10">Some content</block>';
      const expected = input;

      const actual = filterContentByVersion(input, null);

      assert.equal(actual, expected);
    });

    it('should return content unchanged when targetVersion is unparseable', () => {
      const input = '<block version=">=10">Some content</block>';
      const expected = input;

      const actual = filterContentByVersion(input, 'latest');

      assert.equal(actual, expected);
    });

    it('should preserve non-versioned content', () => {
      const input = 'Regular content without version tags.';
      const expected = input;

      const actual = filterContentByVersion(input, 'dotnet@10');

      assert.equal(actual, expected);
    });

    describe('Complex conditions', () => {
      it('should handle decimal thresholds and values', () => {
        const input = '<section version=">=3.13">Target</section>';
        const expectedMatched = input;
        const expectedUnmatched = '';

        const actualMatched = filterContentByVersion(input, 'py@3.14');
        const actualUnmatched = filterContentByVersion(input, 'py@3.12');

        assert.equal(actualMatched, expectedMatched);
        assert.equal(actualUnmatched, expectedUnmatched);
      });

      it('should handle strictly greater than (>), strictly smaller than (<)', () => {
        const input = '<v version=">10">Up</v><v version="<10">Down</v>';
        const expectedUp = '<v version=">10">Up</v>';
        const expectedDown = '<v version="<10">Down</v>';
        const expectedNone = '';

        const actualUp = filterContentByVersion(input, '11');
        const actualDown = filterContentByVersion(input, '9');
        const actualNone = filterContentByVersion(input, '10');

        assert.equal(actualUp, expectedUp);
        assert.equal(actualDown, expectedDown);
        assert.equal(actualNone, expectedNone);
      });

      it('should handle equal (= and ==)', () => {
        const input = '<v version="=10">Exact</v><v version="==11">Exact2</v>';
        const expectedTen = '<v version="=10">Exact</v>';
        const expectedEleven = '<v version="==11">Exact2</v>';
        const expectedNone = '';

        const actualTen = filterContentByVersion(input, '10');
        const actualEleven = filterContentByVersion(input, '11');
        const actualNone = filterContentByVersion(input, '12');

        assert.equal(actualTen, expectedTen);
        assert.equal(actualEleven, expectedEleven);
        assert.equal(actualNone, expectedNone);
      });

      it('should handle less than or equal (<=)', () => {
        const input = '<v version="<=10">Bound</v>';
        const expectedMatched = input;
        const expectedUnmatched = '';

        const actualTen = filterContentByVersion(input, '10');
        const actualNine = filterContentByVersion(input, '9');
        const actualEleven = filterContentByVersion(input, '11');

        assert.equal(actualTen, expectedMatched);
        assert.equal(actualNine, expectedMatched);
        assert.equal(actualEleven, expectedUnmatched);
      });
    });
  });

  describe('getDirname()', () => {
    it('should return a valid directory path from a file URL', () => {
      const input = 'file:///home/user/project/src/index.mjs';
      const expected = '/home/user/project/src';

      const actual = getDirname(input);

      assert.equal(actual, expected);
    });

    it('should return the directory of the current test file', () => {
      const input = import.meta.url;

      const actual = getDirname(input);

      assert.ok(actual.endsWith('/src/engine/lib') || actual.endsWith('\\src\\engine\\lib'));
    });
  });

  describe('getDirectories()', () => {
    it('should return an empty array when the path does not exist', () => {
      const input = '/non-existent-path-sdg-test';
      const expected = [];

      const actual = getDirectories(input);

      assert.deepEqual(actual, expected);
    });

    it('should return only directory names for a valid path', () => {
      const parentDir = getDirname(import.meta.url);

      const actual = getDirectories(parentDir);

      assert.ok(Array.isArray(actual));
      assert.ok(actual.every((directoryName) => typeof directoryName === 'string'));
    });
  });

  describe('copyRecursiveSync()', () => {
    it('should copy a single file to a destination', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
      try {
        const srcFile = path.join(tmpDir, 'source.txt');
        const destFile = path.join(tmpDir, 'dest.txt');
        const expectedContent = 'hello';
        fs.writeFileSync(srcFile, expectedContent);

        copyRecursiveSync(srcFile, destFile);

        const actualExists = fs.existsSync(destFile);
        const actualContent = fs.readFileSync(destFile, 'utf8');

        assert.ok(actualExists);
        assert.equal(actualContent, expectedContent);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should copy a directory tree recursively', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
      try {
        const srcDir = path.join(tmpDir, 'src');
        const subDir = path.join(srcDir, 'sub');
        const rootText = 'root';
        const nestedText = 'nested';

        fs.mkdirSync(subDir, { recursive: true });
        fs.writeFileSync(path.join(srcDir, 'root.txt'), rootText);
        fs.writeFileSync(path.join(subDir, 'nested.txt'), nestedText);

        const destDir = path.join(tmpDir, 'dest');

        copyRecursiveSync(srcDir, destDir);

        const actualRootExists = fs.existsSync(path.join(destDir, 'root.txt'));
        const actualNestedExists = fs.existsSync(path.join(destDir, 'sub', 'nested.txt'));
        const actualRootText = fs.readFileSync(path.join(destDir, 'root.txt'), 'utf8');
        const actualNestedText = fs.readFileSync(path.join(destDir, 'sub', 'nested.txt'), 'utf8');

        assert.ok(actualRootExists);
        assert.ok(actualNestedExists);
        assert.equal(actualRootText, rootText);
        assert.equal(actualNestedText, nestedText);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should do nothing when the source path does not exist', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
      try {
        const destFile = path.join(tmpDir, 'dest.txt');
        const input = '/non-existent-path-sdg-test/file.txt';

        copyRecursiveSync(input, destFile);

        const actualExists = fs.existsSync(destFile);
        assert.ok(!actualExists);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});

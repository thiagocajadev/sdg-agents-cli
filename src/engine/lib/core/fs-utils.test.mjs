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

    it('should keep matching blocks when multiple are present', () => {
      const input = [
        '<block version=">=8">Legacy block</block>',
        '<block version=">=10">Current block</block>',
        '<block version=">=12">Future block</block>',
      ].join('\n');
      const expected = true;

      const actualRaw = filterContentByVersion(input, 'dotnet@10');
      const actual = actualRaw.includes('Legacy block') && actualRaw.includes('Current block');

      assert.equal(actual, expected);
    });

    it('should remove non-matching blocks when multiple are present', () => {
      const input = [
        '<block version=">=8">Legacy block</block>',
        '<block version=">=10">Current block</block>',
        '<block version=">=12">Future block</block>',
      ].join('\n');
      const expected = false;

      const actualRaw = filterContentByVersion(input, 'dotnet@10');
      const actual = actualRaw.includes('Future block');

      assert.equal(actual, expected);
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
      it('should handle decimal thresholds when value matches', () => {
        const input = '<section version=">=3.13">Target</section>';
        const expected = input;

        const actual = filterContentByVersion(input, 'py@3.14');

        assert.equal(actual, expected);
      });

      it('should remove decimal thresholds when value does not match', () => {
        const input = '<section version=">=3.13">Target</section>';
        const expected = '';

        const actual = filterContentByVersion(input, 'py@3.12');

        assert.equal(actual, expected);
      });

      it('should handle strictly greater than (>)', () => {
        const input = '<v version=">10">Up</v>';
        const expected = input;

        const actual = filterContentByVersion(input, '11');

        assert.equal(actual, expected);
      });

      it('should handle strictly smaller than (<)', () => {
        const input = '<v version="<10">Down</v>';
        const expected = input;

        const actual = filterContentByVersion(input, '9');

        assert.equal(actual, expected);
      });

      it('should handle equal (=)', () => {
        const input = '<v version="=10">Exact</v>';
        const expected = input;

        const actual = filterContentByVersion(input, '10');

        assert.equal(actual, expected);
      });

      it('should handle double equal (==)', () => {
        const input = '<v version="==11">Exact2</v>';
        const expected = input;

        const actual = filterContentByVersion(input, '11');

        assert.equal(actual, expected);
      });

      it('should handle less than or equal (<=)', () => {
        const input = '<v version="<=10">Bound</v>';
        const expected = input;

        const actual = filterContentByVersion(input, '10');

        assert.equal(actual, expected);
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
      const expected = true;

      const actualRaw = getDirname(input);
      const actual =
        actualRaw.endsWith('/src/engine/lib/core') ||
        actualRaw.endsWith('\\src\\engine\\lib\\core');

      assert.equal(actual, expected);
    });
  });

  describe('getDirectories()', () => {
    it('should return an empty array when the path does not exist', () => {
      const input = '/non-existent-path-sdg-test';
      const expected = [];

      const actual = getDirectories(input);

      assert.deepEqual(actual, expected);
    });

    it('should return a list of directory names for a valid path', () => {
      const coreDir = getDirname(import.meta.url);
      const input = path.join(coreDir, '..');
      const expected = true;

      const actualRaw = getDirectories(input);
      const actual = Array.isArray(actualRaw) && actualRaw.length > 0;

      assert.equal(actual, expected);
    });
  });

  describe('copyRecursiveSync()', () => {
    it('should copy a single file to a destination', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
      const srcFile = path.join(tmpDir, 'source.txt');
      const destFile = path.join(tmpDir, 'dest.txt');
      const expectedContent = 'hello';
      fs.writeFileSync(srcFile, expectedContent);

      copyRecursiveSync(srcFile, destFile);

      const actualExists = fs.existsSync(destFile);
      const actualContent = fs.readFileSync(destFile, 'utf8');

      assert.ok(actualExists);
      assert.equal(actualContent, expectedContent);

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should copy a directory tree recursively', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
      const srcDir = path.join(tmpDir, 'src');
      const subDir = path.join(srcDir, 'sub');
      const rootText = 'root';
      const nestedText = 'nested';
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'root.txt'), rootText);
      fs.writeFileSync(path.join(subDir, 'nested.txt'), nestedText);
      const destDir = path.join(tmpDir, 'dest');

      copyRecursiveSync(srcDir, destDir);

      const actualRootText = fs.readFileSync(path.join(destDir, 'root.txt'), 'utf8');
      const actualNestedText = fs.readFileSync(path.join(destDir, 'sub', 'nested.txt'), 'utf8');

      assert.equal(actualRootText, rootText);
      assert.equal(actualNestedText, nestedText);

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should do nothing when the source path does not exist', () => {
      const destFile = '/tmp/sdg-dest-non-existent.txt';
      const input = '/non-existent-path-sdg-test/file.txt';
      const expected = false;

      copyRecursiveSync(input, destFile);

      const actual = fs.existsSync(destFile);

      assert.equal(actual, expected);
    });
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FsUtils } from './fs-utils.mjs';

const { getDirname, getDirectories, copyRecursiveSync } = FsUtils;

describe('FsUtils', () => {
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

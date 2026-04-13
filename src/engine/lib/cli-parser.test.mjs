import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CliParser } from './cli-parser.mjs';

const { parseCliArgs, validateInit } = CliParser;

describe('CliParser', () => {
  describe('parseCliArgs()', () => {
    it('should parse a subcommand and positional target directory', () => {
      const input = ['init', 'my-project', '--flavor', 'lite'];
      const expectedSubcommand = 'init';
      const expectedTargetDir = 'my-project';
      const expectedFlavor = 'lite';

      const actual = parseCliArgs(input);

      assert.equal(actual.subcommand, expectedSubcommand);
      assert.equal(actual.targetDir, expectedTargetDir);
      assert.equal(actual.flavor, expectedFlavor);
    });

    it('should handle missing subcommand and default to null', () => {
      const input = ['--help'];
      const expectedSubcommand = null;
      const expectedHelp = true;

      const actual = parseCliArgs(input);

      assert.equal(actual.subcommand, expectedSubcommand);
      assert.equal(actual.help, expectedHelp);
    });

    it('should normalize comma-separated idioms into an array', () => {
      const input = ['init', '--idiom', 'javascript,typescript,python'];
      const expectedIdioms = ['javascript', 'typescript', 'python'];

      const actual = parseCliArgs(input);

      assert.deepEqual(actual.idioms, expectedIdioms);
    });

    it('should handle repeated flags for idioms', () => {
      const input = ['init', '--idiom', 'go', '--idiom', 'rust'];
      const expectedIdioms = ['go', 'rust'];

      const actual = parseCliArgs(input);

      assert.deepEqual(actual.idioms, expectedIdioms);
    });

    it('should identify help and version flags (long and short)', () => {
      const inputHelpLong = ['--help'];
      const inputHelpShort = ['-h'];
      const inputVersionLong = ['--version'];
      const inputVersionShort = ['-v'];
      const expectedTrue = true;

      const actualHelpLong = parseCliArgs(inputHelpLong).help;
      const actualHelpShort = parseCliArgs(inputHelpShort).help;
      const actualVersionLong = parseCliArgs(inputVersionLong).version;
      const actualVersionShort = parseCliArgs(inputVersionShort).version;

      assert.equal(actualHelpLong, expectedTrue);
      assert.equal(actualHelpShort, expectedTrue);
      assert.equal(actualVersionLong, expectedTrue);
      assert.equal(actualVersionShort, expectedTrue);
    });

    it('should handle dry-run flag', () => {
      const input = ['init', '--dry-run'];
      const expectedDryRun = true;

      const actual = parseCliArgs(input);

      assert.equal(actual.dryRun, expectedDryRun);
    });
  });

  describe('validateInit()', () => {
    it('should return null for valid non-interactive arguments', () => {
      const input = {
        flavor: 'lite',
        idioms: ['javascript'],
      };
      const expected = null;

      const actual = validateInit(input);

      assert.equal(actual, expected);
    });

    it('should return null for interactive mode (no flavor or idioms)', () => {
      const input = {
        flavor: null,
        idioms: [],
      };
      const expected = null;

      const actual = validateInit(input);

      assert.equal(actual, expected);
    });

    it('should return an error message if flavor is missing in non-interactive mode', () => {
      const input = {
        flavor: null,
        idioms: ['javascript'],
      };
      const expectedError = '--flavor is required';

      const actual = validateInit(input);

      assert.ok(actual.includes(expectedError));
    });

    it('should return an error message if idioms are empty in non-interactive mode', () => {
      const input = {
        flavor: 'lite',
        idioms: [],
      };
      const expectedError = 'At least one --idiom is required';

      const actual = validateInit(input);

      assert.ok(actual.includes(expectedError));
    });
  });
});

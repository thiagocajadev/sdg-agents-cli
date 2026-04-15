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
      assert.equal(actual.targetDirectory, expectedTargetDir);
      assert.equal(actual.flavor, expectedFlavor);
    });

    it('should correctly parse positional arg after a flag with value', () => {
      const input = ['init', '--flavor', 'mvc', 'my-project'];
      const expectedTargetDir = 'my-project';
      const expectedFlavor = 'mvc';

      const actual = parseCliArgs(input);

      assert.equal(actual.targetDirectory, expectedTargetDir);
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

    it('should parse --quick flag', () => {
      const input = ['init', '--quick'];
      const expectedQuick = true;

      const actual = parseCliArgs(input);

      assert.equal(actual.quick, expectedQuick);
    });

    it('should default quick to false when flag is absent', () => {
      const input = ['init', '--flavor', 'lite', '--idiom', 'typescript'];
      const expectedQuick = false;

      const actual = parseCliArgs(input);

      assert.equal(actual.quick, expectedQuick);
    });
  });

  describe('validateInit()', () => {
    it('should return null for --quick flag (bypasses all other validation)', () => {
      const input = { quick: true, flavor: null, idioms: [], mode: null };
      const expected = null;

      const actual = validateInit(input);

      assert.equal(actual, expected);
    });

    it('should return null for mode quick (bypasses all other validation)', () => {
      const input = { quick: false, mode: 'quick', flavor: null, idioms: [] };
      const expected = null;

      const actual = validateInit(input);

      assert.equal(actual, expected);
    });

    it('should return null for valid non-interactive arguments', () => {
      const input = { quick: false, flavor: 'lite', idioms: ['javascript'], mode: null };
      const expected = null;

      const actual = validateInit(input);

      assert.equal(actual, expected);
    });

    it('should return null for interactive mode (no flavor or idioms)', () => {
      const input = { quick: false, flavor: null, idioms: [], mode: null };
      const expected = null;

      const actual = validateInit(input);

      assert.equal(actual, expected);
    });

    it('should return an error message if flavor is missing in non-interactive mode', () => {
      const input = { quick: false, flavor: null, idioms: ['javascript'], mode: null };
      const expectedError = '--flavor is required';

      const actual = validateInit(input);

      assert.ok(actual.includes(expectedError));
    });

    it('should return an error message if idioms are empty in non-interactive mode', () => {
      const input = { quick: false, flavor: 'lite', idioms: [], mode: null };
      const expectedError = 'At least one --idiom is required';

      const actual = validateInit(input);

      assert.ok(actual.includes(expectedError));
    });
  });
});

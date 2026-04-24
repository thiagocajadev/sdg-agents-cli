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

      assert.equal(actual.isDryRun, expectedDryRun);
    });

    it('should parse --quick flag', () => {
      const input = ['init', '--quick'];
      const expectedQuick = true;

      const actual = parseCliArgs(input);

      assert.equal(actual.quick, expectedQuick);
    });

    it('should default quick to false when flag is absent', () => {
      const input = ['init', '--flavor', 'lite'];
      const expectedQuick = false;

      const actual = parseCliArgs(input);

      assert.equal(actual.quick, expectedQuick);
    });

    it('should not expose an idioms field (legacy flag removed in v5.0)', () => {
      const input = ['init', '--flavor', 'lite'];

      const actual = parseCliArgs(input);

      const hasIdiomsField = Object.prototype.hasOwnProperty.call(actual, 'idioms');
      const expectedAbsent = false;
      assert.equal(hasIdiomsField, expectedAbsent);
    });
  });

  describe('validateInit()', () => {
    const expectedPass = null;

    it('should return null for --quick flag (bypasses all other validation)', () => {
      const input = { quick: true, flavor: null, mode: null };

      const actual = validateInit(input);

      assert.equal(actual, expectedPass);
    });

    it('should return null for mode quick (bypasses all other validation)', () => {
      const input = { quick: false, mode: 'quick', flavor: null };

      const actual = validateInit(input);

      assert.equal(actual, expectedPass);
    });

    it('should return null for valid non-interactive arguments', () => {
      const input = { quick: false, flavor: 'lite', mode: null };

      const actual = validateInit(input);

      assert.equal(actual, expectedPass);
    });

    it('should return null for interactive mode (no flavor)', () => {
      const input = { quick: false, flavor: null, mode: null };

      const actual = validateInit(input);

      assert.equal(actual, expectedPass);
    });

    it('should return an error message if flavor is missing in non-interactive mode', () => {
      const input = { quick: false, flavor: null, mode: 'agents' };
      const expectedError = '--flavor is required';

      const actual = validateInit(input);
      const hasExpectedError = actual.includes(expectedError);

      assert.ok(hasExpectedError);
    });
  });
});

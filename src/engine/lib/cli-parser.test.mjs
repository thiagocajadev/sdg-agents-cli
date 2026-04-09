import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CliParser } from './cli-parser.mjs';

const { parseCliArgs, validateInit } = CliParser;

describe('CliParser', () => {
  describe('parseCliArgs()', () => {
    it('should parse a subcommand and positional target directory', () => {
      const argv = ['init', 'my-project', '--flavor', 'lite'];
      const args = parseCliArgs(argv);

      assert.equal(args.subcommand, 'init');
      assert.equal(args.targetDir, 'my-project');
      assert.equal(args.flavor, 'lite');
    });

    it('should handle missing subcommand and default to null', () => {
      const argv = ['--help'];
      const args = parseCliArgs(argv);

      assert.equal(args.subcommand, null);
      assert.equal(args.help, true);
    });

    it('should normalize comma-separated idioms into an array', () => {
      const argv = ['init', '--idiom', 'javascript,typescript,python'];
      const args = parseCliArgs(argv);

      assert.deepEqual(args.idioms, ['javascript', 'typescript', 'python']);
    });

    it('should handle repeated flags for idioms', () => {
      const argv = ['init', '--idiom', 'go', '--idiom', 'rust'];
      const args = parseCliArgs(argv);

      assert.deepEqual(args.idioms, ['go', 'rust']);
    });

    it('should identify help and version flags (long and short)', () => {
      assert.equal(parseCliArgs(['--help']).help, true);
      assert.equal(parseCliArgs(['-h']).help, true);
      assert.equal(parseCliArgs(['--version']).version, true);
      assert.equal(parseCliArgs(['-v']).version, true);
    });

    it('should handle dry-run flag', () => {
      const argv = ['init', '--dry-run'];
      const args = parseCliArgs(argv);
      assert.equal(args.dryRun, true);
    });
  });

  describe('validateInit()', () => {
    it('should return null for valid non-interactive arguments', () => {
      const args = {
        flavor: 'lite',
        idioms: ['javascript'],
      };
      assert.equal(validateInit(args), null);
    });

    it('should return null for interactive mode (no flavor or idioms)', () => {
      const args = {
        flavor: null,
        idioms: [],
      };
      assert.equal(validateInit(args), null);
    });

    it('should return an error message if flavor is missing in non-interactive mode', () => {
      const args = {
        flavor: null,
        idioms: ['javascript'],
      };
      const result = validateInit(args);
      assert.ok(result.includes('--flavor is required'));
    });

    it('should return an error message if idioms are empty in non-interactive mode', () => {
      const args = {
        flavor: 'lite',
        idioms: [],
      };
      const result = validateInit(args);
      assert.ok(result.includes('At least one --idiom is required'));
    });
  });
});

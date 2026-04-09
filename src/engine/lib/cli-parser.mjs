/**
 * CLI Parser — Sanitizes raw process.argv into a structured command object.
 * Responsibility: Argument parsing and basic validation only. No I/O.
 */

/**
 * Parses raw CLI arguments into a structured command object.
 * @param {string[]} argv - process.argv.slice(2)
 * @returns {Object} Structured arguments
 */
function parseCliArgs(argv) {
  const subcommand = argv[0] && !argv[0].startsWith('-') ? argv[0] : null;

  return {
    subcommand,
    // Note: targetDir resolution (path.resolve) should be handled by the caller
    // to keep this parser pure and environment-agnostic.
    targetDir: argv.slice(subcommand ? 1 : 0).filter(isPositionalArg)[0] || null,
    help: argv.includes('--help') || argv.includes('-h'),
    version: argv.includes('--version') || argv.includes('-v'),
    dryRun: argv.includes('--dry-run'),
    flavor: getArgValue(argv, '--flavor'),
    idioms: getArgValues(argv, '--idiom'),
    agents: getArgValues(argv, '--agents'),
    ide: getArgValue(argv, '--ide') || 'none',
    mode: getArgValue(argv, '--mode'),
    track: getArgValue(argv, '--track'),
    scope: getArgValue(argv, '--scope'),
  };
}

function isPositionalArg(arg, index, tokens) {
  if (arg.startsWith('-')) return false;
  const precedingToken = tokens[index - 1];
  const flagsThatConsumeNextArg = [
    '--flavor',
    '--idiom',
    '--agents',
    '--ide',
    '--mode',
    '--track',
    '--scope',
  ];
  return !precedingToken || !flagsThatConsumeNextArg.includes(precedingToken);
}

function getArgValue(argv, flag) {
  const flagPosition = argv.indexOf(flag);
  return flagPosition !== -1 && flagPosition + 1 < argv.length ? argv[flagPosition + 1] : null;
}

function getArgValues(argv, flag) {
  const values = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === flag && i + 1 < argv.length) {
      values.push(...argv[i + 1].split(','));
    }
  }
  return values;
}

/**
 * Validates requirements for the 'init' command in non-interactive mode.
 * @param {Object} args - Parsed arguments
 * @returns {string|null} Error message or null if valid
 */
function validateInit(args) {
  const isNonInteractive = args.mode || args.flavor || args.idioms.length > 0;
  if (!isNonInteractive) return null;

  if (args.mode === 'quick') return null;

  if (args.mode === 'prompts') {
    if (!args.track) return '  ⚠️  --track is required for mode "prompts".';
    return null;
  }

  if (!args.flavor) {
    return '  ⚠️  --flavor is required for non-interactive mode.\n  Available: vertical-slice, mvc, lite, legacy';
  }

  if (args.idioms.length === 0) {
    return '  ⚠️  At least one --idiom is required for non-interactive mode.\n  Available: javascript, typescript, python, csharp, java, go, rust';
  }

  return null;
}

export const CliParser = {
  parseCliArgs,
  validateInit,
};

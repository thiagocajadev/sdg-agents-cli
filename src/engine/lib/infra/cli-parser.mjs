function parseCliArgs(argv) {
  const subcommand = argv[0] && !argv[0].startsWith('-') ? argv[0] : null;

  const parsedArgs = {
    subcommand,
    // Note: targetDirectory resolution (path.resolve) should be handled by the caller
    // to keep this parser pure and environment-agnostic.
    targetDirectory: argv.slice(subcommand ? 1 : 0).filter(isPositionalArg)[0] || null,
    help: argv.includes('--help') || argv.includes('-h'),
    version: argv.includes('--version') || argv.includes('-v'),
    quick: argv.includes('--quick'),
    dryRun: argv.includes('--dry-run'),
    flavor: getArgValue(argv, '--flavor'),
    idioms: getArgValues(argv, '--idiom'),
    agents: getArgValues(argv, '--agents'),
    ide: getArgValue(argv, '--ide') || 'none',
    mode: getArgValue(argv, '--mode'),
    track: getArgValue(argv, '--track'),
    bump: !argv.includes('--no-bump'),
  };

  const finalArgs = parsedArgs;
  return finalArgs;
}

function isPositionalArg(arg, index, tokens) {
  if (arg.startsWith('-')) return false;
  const precedingToken = tokens[index - 1];
  const flagsThatConsumeNextArg = ['--flavor', '--idiom', '--agents', '--ide', '--mode', '--track'];
  const isPositional = !precedingToken || !flagsThatConsumeNextArg.includes(precedingToken);
  return isPositional;
}

function getArgValue(argv, flag) {
  const flagPosition = argv.indexOf(flag);
  const value =
    flagPosition !== -1 && flagPosition + 1 < argv.length ? argv[flagPosition + 1] : null;
  return value;
}

function getArgValues(argv, flag) {
  const values = [];
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === flag && index + 1 < argv.length) {
      values.push(...argv[index + 1].split(','));
    }
  }
  const argValues = values;
  return argValues;
}

function validateInit(args) {
  const isQuickMode = args.quick || args.mode === 'quick';
  if (isQuickMode) return null;

  const isNonInteractive = args.mode || args.flavor || args.idioms.length > 0;
  if (!isNonInteractive) return null;

  if (!args.flavor) {
    const missingFlavorError =
      '  ⚠️  --flavor is required for non-interactive mode.\n  Available: vertical-slice, mvc, lite, legacy';
    return missingFlavorError;
  }

  if (args.idioms.length === 0) {
    const missingIdiomError =
      '  ⚠️  At least one --idiom is required for non-interactive mode.\n  Available: javascript, typescript, python, csharp, java, go, rust';
    return missingIdiomError;
  }

  return null;
}

export const CliParser = {
  parseCliArgs,
  validateInit,
};

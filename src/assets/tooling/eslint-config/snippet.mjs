import { semanticSpacing } from '../eslint-rules/semantic-spacing.mjs';
import { noBooleanComparison } from '../eslint-rules/no-boolean-comparison.mjs';
import { noInlineAssert } from '../eslint-rules/no-inline-assert.mjs';

const localPlugin = {
  rules: {
    'semantic-spacing': semanticSpacing,
    'no-boolean-comparison': noBooleanComparison,
    'no-inline-assert': noInlineAssert,
  },
};

export const sdgEslintConfig = {
  plugins: { local: localPlugin },
  rules: {
    curly: ['error', 'all'],
    'no-nested-ternary': 'error',
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
    'multiline-ternary': ['error', 'always-multiline'],
    'local/semantic-spacing': ['error', { minBodySize: 2 }],
    'local/no-boolean-comparison': 'error',
    'local/no-inline-assert': 'error',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
    ],
  },
};

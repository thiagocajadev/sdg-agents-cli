import { semanticSpacing } from '../eslint-rules/semantic-spacing.mjs';
import { noBooleanComparison } from '../eslint-rules/no-boolean-comparison.mjs';
import { noInlineAssert } from '../eslint-rules/no-inline-assert.mjs';
import { blankBeforeAssertion } from '../eslint-rules/blank-before-assertion.mjs';

const localPlugin = {
  rules: {
    'semantic-spacing': semanticSpacing,
    'no-boolean-comparison': noBooleanComparison,
    'no-inline-assert': noInlineAssert,
    'blank-before-assertion': blankBeforeAssertion,
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

export const sdgTestConfig = {
  files: ['**/*.test.*', '**/*.spec.*'],
  rules: {
    'local/blank-before-assertion': 'error',
  },
};

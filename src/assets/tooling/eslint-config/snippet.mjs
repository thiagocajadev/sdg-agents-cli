import { semanticSpacing } from '../eslint-rules/semantic-spacing.mjs';
import { noBooleanComparison } from '../eslint-rules/no-boolean-comparison.mjs';

const localPlugin = {
  rules: {
    'semantic-spacing': semanticSpacing,
    'no-boolean-comparison': noBooleanComparison,
  },
};

export const sdgEslintConfig = {
  plugins: { local: localPlugin },
  rules: {
    curly: ['error', 'all'],
    'local/semantic-spacing': ['error', { minBodySize: 2 }],
    'local/no-boolean-comparison': 'error',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
    ],
  },
};

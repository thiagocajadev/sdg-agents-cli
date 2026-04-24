import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import { semanticSpacing } from './src/assets/tooling/eslint-rules/semantic-spacing.mjs';
import { noBooleanComparison } from './src/assets/tooling/eslint-rules/no-boolean-comparison.mjs';
import { noInlineAssert } from './src/assets/tooling/eslint-rules/no-inline-assert.mjs';

export default [
  js.configs.recommended,
  prettierRecommended,
  {
    plugins: {
      import: importPlugin,
      local: {
        rules: {
          'semantic-spacing': semanticSpacing,
          'no-boolean-comparison': noBooleanComparison,
          'no-inline-assert': noInlineAssert,
        },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-multi-spaces': 'error',
      'prettier/prettier': 'error',
      curly: ['error', 'all'],
      'no-nested-ternary': 'error',
      'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
      'multiline-ternary': ['error', 'always-multiline'],
      'local/semantic-spacing': ['error', { minBodySize: 2 }],
      'local/no-boolean-comparison': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: '*', next: 'function' },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          mjs: 'always',
        },
      ],
    },
  },
  {
    files: ['src/engine/config/governance.test.mjs'],
    rules: {
      'local/no-inline-assert': 'error',
    },
  },
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/docs/**'],
  },
];

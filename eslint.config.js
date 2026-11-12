import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['**/lib/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      complexity: ['error', 5],
      'max-lines-per-function': ['error', { max: 20, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      'no-magic-numbers': [
        'warn',
        { ignore: [0, 1, -1, 2, 3, 5, 8, 16, 20, 256], ignoreArrayIndexes: true },
      ],
    },
  },
  {
    files: ['tests/**', 'eslint.config.js'],
    rules: { 'no-magic-numbers': 'off', 'max-lines-per-function': 'off' },
  },
];

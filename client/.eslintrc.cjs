// this is for allowing some rules to be disobeyed in local env, but not in pre-commit or CI
const ruleDisabledForLocalEnvErrorOtherwise = process.env.WEBPACK_DEV_SERVER === 'true' ? 0 : 2;

const rootEslintConfig = require('../.eslintrc.cjs');

// Properties here are sorted by importance, not alphabetically, so rule disabled.
/* eslint-disable sort-keys-fix/sort-keys-fix */
module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  extends: ['airbnb', '../.eslintrc.cjs'],
  plugins: ['react', 'react-hooks', 'cypress'],
  env: {
    'cypress/globals': true,
  },
  rules: {
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': [
      2,
      {
        controlComponents: ['input'],
        labelAttributes: ['htmlFor'],
        labelComponents: ['label'],
      },
    ],
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-fragments': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-sort-props': 'warn',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json', './cypress/tsconfig.json'],
      },
      rules: Object.assign(rootEslintConfig.rules, {
        'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
        'react/default-props-match-prop-types': 'off',
        'react/destructuring-assignment': 'off',
        'react/forbid-prop-types': 'off',
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
        'react/no-unused-prop-types': 'off',
        'react/prefer-stateless-function': 'error',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'typescript-sort-keys/interface': ruleDisabledForLocalEnvErrorOtherwise,
        'typescript-sort-keys/string-enum': ruleDisabledForLocalEnvErrorOtherwise,
      }),
    },
  ],
};

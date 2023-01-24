/* eslint-disable import/no-extraneous-dependencies */
const typescriptEslintRecommended = require('@typescript-eslint/eslint-plugin/dist/configs/recommended');
const prettier = require('eslint-config-prettier');
/* eslint-enable import/no-extraneous-dependencies */

// this is for allowing some rules to be disobeyed in local env, but not in pre-commit or CI
const ruleDisabledForLocalEnvErrorOtherwise = process.env.WEBPACK_DEV_SERVER === 'true' ? 0 : 2;

// Properties here are sorted by importance, not alphabetically, so rule disabled.
/* eslint-disable sort-keys-fix/sort-keys-fix */
module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  extends: ['airbnb', 'prettier'],
  plugins: [
    'react',
    'cypress',
    'chai-friendly',
    'react-hooks',
    'typescript-sort-keys',
    'sort-imports-es6-autofix',
    'sort-keys-fix',
  ],
  env: {
    browser: true,
    'cypress/globals': true,
    es6: true,
    jest: true,
  },
  globals: {
    NodeJS: 'readonly',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['src', '.'],
      },
    },
  },
  rules: {
    'arrow-body-style': 'off',
    'brace-style': 'error',
    camelcase: 'off',
    'chai-friendly/no-unused-expressions': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    curly: ['error', 'all'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', 'index', 'sibling', 'parent'],
        'newlines-between': 'always',
      },
    ],
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
    'no-console': ruleDisabledForLocalEnvErrorOtherwise,
    'no-debugger': ruleDisabledForLocalEnvErrorOtherwise,
    'no-restricted-syntax': [
      'error',
      {
        selector:
          ':matches(ImportNamespaceSpecifier, ExportAllDeclaration, ExportNamespaceSpecifier)',
        message: 'Import/export only modules you need',
      },
    ],
    'no-underscore-dangle': 'off',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'no-only-tests/no-only-tests': 'error',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-fragments': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-sort-props': 'warn',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react-hooks/exhaustive-deps': 'error',
    'sort-imports-es6-autofix/sort-imports-es6': ruleDisabledForLocalEnvErrorOtherwise,
    'sort-keys-fix/sort-keys-fix': ruleDisabledForLocalEnvErrorOtherwise,
    'sort-vars': ruleDisabledForLocalEnvErrorOtherwise,
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json', './cypress/tsconfig.json'],
      },
      plugins: ['@typescript-eslint', 'prettier', 'no-only-tests'],
      rules: Object.assign(typescriptEslintRecommended.rules, prettier.rules, {
        '@typescript-eslint/ban-ts-comment': [
          'warn',
          {
            minimumDescriptionLength: 10,
            'ts-expect-error': 'allow-with-description',
          },
        ],
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/explicit-module-boundary-types': ['error'],
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/class-name-casing': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            selector: 'variableLike',
          },
          { format: ['PascalCase'], selector: 'class' },
          { format: ['PascalCase'], selector: 'interface' },
          {
            format: ['camelCase', 'PascalCase', 'snake_case'],
            leadingUnderscore: 'allow',
            selector: 'parameter',
          },
          { format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'], selector: 'property' },
          { format: ['camelCase', 'PascalCase', 'snake_case'], selector: 'typeAlias' },
          {
            format: ['camelCase', 'PascalCase'],
            leadingUnderscore: 'allow',
            prefix: ['is', 'can', 'has', 'should', 'are', 'was', 'show', 'hide'],
            selector: 'variable',
            types: ['boolean'],
          },
          {
            format: ['camelCase', 'PascalCase'],
            leadingUnderscore: 'allow',
            prefix: ['is', 'can', 'has', 'should', 'are', 'was', 'show', 'hide'],
            selector: 'parameter',
            types: ['boolean'],
          },
        ],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { vars: 'all', args: 'none', ignoreRestSiblings: true },
        ],
        '@typescript-eslint/no-use-before-define': ['error'],
        'consistent-return': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['**/*.test.ts', '**/*.test.tsx', '**/*stories.tsx'] },
        ],
        'import/prefer-default-export': 'off',
        'import/no-relative-packages': 'off',
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

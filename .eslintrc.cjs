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
  extends: ['airbnb/base', 'prettier'],
  plugins: ['chai-friendly', 'sort-keys-fix', 'typescript-sort-keys', 'jest', 'import'],
  env: {
    browser: true,
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
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [['builtin', 'external'], 'internal', 'index', 'sibling', 'parent'],
        'newlines-between': 'always',
      },
    ],
    'no-console': ruleDisabledForLocalEnvErrorOtherwise,
    'no-debugger': ruleDisabledForLocalEnvErrorOtherwise,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
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
    'jest/no-disabled-tests': 'error',
    'no-only-tests/no-only-tests': 'error',
    'no-multiple-empty-lines': 'error',
    'sort-keys-fix/sort-keys-fix': ruleDisabledForLocalEnvErrorOtherwise,
    'sort-vars': ruleDisabledForLocalEnvErrorOtherwise,
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
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
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            prefix: ['IS_', 'is', 'can', 'does', 'did', 'has', 'should', 'are', 'was', 'show', 'hide'],
            selector: 'variable',
            types: ['boolean'],
          },
          {
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            prefix: ['IS_', 'is', 'can', 'does', 'did', 'has', 'should', 'are', 'was', 'show', 'hide'],
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
          {
            vars: 'all',
            args: 'none',
            ignoreRestSiblings: true,
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-use-before-define': ['error'],
        'consistent-return': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              '**/*.test.ts',
              '**/*.test.tsx',
              'helpers/**/*',
              'tasks/**/*',
              'test/**/*',
              'deploy/**/*',
              'deploy-l1/**/*',
            ],
          },
        ],
        'import/prefer-default-export': 'off',
        'import/no-relative-packages': 'off',
        'typescript-sort-keys/interface': ruleDisabledForLocalEnvErrorOtherwise,
        'typescript-sort-keys/string-enum': ruleDisabledForLocalEnvErrorOtherwise,
      }),
    },
  ],
};

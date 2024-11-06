// Properties here are sorted by importance, not alphabetically, so rule disabled.
/* eslint-disable sort-keys-fix/sort-keys-fix */
module.exports = {
  root: true,
  extends: ['../.eslintrc.cjs'],
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  ],
};

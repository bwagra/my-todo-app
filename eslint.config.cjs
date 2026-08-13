const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  { ignores: ['node_modules/**'] },
  {
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    extends: ['next', 'next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
    rules: {}
  }
];

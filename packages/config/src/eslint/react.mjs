import baseConfig from './base.mjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  ...baseConfig,

  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
      },
    },
    rules: {
      // Logic/bug-catching rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Remove JSX formatting rules that fight Prettier
      // 'react/jsx-wrap-multilines': ['error', { prop: 'parens-new-line' }],
      // 'react/jsx-curly-newline': ['error', { multiline: 'require', singleline: 'forbid' }],

      // Single source of formatting truth via Prettier
      'prettier/prettier': 'error',
    },
    settings: { react: { version: 'detect' } },
  },
];

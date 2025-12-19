import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      "no-empty-pattern": "warn",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": [
        "warn",
        {
          "allowInterfaces": "always"
        }
      ],
      // Let Prettier own formatting — turn off ESLint stylistic rules that can conflict
      quotes: 'off',
      'no-multiple-empty-lines': 'off',
      'no-trailing-spaces': 'off',
      'object-shorthand': 'off',
      'prefer-template': 'off',

      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ],

      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],

      // your non-formatting rules (keep these)
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Run Prettier via ESLint (single source of truth)
      'prettier/prettier': 'error'
    }
  },
  {
    files: [
      '**/*.config.{js,mjs,ts}',
      '**/vite.config.{js,ts}',
      '**/eslint.config.{js,mjs}',
      '**/tsup.config.{js,ts}',
      '**/vitest.config.{js,ts}',
      '**/rollup.config.{js,ts}'
    ],
    rules: {
      'import/no-default-export': 'off'
    }
  },
  {
    files: [
      '**/*.test.{js,ts,tsx}',
      '**/*.spec.{js,ts,tsx}',
      '**/test-*.{js,ts}',
      '**/debug-*.{js,ts}',
      '**/puppeteer-*.{js,ts}',
      '**/tests/**/*.{js,ts}',
      '**/puppeteer/**/*.{js,ts}',
      '**/*puppeteer*.{js,ts}'
    ],
    rules: {
      'no-console': 'off'
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.config.js',
      '*.config.ts',
      'coverage/',
      'build/',
      '.next/'
    ]
  },
  // Must be last: turns off rules known to conflict with Prettier
  eslintConfigPrettier,
];

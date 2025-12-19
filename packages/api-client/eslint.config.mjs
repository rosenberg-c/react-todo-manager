import reactConfig from '@repo-pak/config/src/eslint/react.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['eslint.config.mjs', '**/*.config.*', '**/dist/**'],
  },

  ...reactConfig,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
        project: ['./tsconfig.eslint.json'],
      },
    },
  }
];

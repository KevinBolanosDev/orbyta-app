// Config de ESLint para el cliente Expo (React Native + web).
// La consume: apps/client (que le suma las reglas FSD).
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

import { baseConfig } from './base.js';

const reactTypeChecked = eslintReact.configs['recommended-type-checked'];

/**
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function reactNativeConfig(options) {
  return [
    ...baseConfig(options),
    {
      ...reactTypeChecked,
      name: 'gravyx/react-native',
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        ...reactTypeChecked.languageOptions,
        globals: { ...globals.browser },
        parserOptions: { projectService: true, tsconfigRootDir: options.tsconfigRootDir },
      },
    },
    {
      ...reactHooks.configs.flat['recommended-latest'],
      name: 'gravyx/react-hooks',
      files: ['**/*.{ts,tsx}'],
    },
  ];
}

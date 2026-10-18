// Config de ESLint para paquetes puros: sin UI, sin framework y sin I/O.
// La consumen: packages/contracts, packages/finance y packages/utils.
import globals from 'globals';

import { baseConfig } from './base.js';

/**
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function libraryConfig(options) {
  return [
    ...baseConfig(options),
    {
      name: 'gravyx/library',
      files: ['src/**/*.ts'],
      ignores: ['src/**/*.test.ts'],
      languageOptions: { globals: { ...globals['shared-node-browser'] } },
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react', 'react-*', 'expo', 'expo-*', '@expo/*', '@nestjs/*', 'node:*'],
                message: 'Pure packages cannot depend on UI frameworks, NestJS or Node APIs.',
              },
            ],
          },
        ],
      },
    },
  ];
}

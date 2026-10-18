// Config de ESLint para el API NestJS.
// La consume: apps/api.
import globals from 'globals';

import { baseConfig } from './base.js';

/**
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function nestConfig(options) {
  return [
    ...baseConfig(options),
    {
      name: 'gravyx/nest',
      files: ['**/*.ts'],
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: {
          // Conserva imports de valor que solo se usan como tokens de DI o metadata de decoradores.
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
        },
      },
      rules: {
        // Los módulos de Nest son clases que solo llevan un decorador.
        '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
        // Un import solo de tipo borraría la referencia en tiempo de ejecución que necesita la DI de Nest.
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
  ];
}

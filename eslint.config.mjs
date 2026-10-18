// Config de ESLint solo para los archivos sueltos de la raíz: no pertenecen a ningún workspace con
// su propio eslint.config, así que no están cubiertos por `turbo run lint`. Cada workspace
// (apps/*, packages/*) sigue usando su propia config; ésta no los toca.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';

export default [
  globalIgnores(['apps/**', 'packages/**', 'node_modules/**', '.turbo/**', '.husky/_/**']),
  js.configs.recommended,
  {
    files: ['*.{js,mjs,cjs}', 'tools/**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Herramienta de línea de comandos: imprimir resultados es su propósito, no un descuido.
    files: ['tools/**/*.{js,mjs,cjs}'],
    rules: { 'no-console': 'off' },
  },
  prettier,
];

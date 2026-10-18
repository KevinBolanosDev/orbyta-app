// Config base de ESLint (flat config) que comparten todos los workspaces de TypeScript.
// La consumen: eslint/library.js, eslint/react-native.js, eslint/nest.js y packages/config.
import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const ignores = globalIgnores([
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.turbo/**',
  '**/.expo/**',
  '**/android/**',
  '**/ios/**',
  '**/*.d.ts',
]);

/**
 * @param {{ tsconfigRootDir: string }} options Carpeta del workspace dueño de la config.
 * @returns {import('eslint').Linter.Config[]}
 */
export function baseConfig({ tsconfigRootDir }) {
  return [
    ignores,
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      name: 'gravyx/base/typescript',
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: { 'import-x': importX },
      settings: {
        'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
        // Lo lee eslint-plugin-boundaries (a través de eslint-module-utils).
        'import/resolver': { typescript: { alwaysTryTypes: true } },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        'import-x/no-duplicates': 'error',
        'import-x/no-self-import': 'error',
        'import-x/no-useless-path-segments': 'error',
        'import-x/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            pathGroups: [
              { pattern: '@repo/**', group: 'internal', position: 'before' },
              { pattern: '@/**', group: 'internal' },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        eqeqeq: ['error', 'always'],
        'no-console': ['error', { allow: ['warn', 'error'] }],
      },
    },
    {
      name: 'gravyx/base/plain-js',
      files: ['**/*.{js,mjs,cjs}'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      name: 'gravyx/base/node-config-files',
      files: ['**/*.{js,mjs,cjs}', '**/*.config.ts'],
      languageOptions: { globals: { ...globals.node } },
    },
    {
      name: 'gravyx/base/tests',
      files: ['**/*.{test,spec}.{ts,tsx}', '**/*.e2e-spec.ts', '**/test/**', '**/__tests__/**'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
    prettier,
  ];
}

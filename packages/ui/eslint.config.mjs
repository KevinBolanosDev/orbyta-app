import { reactNativeConfig } from '@repo/config/eslint/react-native';

// @repo/ui es React Native puro (ADR 0019). Solo puede depender de @repo/utils (plan §4.1): nada de
// negocio, datos ni textos; los textos llegan por props desde @repo/i18n en el cliente.
export default [
  ...reactNativeConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    name: 'gravyx/ui/no-business',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@repo/contracts', '@repo/finance', '@repo/i18n', '@repo/i18n/*'],
              message: '@repo/ui has no business logic or texts: receive them through props.',
            },
          ],
        },
      ],
    },
  },
  {
    // Archivos de config en CommonJS: se permite require().
    name: 'gravyx/ui/config-files',
    files: ['*.config.{js,mjs,ts}', 'babel.config.js', 'jest.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

import boundaries from 'eslint-plugin-boundaries';

import { reactNativeConfig } from '@repo/config/eslint/react-native';

// Reglas de Feature-Sliced Design (plan §4.2, ADR 0009).
// Capas, de arriba hacia abajo. `app` (rutas de Expo Router) y `application` son juntas la capa app de FSD.
const LAYERS = ['app', 'application', 'pages', 'widgets', 'features', 'entities', 'shared'];

// Módulos de negocio que se usan como grupos de slices en pages/ y features/ (plan §4.2).
const MODULE_GROUPS = '@(expenses|stocks|wealth|agenda|habits)';

const PUBLIC_API = 'index.{ts,tsx}';

/** Capas estrictamente debajo de `layer`. */
const below = (layer) => LAYERS.slice(LAYERS.indexOf(layer) + 1);

export default [
  ...reactNativeConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    name: 'gravyx/client/fsd',
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'application', pattern: 'src/application' },
        {
          type: 'pages',
          pattern: `src/pages/${MODULE_GROUPS}/*`,
          capture: ['group', 'slice'],
        },
        { type: 'pages', pattern: 'src/pages/*', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
        {
          type: 'features',
          pattern: `src/features/${MODULE_GROUPS}/*`,
          capture: ['group', 'slice'],
        },
        { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
      ],
    },
    rules: {
      // Todo archivo dentro de src/ debe pertenecer a una capa.
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // Los paquetes de node_modules y del monorepo (@repo/*) no son capas FSD.
            { allow: { to: { module: { origin: ['external', 'core'] } } } },
            { allow: { to: { element: { isIgnored: true } } } },
            // Los archivos del mismo slice o segmento se importan entre sí libremente.
            { allow: { dependency: { relationship: { to: 'internal' } } } },
            // Una capa importa capas estrictamente inferiores, solo por su API pública (index.ts).
            ...LAYERS.filter((layer) => below(layer).length > 0).map((layer) => ({
              from: { element: { type: layer } },
              allow: { to: { element: { types: below(layer), fileInternalPath: PUBLIC_API } } },
            })),
            // Las dos mitades de la capa app: las rutas pueden usar application/ (providers, init).
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { type: 'application', fileInternalPath: PUBLIC_API } } },
            },
            // shared no tiene slices: sus segmentos se usan entre sí por su API pública.
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared', fileInternalPath: PUBLIC_API } } },
            },
            // Referencias entre entidades solo con la notación oficial @x (plan §4.2, regla 3).
            {
              from: { element: { type: 'entities' } },
              allow: {
                to: {
                  element: {
                    type: 'entities',
                    fileInternalPath: '@x/{{from.element.captured.slice}}.{ts,tsx}',
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
  {
    // @repo/ui y @repo/i18n se consumen solo a través de shared/ (plan §4.2, regla 6).
    name: 'gravyx/client/repo-packages-through-shared',
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@repo/ui', '@repo/ui/*', '@repo/i18n', '@repo/i18n/*'],
              message: 'Import it from @/shared instead.',
            },
          ],
        },
      ],
    },
  },
  {
    // Archivos de config en CommonJS: se permite require().
    name: 'gravyx/client/config-files',
    // Con prefijo `**/` porque lint-staged lanza ESLint desde la raíz del repo con `--config`.
    files: ['**/*.config.{js,mjs,ts}', '**/jest.resolver.js', '**/workspace-singletons.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

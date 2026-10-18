// Corre en `git commit` (ADR 0007). ESLint 10 (flat config) busca su eslint.config a partir del
// directorio actual del proceso, no del directorio del archivo que revisa; como este hook corre
// desde la raíz del repo, cada grupo apunta explícitamente a la config de su workspace con
// `--config`, para no depender de dónde se ejecute.
const eslintWith = (configPath) => (files) =>
  `eslint --fix --no-warn-ignored --config ${configPath} ${files.join(' ')}`;

export default {
  'apps/api/**/*.{js,mjs,cjs,ts}': [eslintWith('apps/api/eslint.config.js'), 'prettier --write'],
  'apps/client/**/*.{js,mjs,cjs,ts,tsx}': [
    eslintWith('apps/client/eslint.config.mjs'),
    'prettier --write',
  ],
  'packages/config/**/*.{js,mjs,cjs}': [
    eslintWith('packages/config/eslint.config.js'),
    'prettier --write',
  ],
  'packages/contracts/**/*.{js,mjs,ts}': [
    eslintWith('packages/contracts/eslint.config.js'),
    'prettier --write',
  ],
  'packages/finance/**/*.{js,mjs,ts}': [
    eslintWith('packages/finance/eslint.config.js'),
    'prettier --write',
  ],
  'packages/i18n/**/*.{js,mjs,ts}': [
    eslintWith('packages/i18n/eslint.config.js'),
    'prettier --write',
  ],
  'packages/ui/**/*.{js,mjs,cjs,ts,tsx}': [
    eslintWith('packages/ui/eslint.config.mjs'),
    'prettier --write',
  ],
  'packages/utils/**/*.{js,mjs,ts}': [
    eslintWith('packages/utils/eslint.config.js'),
    'prettier --write',
  ],
  'tools/**/*.{js,mjs,cjs}': [eslintWith('eslint.config.mjs'), 'prettier --write'],
  '*.{js,mjs,cjs}': [eslintWith('eslint.config.mjs'), 'prettier --write'],
  '*.{json,md,yml,yaml,css}': 'prettier --write',
  'apps/ml/**/*.py': (files) => [
    `uv --directory apps/ml run --frozen ruff format ${files.join(' ')}`,
    `uv --directory apps/ml run --frozen ruff check --fix ${files.join(' ')}`,
  ],
};

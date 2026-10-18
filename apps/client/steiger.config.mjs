// Steiger: linter oficial de estructura FSD (plan §4.2, ADR 0009). Las reglas de imports entre capas
// están en eslint.config.mjs.
import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Los slices nuevos empiezan con un solo consumidor mientras avanza una fase (ej. una página
    // por feature en F4). El aviso queda visible sin bloquear el CI.
    rules: { 'fsd/insignificant-slice': 'warn' },
  },
]);

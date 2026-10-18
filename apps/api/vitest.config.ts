import { defineConfig } from 'vitest/config';

// Dos proyectos para que la cobertura sume las pruebas unitarias (src/) y las e2e HTTP (test/).
export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      { extends: true, test: { name: 'unit', include: ['src/**/*.spec.ts'] } },
      { extends: true, test: { name: 'e2e', include: ['test/**/*.e2e-spec.ts'] } },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/**/index.ts'],
      reporter: ['text', 'html', 'lcov'],
      // Las ramas quedan más bajas: emitDecoratorMetadata agrega `typeof X === 'undefined' ? Object : X`
      // a cada constructor inyectado, y esas ramas nunca se ejecutan (ADR 0008).
      thresholds: { lines: 90, branches: 70, functions: 90, statements: 90 },
    },
  },
});

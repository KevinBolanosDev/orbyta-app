// Valores por defecto de Vitest. Es un objeto plano para que este paquete no dependa de Vitest.
// Lo consumen: los vitest.config.ts de packages/contracts, packages/finance y packages/utils.

/**
 * @param {{ coverageThreshold?: number }} [options] % mínimo de líneas, ramas, funciones y sentencias.
 */
export function vitestDefaults({ coverageThreshold = 80 } = {}) {
  return {
    test: {
      include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
      environment: 'node',
      passWithNoTests: false,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.{test,spec}.ts', 'src/**/index.ts', 'src/**/*.d.ts'],
        reporter: ['text', 'html', 'lcov'],
        thresholds: {
          lines: coverageThreshold,
          branches: coverageThreshold,
          functions: coverageThreshold,
          statements: coverageThreshold,
        },
      },
    },
  };
}

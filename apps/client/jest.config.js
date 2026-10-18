/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Variante pnpm de https://docs.expo.dev/develop/unit-testing/ más standard-navigation
  // (dependencia ESM de expo-router 58 que la doc aún no lista) y uuid (solo ESM).
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation|uuid))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // En frío, la transformación de Babel en Windows/CI puede pasar los 5 s por defecto de Jest.
  testTimeout: 30_000,
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**', '!src/**/index.ts'],
  coverageThreshold: {
    global: { lines: 80, branches: 80, functions: 80, statements: 80 },
  },
};

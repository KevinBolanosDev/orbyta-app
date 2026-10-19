/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Variante pnpm de https://docs.expo.dev/develop/unit-testing/ más standard-navigation
  // (dependencia ESM de expo-router 58 que la doc aún no lista) y uuid (solo ESM).
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation|d3-[a-z-]+|internmap|uuid))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Lucide publica sus íconos en ESM (.mjs) para React Native; en Jest se usa su versión CommonJS.
    '^lucide-react-native/icons/(.*)$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/icons/$1.js',
  },
  // Copia única de módulos nativos + resolvers de Reanimated y React Native (ADR 0019).
  resolver: '<rootDir>/jest.resolver.js',
  // Mocks de gesture-handler (hoja inferior de @repo/ui), Unistyles y AsyncStorage (no existen
  // módulos nativos en Jest).
  setupFiles: ['react-native-gesture-handler/jestSetup', '<rootDir>/jest.setup.ts'],
  // En frío, la transformación de Babel en Windows/CI puede pasar los 5 s por defecto de Jest.
  testTimeout: 30_000,
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**', '!src/**/index.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { lines: 80, branches: 80, functions: 80, statements: 80 },
  },
};

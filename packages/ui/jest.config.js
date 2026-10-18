/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Igual que en apps/client: pnpm guarda todo en node_modules/.pnpm y hay que transformar los
  // paquetes de React Native, Expo, Unistyles y las fuentes (ADR 0008, ADR 0019).
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-native-svg|standard-navigation))',
  ],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // En frío, la transformación de Babel en Windows/CI puede pasar los 5 s por defecto de Jest.
  testTimeout: 30_000,
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts', '!src/theme/unistyles.ts'],
  coverageThreshold: {
    global: { lines: 80, branches: 80, functions: 80, statements: 80 },
  },
};

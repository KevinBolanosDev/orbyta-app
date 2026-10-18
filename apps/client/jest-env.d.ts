// Tipos de archivos de prueba que sus paquetes no declaran. Lo usa: jest.setup.ts.
declare module '@react-native-async-storage/async-storage/jest/async-storage-mock' {
  import type AsyncStorage from '@react-native-async-storage/async-storage';

  const mock: typeof AsyncStorage;
  export default mock;
}

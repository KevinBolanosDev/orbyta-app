// Corre antes de cada archivo de prueba del cliente.
// 1. Mocks oficiales de Unistyles (no existe el módulo nativo Nitro en Jest). Los temas reales se
//    registran solos al importar @repo/ui (src/theme/configure.ts).
// 2. Mock oficial de AsyncStorage, en memoria.
// 3. Reanimated en modo de pruebas (animaciones en JS con los temporizadores de Jest).
// 4. gesture-handler (sus mocks oficiales van en `setupFiles`): al cargar pide a worklets el
//    runtime de UI, que en Jest no existe y lanza "getUIRuntimeHolder is not supported". Se le
//    devuelve vacío (igual que en @repo/ui).
// 5. `useIsFocused` de expo-router: las páginas se prueban también sueltas, sin navegador (donde el
//    hook real lanza). En las pruebas la pantalla siempre está enfocada.
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { setUpTests } from 'react-native-reanimated';
import 'react-native-unistyles/mocks';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-native-worklets'),
  getUIRuntimeHolder: () => undefined,
}));

jest.mock('expo-router', () => ({
  ...jest.requireActual<Record<string, unknown>>('expo-router'),
  useIsFocused: () => true,
}));

setUpTests();

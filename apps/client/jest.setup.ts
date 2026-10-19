// Corre antes de cada archivo de prueba del cliente.
// 1. Mocks oficiales de Unistyles (no existe el módulo nativo Nitro en Jest). Los temas reales se
//    registran solos al importar @repo/ui (src/theme/configure.ts).
// 2. Mock oficial de AsyncStorage, en memoria.
// 3. Reanimated en modo de pruebas (animaciones en JS con los temporizadores de Jest).
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { setUpTests } from 'react-native-reanimated';
import 'react-native-unistyles/mocks';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

setUpTests();

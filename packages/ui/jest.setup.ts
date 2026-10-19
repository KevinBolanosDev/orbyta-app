// Corre antes de cada archivo de prueba de @repo/ui.
// 1. Mocks oficiales de Unistyles: en Jest no existe el módulo nativo (Nitro).
// 2. Registra los temas reales en el mock, para que `StyleSheet.create` reciba el tema claro.
// 3. Reanimated en modo de pruebas (animaciones en JS con los temporizadores de Jest).
// 4. gesture-handler (sus mocks oficiales van en `setupFiles`): al cargar pide a worklets el
//    runtime de UI, que en Jest no existe y lanza "getUIRuntimeHolder is not supported". Se le
//    devuelve vacío.
import 'react-native-unistyles/mocks';
import { setUpTests } from 'react-native-reanimated';

import './src/theme/configure';

setUpTests();

jest.mock('react-native-worklets', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-native-worklets'),
  getUIRuntimeHolder: () => undefined,
}));

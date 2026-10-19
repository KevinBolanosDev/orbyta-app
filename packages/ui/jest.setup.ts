// Corre antes de cada archivo de prueba de @repo/ui.
// 1. Mocks oficiales de Unistyles: en Jest no existe el módulo nativo (Nitro).
// 2. Registra los temas reales en el mock, para que `StyleSheet.create` reciba el tema claro.
// 3. Reanimated en modo de pruebas (animaciones en JS con los temporizadores de Jest).
import 'react-native-unistyles/mocks';
import { setUpTests } from 'react-native-reanimated';

import './src/theme/configure';

setUpTests();

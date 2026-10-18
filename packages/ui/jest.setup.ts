// Corre antes de cada archivo de prueba de @repo/ui.
// 1. Mocks oficiales de Unistyles: en Jest no existe el módulo nativo (Nitro).
// 2. Registra los temas reales en el mock, para que `StyleSheet.create` reciba el tema claro.
import 'react-native-unistyles/mocks';
import './src/theme/configure';

import type { AppBreakpoints, AppThemes } from '@repo/ui/theme';

// Tipos de Unistyles para el código del cliente: `theme` y breakpoints de Cristal Aurora en cada
// StyleSheet.create. @repo/ui hace lo mismo con su propia copia de los tipos (ADR 0019).
declare module 'react-native-unistyles' {
  // Patrón de aumentación de Unistyles: la interfaz vacía hereda los tipos de la app.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

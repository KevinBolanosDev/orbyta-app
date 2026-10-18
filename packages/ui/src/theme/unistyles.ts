import type { breakpoints } from '../tokens';

import type { themes } from './themes';

// Tipos de Unistyles: `theme` y los breakpoints de cada StyleSheet.create quedan tipados con los de
// Cristal Aurora. El cliente repite esta aumentación para su propia copia (ADR 0019).

export type AppThemes = typeof themes;
export type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  // Patrón de aumentación de Unistyles: la interfaz vacía hereda los tipos de la app.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

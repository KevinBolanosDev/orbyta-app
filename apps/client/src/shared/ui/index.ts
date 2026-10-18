// shared/ui — API pública. Único punto de entrada de @repo/ui en la app (plan §4.2, regla 6):
// re-exporta el design system (tokens, temas, Text…) y suma lo que depende de la app: preferencia de
// tema guardada, carga de fuentes y barras del sistema.
// Lo consumen: application/ (arranque), todas las páginas, widgets, features y entidades.
// Al importarlo se registran los temas en Unistyles (primer import de @repo/ui).
export * from '@repo/ui';

// Componentes provisionales de F0. TODO(F1.4): reemplazarlos por Card, Button y TextField de @repo/ui.
export { Body, Card, Field, Screen, Title } from './primitives';
export { ThemeSystemBars } from './theme-system-bars';
export {
  getThemePreference,
  restoreThemePreference,
  setThemePreference,
  THEME_PREFERENCE_KEY,
  useThemePreference,
} from './theme-preference';
export { useAppFonts } from './use-app-fonts';

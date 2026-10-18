// @repo/ui/theme — temas de Unistyles, preferencia de tema y fuentes. No importa componentes.
// Lo consume: el cliente a través de src/shared/ui (configuración inicial, preferencia persistida y
// carga de fuentes antes de ocultar la splash).
import './configure';

export { fontAssets } from './fonts';
export {
  applyThemePreference,
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  THEME_PREFERENCES,
  type ThemePreference,
} from './preference';
export {
  createTheme,
  darkTheme,
  lightTheme,
  themes,
  type AppTheme,
  type ThemeName,
} from './themes';
export type { AppBreakpoints, AppThemes } from './unistyles';

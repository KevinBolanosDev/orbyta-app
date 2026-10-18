import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from '../tokens';

import { themes } from './themes';

// Registra temas y breakpoints en Unistyles. Es el primer import de @repo/ui (y de @repo/ui/theme),
// así corre antes de cualquier StyleSheet.create, como exige Unistyles (ADR 0012).
// Arranca siguiendo al sistema; la preferencia guardada se aplica después con applyThemePreference.
StyleSheet.configure({
  themes,
  breakpoints,
  settings: { adaptiveThemes: true },
});

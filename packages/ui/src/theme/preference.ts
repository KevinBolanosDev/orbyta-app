import { UnistylesRuntime } from 'react-native-unistyles';

// Preferencia de tema del usuario: seguir al sistema o fijar claro u oscuro (plan §5, "Tema").
// Dónde se guarda lo decide la app; aquí solo se valida y se aplica a Unistyles.

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/**
 * Aplica la preferencia sin re-renderizar el árbol: "system" activa los temas adaptativos; claro u
 * oscuro los apaga y fija el tema. En web, Unistyles cambia la clase `light`/`dark` de `<html>`.
 */
export function applyThemePreference(preference: ThemePreference): void {
  if (preference === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
    return;
  }
  // El orden importa: Unistyles no deja fijar un tema mientras los adaptativos estén activos.
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(preference);
}

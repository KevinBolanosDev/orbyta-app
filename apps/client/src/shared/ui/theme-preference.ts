import { useSyncExternalStore } from 'react';

import {
  applyThemePreference,
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  type ThemePreference,
} from '@repo/ui/theme';

import { preferencesStorage } from '@/shared/lib';

/** Clave de la preferencia. public/index.html la lee antes de cargar el JS (sin parpadeo). */
export const THEME_PREFERENCE_KEY = 'gravyx.theme';

// Estado global pequeño: la preferencia vive aquí y la aplica Unistyles sin re-renderizar el árbol.
// Los componentes que muestran la opción elegida se suscriben con useThemePreference.
let current: ThemePreference = DEFAULT_THEME_PREFERENCE;
const listeners = new Set<() => void>();

function commit(preference: ThemePreference): void {
  current = preference;
  applyThemePreference(preference);
  for (const listener of listeners) listener();
}

/** Lee la preferencia guardada y la aplica. Se llama una vez al arrancar, con la splash visible. */
export async function restoreThemePreference(): Promise<ThemePreference> {
  let stored: string | null = null;
  try {
    stored = await preferencesStorage.get(THEME_PREFERENCE_KEY);
  } catch {
    // Sin almacenamiento disponible se sigue al sistema; no es un error para el usuario.
  }
  commit(isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE);
  return current;
}

/** Cambia la preferencia, la aplica al instante y la guarda. */
export function setThemePreference(preference: ThemePreference): void {
  commit(preference);
  // Si no se puede guardar, la preferencia igual queda activa en esta sesión.
  preferencesStorage.set(THEME_PREFERENCE_KEY, preference).catch(() => undefined);
}

export function getThemePreference(): ThemePreference {
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Preferencia actual y la función para cambiarla (barra del catálogo; en F2, GLB-10 Apariencia). */
export function useThemePreference(): readonly [ThemePreference, (next: ThemePreference) => void] {
  const preference = useSyncExternalStore(subscribe, getThemePreference, getThemePreference);
  return [preference, setThemePreference] as const;
}

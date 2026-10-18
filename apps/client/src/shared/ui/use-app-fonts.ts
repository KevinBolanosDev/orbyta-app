import { useFonts } from 'expo-font';

import { fontAssets } from '@repo/ui/theme';

/**
 * `true` cuando las fuentes del design system están cargadas. Si alguna falla también devuelve
 * `true`: la app sigue con las fuentes del sistema en lugar de quedarse en la splash.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(fontAssets);
  return loaded || error !== null;
}

import { useEffect, useState } from 'react';

import { restoreThemePreference, useAppFonts } from '@/shared/ui';

/**
 * `true` cuando la app puede pintarse sin saltos: fuentes cargadas y preferencia de tema aplicada.
 * Mientras tanto la splash nativa sigue visible (en web, el fondo de public/index.html).
 */
export function useAppReady(): boolean {
  const fontsReady = useAppFonts();
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    let active = true;
    void restoreThemePreference().then(() => {
      if (active) setThemeReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return fontsReady && themeReady;
}

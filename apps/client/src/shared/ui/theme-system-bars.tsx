import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

/**
 * Sigue al tema activo: barra de estado clara u oscura y fondo de la vista raíz en `color.bg`
 * (evita destellos blancos detrás de las pantallas al navegar; en web pinta `<html>`).
 */
export function ThemeSystemBars() {
  const { theme } = useUnistyles();
  const background = theme.colors.bg;

  useEffect(() => {
    UnistylesRuntime.setRootViewBackgroundColor(background);
  }, [background]);

  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />;
}

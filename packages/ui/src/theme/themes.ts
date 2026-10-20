import { Platform } from 'react-native';

import {
  categoryColors,
  elevation,
  fontFamily,
  glass,
  holoGradient,
  layout,
  moduleColors,
  radius,
  semanticColors,
  space,
  zIndex,
  type ColorScheme,
} from '../tokens';

/**
 * Arma el tema de Unistyles de un esquema a partir de los tokens. Incluye también los tokens que no
 * cambian con el tema (espaciado, radios…) para usarlos como `theme.space[4]` dentro de los estilos.
 * En web, Unistyles convierte cada texto del tema en una variable CSS (`--colors-bg`).
 */
export function createTheme(scheme: ColorScheme, os: string = Platform.OS) {
  const colors = semanticColors[scheme];
  return {
    scheme,
    colors,
    categories: categoryColors[scheme],
    modules: moduleColors(scheme),
    holo: holoGradient,
    // Android: sombras cortas y glow centrado (ver `elevation`).
    elevation: elevation(scheme, colors, os === 'android'),
    glass: glass[scheme],
    font: fontFamily,
    space,
    radius,
    layout,
    z: zIndex,
  } as const;
}

export type AppTheme = ReturnType<typeof createTheme>;

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

/** Temas registrados en Unistyles. El nombre del tema es el esquema. */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;

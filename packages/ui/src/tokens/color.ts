import { withAlpha } from '../lib/color.ts';
import type { LinearGradientToken } from '../lib/gradient.ts';

// Color semántico, de categorías y degradado holográfico (design-system.md §2.1 y §2.2).

export type ColorScheme = 'light' | 'dark';

/** Paleta semántica de un tema. Las claves son `color.<rol>` en camelCase. */
export interface SemanticColors {
  /** Fondo del lienzo. */
  bg: string;
  /** Texto principal. */
  ink: string;
  /** Texto secundario y etiquetas. */
  inkMuted: string;
  /** Deshabilitado y placeholders; nunca texto esencial. */
  inkSubtle: string;
  /** Acción principal, foco, XP y pestaña activa. */
  primary: string;
  /** Texto e íconos sobre `primary`. */
  onPrimary: string;
  /** Enlaces, información y series de gráficos. */
  secondary: string;
  /** Nivel, logros y rareza. En oscuro no sirve como texto pequeño sobre tarjeta (4,2:1). */
  accent: string;
  /** Variación positiva y presupuesto sano. */
  gain: string;
  /** Variación negativa, exceso y error. */
  loss: string;
  /** Vencimientos próximos y presupuesto al límite. */
  warning: string;
  /** Avisos neutrales (= secondary). */
  info: string;
  /** Anillo de foco (= primary). */
  focus: string;
  /** Sombra luminosa de lo activo. */
  glow: string;
  /** Fondo detrás de hojas y diálogos. */
  scrim: string;
  /** Rejilla HUD del fondo. */
  grid: string;
  /** Orbes de la aurora: primary, accent y secondary con alfa. */
  orb1: string;
  orb2: string;
  orb3: string;
}

const dark = {
  bg: '#060A16',
  ink: '#E8EEFF',
  inkMuted: '#9AA3C2',
  inkSubtle: '#5F6888',
  primary: '#2EE6F2',
  onPrimary: '#04121A',
  secondary: '#4C7DFF',
  accent: '#8B5CFF',
  gain: '#3DF5B0',
  loss: '#FF5C7A',
  warning: '#FFC24A',
};

const light = {
  bg: '#EEF3FB',
  ink: '#0B1530',
  inkMuted: '#4A5677',
  inkSubtle: '#8A93AE',
  primary: '#08787F',
  onPrimary: '#FFFFFF',
  secondary: '#1E5CFF',
  accent: '#7942FF',
  gain: '#06794E',
  loss: '#DB0028',
  warning: '#8A5A00',
};

export const darkColors: SemanticColors = {
  ...dark,
  info: dark.secondary,
  focus: dark.primary,
  glow: 'rgba(46,230,242,0.35)',
  scrim: 'rgba(2,4,10,0.62)',
  grid: 'rgba(46,230,242,0.05)',
  orb1: withAlpha(dark.primary, 0.5),
  orb2: withAlpha(dark.accent, 0.5),
  orb3: withAlpha(dark.secondary, 0.5),
};

export const lightColors: SemanticColors = {
  ...light,
  info: light.secondary,
  focus: light.primary,
  glow: 'rgba(8,120,127,0.30)',
  scrim: 'rgba(11,21,48,0.35)',
  grid: 'rgba(11,21,48,0.05)',
  orb1: withAlpha(light.primary, 0.35),
  orb2: withAlpha(light.accent, 0.35),
  orb3: withAlpha(light.secondary, 0.35),
};

export const semanticColors: Readonly<Record<ColorScheme, SemanticColors>> = {
  dark: darkColors,
  light: lightColors,
};

/**
 * Ocho colores para categorías de gasto, tipos de activo y series, en orden de asignación (§2.2).
 * Los cinco primeros son también los colores de módulo (§11.6).
 */
export const categoryColors: Readonly<Record<ColorScheme, readonly string[]>> = {
  dark: ['#2EE6F2', '#4C7DFF', '#8B5CFF', '#3DF5B0', '#FF8AD8', '#FFC24A', '#FF9F6B', '#A0AEC8'],
  light: ['#08787F', '#1E5CFF', '#7942FF', '#06794E', '#C0287F', '#8A5A00', '#B8501A', '#4A5677'],
};

/** Degradado holográfico, igual en ambos temas (§2.1). Solo LevelBadge, logros, HoloCard y FAB. */
export const holoGradient = {
  angleDeg: 125,
  stops: [
    { color: '#2EE6F2', offset: 0 },
    { color: '#8B5CFF', offset: 0.5 },
    { color: '#4C7DFF', offset: 1 },
  ],
  /** Texto encima del degradado. */
  ink: '#04121A',
} as const satisfies LinearGradientToken & { ink: string };

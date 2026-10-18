// Espaciado, radios, capas, breakpoints e iconografía (design-system.md §2.4, §2.5, §2.7–§2.9).

/** Rejilla de 4 pt (`space.<n>`). */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpaceToken = keyof typeof space;

/** Breakpoints (ancho mínimo en px). Unistyles exige que el primero empiece en 0. */
export const breakpoints = {
  compact: 0,
  medium: 600,
  expanded: 1024,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Medidas de layout que cambian con el breakpoint, más algunas fijas (§2.4 y §6). */
export const layout = {
  screenGutter: { compact: 16, medium: 24, expanded: 32 },
  cardGap: { compact: 12, medium: 16, expanded: 24 },
  cardPadding: { compact: 20, medium: 24, expanded: 28 },
  /** Ancho máximo del contenido en `expanded`. */
  contentMaxWidth: 1200,
  /** Objetivo táctil mínimo y separación entre objetivos (§10). */
  minTouchTarget: 44,
  minTouchGap: 8,
  /** Separación de la tab bar flotante con los bordes. */
  floatingInset: 12,
} as const satisfies Record<string, number | Record<Breakpoint, number>>;

/** Radios del vidrio grueso (`radius.<n>`). */
export const radius = {
  xs: 8,
  s: 12,
  m: 16,
  l: 22,
  /** Radio característico de las tarjetas de vidrio. */
  xl: 28,
  /** Esquinas superiores de hojas inferiores. */
  sheet: 32,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;

/** Capas (`z.<n>`). */
export const zIndex = {
  base: 0,
  sticky: 10,
  tabbar: 20,
  fab: 30,
  sheet: 40,
  dialog: 50,
  toast: 60,
  lock: 100,
} as const;

/** Iconografía de trazo (§2.9). */
export const iconSize = {
  inline: 16,
  list: 20,
  nav: 24,
  empty: 32,
} as const;

export const ICON_STROKE_WIDTH = 2;

/** Por debajo de este tamaño un módulo se pinta con su glifo y no con su ícono de marca (§11.5). */
export const MODULE_ICON_MIN_SIZE = 22;

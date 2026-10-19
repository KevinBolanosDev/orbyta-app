// Medidas y colores de la marca Gravyx Ascenda (design-system.md §11.3–§11.5), en el lienzo de
// 200 × 200 unidades. Son datos del dibujo del logo, no tokens de la UI.

export const MARK_VIEWBOX = '0 0 200 200';
/** La variante animada deja margen para que los íconos no se corten al girar. */
export const ANIMATED_MARK_VIEWBOX = '-18 -18 236 236';

/** Fondos permitidos detrás del logo (§11.4). */
export const BRAND_BACKGROUND = { dark: '#060A16', light: '#EEF3FB' } as const;

export const PLANET = {
  cx: 100,
  cy: 100,
  r: 46,
  /** En la variante con puntos el planeta crece un poco. */
  dotsR: 48,
  gradient: {
    cx: 0.36,
    cy: 0.32,
    r: 0.78,
    stops: [
      { offset: 0, color: '#E8FFFF' },
      { offset: 0.22, color: '#2EE6F2' },
      { offset: 0.62, color: '#4C7DFF' },
      { offset: 1, color: '#3B1F8F' },
    ],
  },
  highlight: { cx: 84, cy: 80, rx: 16, ry: 8, rotate: -30, color: '#FFFFFF', opacity: 0.35 },
} as const;

export const ORBIT_STROKE = {
  width: 5.5,
  /** La órbita completa va detrás del planeta al 45 %. */
  backOpacity: 0.45,
  colors: ['#8B5CFF', '#2EE6F2', '#8B5CFF'],
  /** Extremos horizontales del degradado (la órbita va de x ≈ 12 a 188). */
  x1: 12,
  x2: 188,
} as const;

/** Estela de ascenso: Bézier cúbica del centro del planeta a la estrella, con dos "steps". */
export const TRAIL = {
  p0: { x: 100, y: 100 },
  p1: { x: 112, y: 78 },
  p2: { x: 128, y: 56 },
  p3: { x: 150, y: 40 },
  steps: [
    { x: 116.5, y: 74, r: 2.4 },
    { x: 132.9, y: 54.7, r: 3.4 },
  ],
  width: 2.5,
  color: '#2EE6F2',
  stepColor: '#E8FFFF',
} as const;

/** Estrella de ascenso de 4 puntas en cruz, relativa a su centro. */
export const STAR = {
  x: 150,
  y: 40,
  path: 'M0,-14 Q1.7,-1.7 14,0 Q1.7,1.7 0,14 Q-1.7,1.7 -14,0 Q-1.7,-1.7 0,-14 Z',
  color: '#FFFFFF',
  glowRadius: 20,
  glowColor: '#2EE6F2',
} as const;

/** Destello de arriba a la derecha (M23). */
export const SPARKLE = {
  path: 'M160,14 Q161.2,24.8 172,26 Q161.2,27.2 160,38 Q158.8,27.2 148,26 Q158.8,24.8 160,14 Z',
  cx: 160,
  cy: 26,
  color: '#FFFFFF',
} as const;

/** Variante con puntos: cada ícono pasa a un punto del color del módulo (r 7–8 según profundidad). */
export const ORBIT_DOT = { r: 7.5, depthR: 0.5, borderWidth: 1.5, border: '#FFFFFF' } as const;

/** Monocromo: ancho del corte alrededor de la órbita donde pasa por delante del planeta. */
export const MONO_CUT_WIDTH = 10.5;

/** Ícono de módulo (BR02, §11.5). */
export const MODULE_ICON = {
  orbitPath: 'M54,50.6 L100,24 L165.8,62 L165.8,138 L100,176 L34.2,138 L34.2,86',
  orbitWidth: 9,
  planet: { cx: 100, cy: 100, r: 49, gradient: { cx: 0.38, cy: 0.32, r: 0.75, mid: 0.38 } },
  highlight: { cx: 82, cy: 76, rx: 15, ry: 7, rotate: -30, color: '#FFFFFF', opacity: 0.45 },
  /** Glifo de 24 unidades escalado a 70 y centrado (x = 65). */
  glyph: { viewBox: 24, size: 70, strokeWidth: 2.2, color: '#04121A' },
  dot: {
    cx: 165.8,
    cy: 62,
    r: 12.5,
    borderWidth: 4,
    border: { dark: '#060A16', light: '#FFFFFF' },
  },
} as const;

/** Tamaños mínimos de cada variante del logo, en px (§11.4). */
export const MARK_VARIANT_MIN_SIZE = { animated: 160, icons: 96, dots: 32 } as const;

/** Zona de respeto: el radio del planeta alrededor del logo. */
export const MARK_CLEAR_SPACE = 46;

/** Logotipo horizontal (BR04): proporciones respecto al alto del símbolo. */
export const LOCKUP = {
  /** Alto de las palabras. */
  wordSize: 0.4,
  /** Separación entre el símbolo y las palabras, y entre "GRAVYX" y "Ascenda". */
  gap: 0.25,
  /** Tracking: normal en GRAVYX, amplio en Ascenda (en em). */
  brandTracking: 0.06,
  thinTracking: 0.32,
} as const;

/** El wordmark es dibujo de la marca (no se traduce); el nombre accesible llega de i18n. */
export const WORDMARK = { primary: 'GRAVYX', secondary: 'ASCENDA' } as const;

/** Ícono de la app (§11.8). */
export const APP_ICON = { angleDeg: 160, from: '#141A3A', to: '#060A16', markScale: 0.88 } as const;

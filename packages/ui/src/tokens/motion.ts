// Tokens de movimiento como datos (design-system.md §4.2 y §11.7). Los hooks de F1.2 los traducen
// a Reanimated (ADR 0013); los nombres de las curvas conservan el nombre de GSAP como referencia.

/** Duraciones en ms (`dur.<n>`). */
export const duration = {
  /** Cambio de color y feedback de toque. */
  instant: 100,
  /** Salidas y fundidos. */
  fast: 200,
  /** Presión, pestañas y chips. */
  base: 350,
  /** Entradas de pantalla y hojas. */
  slow: 600,
  /** Conteo de cifras y dibujo de gráficos. */
  showcase: 1200,
} as const;

export type DurationToken = keyof typeof duration;

/** Escalonados en ms. */
export const stagger = {
  /** Filas de lista (máximo `MAX_STAGGERED_ROWS`). */
  list: 50,
  /** Bloques de una pantalla al entrar (M01). */
  screen: 60,
  /** Abanico del menú de acciones rápidas (W04). */
  menu: 40,
} as const;

export const MAX_STAGGERED_ROWS = 8;

/** Lo que sale dura ≈ 70 % de lo que entra (§4.1). */
export const EXIT_DURATION_RATIO = 0.7;

export function exitDuration(enterMs: number): number {
  return Math.round(enterMs * EXIT_DURATION_RATIO);
}

/** Curva cúbica `[x1, y1, x2, y2]` para `Easing.bezier`. */
export type CubicBezier = readonly [number, number, number, number];

export const easing = {
  /** Entradas (`expo.out`). */
  expoOut: [0.16, 1, 0.3, 1],
  /** Cambio de módulo (`expo.inOut`). */
  expoInOut: [0.87, 0, 0.13, 1],
  /** Conteo de cifras (`power2.out`). */
  power2Out: [0.33, 1, 0.68, 1],
  /** Salidas (`power2.in`). */
  power2In: [0.32, 0, 0.67, 0],
  /** Dibujo de líneas (`power2.inOut`). */
  power2InOut: [0.65, 0, 0.35, 1],
  /** Relleno de progreso (`power3.out`). */
  power3Out: [0.25, 1, 0.5, 1],
  /** Reflejo holográfico y orbes (`sine.inOut`). */
  sineInOut: [0.37, 0, 0.63, 1],
} as const satisfies Record<string, CubicBezier>;

export type EasingToken = keyof typeof easing;

export interface SpringToken {
  damping: number;
  stiffness?: number;
}

/** Resortes: los rebotes solo para recompensas; las operaciones financieras usan curvas sobrias. */
export const spring = {
  /** Presión (`back.out(3)`). */
  press: { damping: 12, stiffness: 300 },
  /** Logros (`elastic.out(1, 0.55)`). */
  reward: { damping: 8, stiffness: 180 },
  /** Hoja inferior (M10). */
  sheet: { damping: 20, stiffness: 220 },
  /** Módulo activo (M22). */
  moduleActive: { damping: 14 },
} as const satisfies Record<string, SpringToken>;

/** Tiempos fijos de animaciones concretas (M05–M23), en ms. */
export const timing = {
  /** M05 relleno de progreso. */
  progressFill: 1000,
  /** M06 cambio de módulo (pastilla) y salida del contenido. */
  moduleSwitch: 450,
  moduleSwitchExit: 150,
  /** M07 logro. */
  achievement: 900,
  /** M08 reflejo: duración y pausa en reposo. */
  sheen: 2200,
  sheenIdle: 6000,
  /** M09 deriva de los orbes. */
  orbDrift: 8000,
  /** M13 skeleton. */
  skeleton: 1200,
  /** P23 tiempo en pantalla de un toast, y de uno con acción (deshacer) que da más margen. */
  toast: 4000,
  toastWithAction: 6000,
  /** P37 una vuelta del ícono "sincronizando". */
  syncSpin: 1000,
  /** M17 destello de precio. */
  priceFlash: 600,
  /** X07 "+XP" flotante. */
  xpFloat: 700,
  /** X03 medio latido de la llama cuando la racha está en riesgo (sube y baja en bucle). */
  streakPulse: 1200,
  /** X05 tiempo en pantalla del toast de logro. */
  achievementToast: 5000,
  /** M20 una vuelta de la órbita del logo. */
  orbitTurn: 36_000,
  /** M21 entrada completa del logo (máximo). */
  logoEntrance: 2400,
  /** M23 destello de la estrella. */
  starTwinkle: 3200,
  /** M22 halo del módulo activo. */
  moduleHalo: 300,
  /** Fundido que se mantiene con "reducir movimiento". */
  reducedMotionFade: 150,
} as const;

/** Desplazamientos en px. */
export const distance = {
  /** M01 entrada: los bloques suben desde aquí. */
  enterOffset: 24,
  /** M09 deriva máxima de los orbes. */
  orbDrift: 60,
} as const;

/** M02: escala mientras se presiona (vuelve a 1 con `spring.press`). */
export const PRESSED_SCALE = 0.96;

// Deslizar para acción (M12, ListItem P26) y tirar para actualizar (M16, PullToRefresh P38) como
// funciones puras. Corren en el gesto, en el hilo de UI: llevan la directiva 'worklet'.

/** Distancia a la que la acción queda "armada": el ícono crece y al soltar se ejecuta. */
export const SWIPE_THRESHOLD = 96;
/** Velocidad (px/s) que ejecuta la acción aunque no se llegue al umbral. */
export const SWIPE_VELOCITY = 1200;
/** Más allá del umbral la fila sigue al dedo con resistencia. */
export const SWIPE_RESISTANCE = 0.35;

/**
 * Desplazamiento de la fila para un arrastre horizontal. Solo se mueve hacia donde hay acción
 * (derecha: `leading`, izquierda: `trailing`); pasado el umbral, con resistencia.
 */
export function swipeOffset(
  translationX: number,
  hasLeading: boolean,
  hasTrailing: boolean,
): number {
  'worklet';
  if ((translationX > 0 && !hasLeading) || (translationX < 0 && !hasTrailing)) return 0;
  const distance = Math.abs(translationX);
  const eased =
    distance <= SWIPE_THRESHOLD
      ? distance
      : SWIPE_THRESHOLD + (distance - SWIPE_THRESHOLD) * SWIPE_RESISTANCE;
  return Math.sign(translationX) * eased;
}

/** Qué acción corresponde al soltar: la de la izquierda, la de la derecha o ninguna. */
export function swipeRelease(offset: number, velocityX: number): 'leading' | 'trailing' | 'none' {
  'worklet';
  const armed = Math.abs(offset) >= SWIPE_THRESHOLD;
  const flung = Math.abs(velocityX) >= SWIPE_VELOCITY && Math.sign(velocityX) === Math.sign(offset);
  if (offset === 0 || !(armed || flung)) return 'none';
  return offset > 0 ? 'leading' : 'trailing';
}

/** Distancia que hay que tirar para actualizar. */
export const PULL_THRESHOLD = 72;
/** Lo que se ve de la lista bajada mientras actualiza (alto del anillo con su margen). */
export const PULL_REFRESHING_OFFSET = 56;
/** Resistencia del tirón: la lista baja menos que el dedo. */
export const PULL_RESISTANCE = 0.5;

/** Cuánto baja la lista para un tirón hacia abajo (nada si se arrastra hacia arriba). */
export function pullOffset(translationY: number): number {
  'worklet';
  return translationY > 0 ? translationY * PULL_RESISTANCE : 0;
}

/** Progreso del anillo (0–1) para un desplazamiento de la lista. */
export function pullProgress(offset: number): number {
  'worklet';
  return Math.min(Math.max(offset / PULL_THRESHOLD, 0), 1);
}

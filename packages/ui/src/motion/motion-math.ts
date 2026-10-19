import { glassGeometry, MAX_STAGGERED_ROWS, stagger } from '../tokens';

// Cálculos puros del movimiento: sin React ni Reanimated, para probarlos directamente.
// Los que se usan dentro de estilos animados llevan la directiva 'worklet'.

/** Retraso de la fila `index` en un escalonado; desde la fila 8 todas esperan lo mismo (§4.2). */
export function staggerDelay(index: number, step: number = stagger.screen): number {
  return Math.min(Math.max(index, 0), MAX_STAGGERED_ROWS - 1) * step;
}

/** Limita un progreso a 0–1. */
export function clampProgress(value: number): number {
  'worklet';
  return Math.min(Math.max(value, 0), 1);
}

/**
 * M08: `translateX` de la franja del reflejo para un progreso de 0 a 1. El centro de la franja va
 * de −40 % a 140 % del ancho; con 0,5 queda centrada (la posición estática).
 */
export function sheenTranslateX(progress: number, width: number, stripeWidth: number): number {
  'worklet';
  const { from, to } = glassGeometry.sheen;
  return (from + (to - from) * progress) * width - stripeWidth / 2;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * M09: destino de la deriva de un orbe, hasta ±`max` px en cada eje. Pseudoaleatorio pero estable
 * por `seed` (mulberry32): cada orbe deriva distinto y las pruebas son repetibles.
 */
export function orbDriftTarget(seed: number, max: number): Point {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { x: Math.round((next() * 2 - 1) * max), y: Math.round((next() * 2 - 1) * max) };
}

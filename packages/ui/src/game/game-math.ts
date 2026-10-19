// Geometría y cálculos de movimiento de la gamificación (X01, X06, X07), puros y con pruebas.
// Los que corren en estilos o props animados llevan la directiva 'worklet'.

import { glassGeometry } from '../tokens';

export interface Vec {
  x: number;
  y: number;
}

/** Vértices de un hexágono con punta arriba, inscrito en un cuadrado de `size` con margen `inset`. */
export function hexagonPoints(size: number, inset = 0): Vec[] {
  const center = size / 2;
  const r = Math.max(center - inset, 0);
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  });
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Polígono cerrado con las esquinas redondeadas (radio `r`): cada esquina se corta a `r` de su
 * vértice por ambos lados y se une con una curva cuadrática que pasa cerca del vértice.
 */
export function roundedPolygonPath(points: readonly Vec[], r: number): string {
  const count = points.length;
  if (count < 3) return '';
  const xy = (v: Vec) => `${round(v.x).toString()},${round(v.y).toString()}`;
  const corners = points.map((p, i) => {
    const toward = (q: Vec) => {
      const length = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const t = Math.min(r, length / 2) / length;
      return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
    };
    const prev = points[(i - 1 + count) % count] ?? p;
    const next = points[(i + 1) % count] ?? p;
    return { p, from: toward(prev), to: toward(next) };
  });
  // Arranca al salir de la primera esquina y la cierra al final.
  const [first, ...rest] = corners;
  if (!first) return '';
  const segments = [...rest, first].map(({ p, from, to }) => `L${xy(from)}Q${xy(p)} ${xy(to)}`);
  return `M${xy(first.to)}${segments.join('')}Z`;
}

/**
 * M08 dentro de un SVG (LevelBadge): la franja del reflejo como paralelogramo inclinado −20°. Con
 * `progress` de 0 a 1 su centro va de −40 % a 140 % del ancho, igual que HoloSheen.
 */
export function sheenStripePath(progress: number, size: number): string {
  'worklet';
  const { from, to, widthRatio, angleDeg } = glassGeometry.sheen;
  const half = (size * widthRatio) / 2;
  const center = (from + (to - from) * progress) * size;
  // Igual que `rotate(-20deg)` en CSS: arriba la franja va corrida a la izquierda, abajo a la derecha.
  const lean = Math.tan((angleDeg * Math.PI) / 180) * (size / 2);
  const x = (value: number) => (Math.round(value * 100) / 100).toString();
  return `M${x(center - half + lean)},0L${x(center + half + lean)},0L${x(center + half - lean)},${x(size)}L${x(center - half - lean)},${x(size)}Z`;
}

/** M14: inclinación máxima de la carta, en grados. */
export const MAX_TILT = 8;

export interface Tilt {
  rotateX: number;
  rotateY: number;
}

function clampTilt(value: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, -max), max);
}

/**
 * M14 con cursor (web): el borde bajo el puntero se hunde. Arriba a la derecha → la carta mira a
 * la esquina contraria. `x` e `y` son relativos a la carta.
 */
export function tiltFromPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  max = MAX_TILT,
): Tilt {
  'worklet';
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };
  const dx = x / width - 0.5;
  const dy = y / height - 0.5;
  return { rotateX: clampTilt(-dy * 2 * max, max), rotateY: clampTilt(dx * 2 * max, max) };
}

/**
 * M14 con giroscopio (móvil): grados de inclinación a partir de cuánto se movió el teléfono desde
 * su posición de reposo (`pitch` y `roll` en radianes). Unos 20° de giro llevan la carta al tope.
 */
export function tiltFromRotation(pitchDelta: number, rollDelta: number, max = MAX_TILT): Tilt {
  'worklet';
  // El ángulo puede dar la vuelta (de π a −π): se usa el giro más corto.
  const toTilt = (radians: number) => {
    const shortest = Math.atan2(Math.sin(radians), Math.cos(radians));
    return clampTilt(((shortest * 180) / Math.PI) * (max / 20), max);
  };
  return { rotateX: toTilt(pitchDelta), rotateY: toTilt(rollDelta) };
}

/** X07: distancia que sube el "+XP" flotante, en px. */
export const XP_FLOAT_RISE = 36;

/**
 * X07: posición y opacidad del "+XP" con `progress` de 0 a 1 (ya con `power2.out`). Sube todo el
 * recorrido y se desvanece en la segunda mitad. Con "reducir movimiento" no sube.
 */
export function xpFloatFrame(progress: number, reduceMotion: boolean) {
  'worklet';
  const p = Math.min(Math.max(progress, 0), 1);
  return {
    translateY: reduceMotion ? 0 : -XP_FLOAT_RISE * p,
    opacity: p < 0.5 ? 1 : 1 - (p - 0.5) * 2,
  };
}

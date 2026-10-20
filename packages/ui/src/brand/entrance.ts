import { TRAIL } from './geometry.ts';

// Tiempos de las animaciones de marca (§11.7) como funciones puras del tiempo transcurrido.
// El logo animado se dibuja en JS cuadro a cuadro con el mismo árbol SVG que el estático, así que
// las curvas se escriben aquí con su definición de GSAP (power2 = cúbica, power3 = cuártica).

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export const brandEase = {
  power2Out: (p: number) => 1 - (1 - p) ** 3,
  power2InOut: (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
  power3Out: (p: number) => 1 - (1 - p) ** 4,
  sineInOut: (p: number) => -(Math.cos(Math.PI * p) - 1) / 2,
  /** `back.out(s)`: pasa un poco del final y vuelve. */
  backOut:
    (s: number) =>
    (p: number): number =>
      1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2,
} as const;

/** Arranque y duración (ms) de cada parte de M21. Termina a los 2,4 s. */
export const ENTRANCE_TIMELINE = {
  planet: { start: 200, duration: 600 },
  orbit: { start: 500, duration: 700 },
  trail: { start: 1000, duration: 800 },
  steps: { start: 1000, duration: 400 },
  star: { start: 1300, duration: 700 },
  sheen: { start: 1700, duration: 500 },
  sparkle: { start: 2000, duration: 400 },
} as const;

export const ENTRANCE_DURATION = 2400;

/** M23: un ciclo del destello (escala 1 → 0,8 → 1). */
export const TWINKLE_PERIOD = 3200;

export interface EntranceState {
  planetScale: number;
  planetOpacity: number;
  orbitScale: number;
  orbitOpacity: number;
  /** Parte dibujada de la estela (0–1). */
  trailProgress: number;
  stepsOpacity: number;
  /** Posición de la estrella sobre la estela (0 = planeta, 1 = (150, 40)). */
  starProgress: number;
  starScale: number;
  starRotation: number;
  starOpacity: number;
  /** Reflejo sobre el planeta (0–1) o `null` si no está pasando. */
  sheenProgress: number | null;
  sparkleScale: number;
}

/** Estado final (sin entrada o al terminarla). */
export const ENTRANCE_DONE: EntranceState = {
  planetScale: 1,
  planetOpacity: 1,
  orbitScale: 1,
  orbitOpacity: 1,
  trailProgress: 1,
  stepsOpacity: 1,
  starProgress: 1,
  starScale: 1,
  starRotation: 0,
  starOpacity: 1,
  sheenProgress: null,
  sparkleScale: 1,
};

const phase = (ms: number, { start, duration }: { start: number; duration: number }) =>
  clamp01((ms - start) / duration);

/** M21 · Entrada y ascenso del logo en el instante `ms`. */
export function entranceAt(ms: number): EntranceState {
  if (ms >= ENTRANCE_DURATION) return ENTRANCE_DONE;
  const t = ENTRANCE_TIMELINE;
  const planet = phase(ms, t.planet);
  const orbit = phase(ms, t.orbit);
  const star = phase(ms, t.star);
  const starEased = brandEase.power2Out(star);
  const sheen = phase(ms, t.sheen);
  return {
    planetScale: 0.2 + 0.8 * brandEase.backOut(1.8)(planet),
    planetOpacity: clamp01(planet * 3),
    orbitScale: 0.6 + 0.4 * brandEase.power3Out(orbit),
    orbitOpacity: brandEase.power3Out(orbit),
    trailProgress: brandEase.power2InOut(phase(ms, t.trail)),
    stepsOpacity: phase(ms, t.steps),
    starProgress: starEased,
    starScale: 0.35 + 0.65 * starEased,
    starRotation: -180 * (1 - starEased),
    starOpacity: star > 0 ? 1 : 0,
    sheenProgress: sheen > 0 && sheen < 1 ? brandEase.sineInOut(sheen) : null,
    sparkleScale: brandEase.backOut(2.5)(phase(ms, t.sparkle)),
  };
}

/** M23 · Escala del destello: 1 → 0,8 → 1 cada 3,2 s con `sine.inOut`. */
export function twinkleScale(ms: number): number {
  'worklet';
  const cycle = (ms % TWINKLE_PERIOD) / TWINKLE_PERIOD;
  const p = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
  // `sine.inOut` escrito aquí: en el hilo de UI no se puede llamar a `brandEase` (no es worklet).
  return 1 - 0.2 * (-(Math.cos(Math.PI * p) - 1) / 2);
}

interface Point {
  x: number;
  y: number;
}

const mix = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** Punto de la estela en `t` (0–1). */
export function trailPoint(t: number): Point {
  return trailSplit(t).end;
}

/**
 * Tramo de la estela de 0 a `t` como Bézier cúbica (de Casteljau): sirve para dibujarla a medias
 * sin depender de `strokeDasharray`.
 */
export function trailSplit(t: number): { path: string; end: Point } {
  const { p0, p1, p2, p3 } = TRAIL;
  const a = mix(p0, p1, t);
  const b = mix(p1, p2, t);
  const c = mix(p2, p3, t);
  const ab = mix(a, b, t);
  const bc = mix(b, c, t);
  const end = mix(ab, bc, t);
  const f = (point: Point) =>
    `${Math.round(point.x * 100) / 100},${Math.round(point.y * 100) / 100}`;
  return { path: `M${f(p0)} C${f(a)} ${f(ab)} ${f(end)}`, end };
}

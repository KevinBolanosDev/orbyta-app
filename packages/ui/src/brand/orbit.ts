import type { ModuleId } from '../tokens/modules.ts';

import { round1 } from './svg-tree.ts';

// Órbita hexagonal del logo (§11.3). Función pura que usan el SVG estático, la animación M20 (web y
// nativo) y `pnpm brand:export`.

export const ORBIT = {
  radius: 88,
  squash: 0.34,
  tiltDeg: -18,
  center: 100,
  /** Pose de reposo: φ = 30°. */
  restPhi: Math.PI / 6,
  gapVertex: 4,
  slots: ['expenses', 'stocks', 'wealth', 'agenda', null, 'habits'] as const,
} as const;

export interface OrbitPoint {
  x: number;
  y: number;
  /** `sin(a)`: > 0 delante del planeta, < 0 detrás. */
  depth: number;
}

export interface OrbitSlot extends OrbitPoint {
  moduleId: ModuleId;
  /** Lado del ícono en unidades del lienzo: de 24 (atrás) a 38 (adelante). */
  size: number;
  layer: 'back' | 'front';
  opacity: number;
}

export interface OrbitFrame {
  /** Trazo abierto de la órbita, con la abertura en el vértice 4. */
  ringPath: string;
  slots: OrbitSlot[];
  vertices: OrbitPoint[];
}

const TILT = (Math.abs(ORBIT.tiltDeg) * Math.PI) / 180;

/** Aplana el eje Y (× 0,34) y rota −18° alrededor del centro del lienzo. */
export function projectPoint(X: number, Y: number): { x: number; y: number } {
  const y2 = Y * ORBIT.squash;
  return {
    x: ORBIT.center + X * Math.cos(TILT) + y2 * Math.sin(TILT),
    y: ORBIT.center - X * Math.sin(TILT) + y2 * Math.cos(TILT),
  };
}

/** Los seis vértices proyectados para un ángulo de giro φ (radianes). */
export function orbitVertices(phi: number): OrbitPoint[] {
  return [0, 1, 2, 3, 4, 5].map((k) => {
    const a = phi + (k * Math.PI) / 3;
    const point = projectPoint(ORBIT.radius * Math.cos(a), ORBIT.radius * Math.sin(a));
    return { ...point, depth: Math.sin(a) };
  });
}

const lerp = (from: OrbitPoint, to: OrbitPoint, t: number) => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

const at = (points: readonly OrbitPoint[], index: number): OrbitPoint => {
  const point = points[((index % 6) + 6) % 6];
  if (!point) throw new Error(`Missing orbit vertex ${index}`);
  return point;
};

/**
 * Trazo y posición de los cinco íconos para un ángulo φ. El trazo empieza al 30 % del lado k4 → k5,
 * pasa por k5, k0, k1, k2 y k3, y termina al 70 % del lado k3 → k4 (la abertura).
 * Tamaño `31 + 7·d`; opacidad 1 delante y `0,5 + 0,5·(d + 1)` detrás.
 */
export function orbitFrame(phi: number): OrbitFrame {
  const vertices = orbitVertices(phi);
  const gap = ORBIT.gapVertex;
  const start = lerp(at(vertices, gap), at(vertices, gap + 1), 0.3);
  const end = lerp(at(vertices, gap - 1), at(vertices, gap), 0.7);
  const path = [1, 2, 3, 4, 5].map((step) => at(vertices, gap + step));
  const ringPath = [start, ...path, end]
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${round1(point.x)},${round1(point.y)}`)
    .join(' ');

  const slots: OrbitSlot[] = [];
  ORBIT.slots.forEach((moduleId, k) => {
    if (moduleId === null) return;
    const vertex = at(vertices, k);
    const front = vertex.depth > 0;
    slots.push({
      ...vertex,
      moduleId,
      size: 31 + 7 * vertex.depth,
      layer: front ? 'front' : 'back',
      opacity: front ? 1 : 0.5 + 0.5 * (vertex.depth + 1),
    });
  });

  return { ringPath, slots, vertices };
}

/** M20: ángulo de la órbita tras `elapsedMs`, una vuelta cada `turnMs` a velocidad constante. */
export function orbitPhase(elapsedMs: number, turnMs: number): number {
  const turns = (elapsedMs % turnMs) / turnMs;
  return ORBIT.restPhi + turns * 2 * Math.PI;
}

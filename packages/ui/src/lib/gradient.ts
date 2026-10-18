// Degradados lineales descritos como datos, para pintarlos igual en SVG (nativo y web) y en CSS.

export interface GradientStop {
  color: string;
  /** Posición de 0 a 1. */
  offset: number;
}

export interface LinearGradientToken {
  /** Ángulo CSS: 0° apunta hacia arriba, 90° hacia la derecha, en sentido horario. */
  angleDeg: number;
  stops: readonly GradientStop[];
}

export interface SvgGradientVector {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// El `+ 0` convierte -0 en 0 (sin(180°) da -0 tras redondear).
const round = (value: number) => Math.round(value * 10_000) / 10_000 + 0;

/**
 * Convierte el ángulo CSS de un `linear-gradient` en los extremos del `<LinearGradient>` de SVG,
 * en coordenadas relativas a la caja (0 a 1) y pasando por el centro.
 */
export function cssAngleToSvgVector(angleDeg: number): SvgGradientVector {
  const radians = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(radians) / 2;
  const dy = Math.cos(radians) / 2;
  return {
    x1: round(0.5 - dx),
    y1: round(0.5 + dy),
    x2: round(0.5 + dx),
    y2: round(0.5 - dy),
  };
}

/** El mismo degradado como valor CSS (`linear-gradient(125deg, … )`). */
export function toCssLinearGradient({ angleDeg, stops }: LinearGradientToken): string {
  const parts = stops.map(({ color, offset }) => `${color} ${round(offset * 100)}%`);
  return `linear-gradient(${angleDeg}deg, ${parts.join(', ')})`;
}

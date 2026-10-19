// Escalas y marco de los gráficos (G01–G07) como funciones puras sobre d3-scale (ADR 0014). Los
// componentes solo dibujan lo que sale de aquí; todo lo que es número se prueba sin React.

import { scaleLinear } from 'd3-scale';

/** Margen interno del área de dibujo, en px. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Caja donde se dibujan los datos, ya descontados los márgenes. */
export interface PlotBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function plotBox(width: number, height: number, insets: Insets = NO_INSETS): PlotBox {
  return {
    x: insets.left,
    y: insets.top,
    width: Math.max(width - insets.left - insets.right, 0),
    height: Math.max(height - insets.top - insets.bottom, 0),
  };
}

/**
 * Mínimo y máximo de los valores. Si todos son iguales, abre ±1 (o ±10 %) para que la línea quede
 * al medio y no se divida por cero; `includeZero` mete el 0 (barras).
 */
export function extentOf(values: readonly number[], includeZero = false): [number, number] {
  if (values.length === 0) return [0, 1];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
    return [min - pad, max + pad];
  }
  return [min, max];
}

/** Escala lineal del dominio a píxeles. En `y` el rango va invertido (el valor alto queda arriba). */
export function linear(domain: readonly [number, number], range: readonly [number, number]) {
  const scale = scaleLinear().domain(domain).range(range);
  return (value: number) => scale(value);
}

/** Dominio redondeado a valores "lindos" y sus marcas (por ejemplo 0, 250, 500, 750). */
export function niceTicks(
  domain: readonly [number, number],
  count: number,
): { domain: [number, number]; ticks: number[] } {
  const scale = scaleLinear().domain(domain).nice(count);
  const [min = 0, max = 1] = scale.domain();
  return { domain: [min, max], ticks: scale.ticks(count) };
}

/** Posición `x` de cada uno de `count` puntos repartidos a lo ancho de la caja. */
export function spreadX(count: number, box: PlotBox): number[] {
  if (count === 0) return [];
  if (count === 1) return [box.x + box.width / 2];
  const step = box.width / (count - 1);
  return Array.from({ length: count }, (_, i) => box.x + i * step);
}

/** Índice del punto más cercano a `x` (scrubber G07). `xs` está ordenado de menor a mayor. */
export function nearestIndex(xs: readonly number[], x: number): number {
  'worklet';
  const count = xs.length;
  if (count === 0) return -1;
  let low = 0;
  let high = count - 1;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if ((xs[mid] ?? 0) < x) low = mid;
    else high = mid;
  }
  const lowX = xs[low] ?? 0;
  const highX = xs[high] ?? 0;
  return Math.abs(x - lowX) <= Math.abs(highX - x) ? low : high;
}

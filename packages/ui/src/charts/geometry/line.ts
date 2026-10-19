// Líneas y áreas (G01 Sparkline, G02 AreaChart) sobre d3-shape. La curva es monótona en x: suaviza
// sin inventar picos ni valles que no están en los datos (importante en montos).

import { area, curveMonotoneX, line } from 'd3-shape';

import { extentOf, linear, spreadX, type PlotBox } from './scale';

export interface Point {
  x: number;
  y: number;
}

/** Valores a puntos: repartidos a lo ancho y escalados al alto de la caja (el máximo arriba). */
export function seriesPoints(
  values: readonly number[],
  box: PlotBox,
  domain: readonly [number, number] = extentOf(values),
): Point[] {
  const xs = spreadX(values.length, box);
  const y = linear(domain, [box.y + box.height, box.y]);
  return values.map((value, i) => ({ x: xs[i] ?? 0, y: y(value) }));
}

export function linePath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const [only] = points;
    return `M${(only?.x ?? 0).toString()},${(only?.y ?? 0).toString()}h0.01`;
  }
  return (
    line<Point>()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(curveMonotoneX)([...points]) ?? ''
  );
}

/** Área bajo la línea hasta `baseY` (el borde de abajo de la caja). */
export function areaPath(points: readonly Point[], baseY: number): string {
  if (points.length < 2) return '';
  return (
    area<Point>()
      .x((p) => p.x)
      .y0(baseY)
      .y1((p) => p.y)
      .curve(curveMonotoneX)([...points]) ?? ''
  );
}

/**
 * Largo aproximado del trazo, para el dibujo M04 (`strokeDasharray`). Se mide sobre los segmentos
 * rectos y se suma un 10 %: la curva es un poco más larga y el guion debe cubrirla entera.
 */
export function pathLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (a && b) total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return Math.ceil(total * 1.1) + 1;
}

/** Tendencia de la serie: sube, baja o queda igual (colorea Sparkline y StatTile). */
export function trendOf(values: readonly number[]): 'up' | 'down' | 'flat' {
  const first = values[0];
  const last = values.at(-1);
  if (first === undefined || last === undefined || first === last) return 'flat';
  return last > first ? 'up' : 'down';
}

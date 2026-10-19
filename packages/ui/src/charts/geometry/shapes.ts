// Barras (G04), velas (G03), donut (G05) y heatmap (G06) como funciones puras.

import { arc, pie } from 'd3-shape';

import { addDaysIso, parseIsoDay, type IsoDay } from '../../lib/calendar';

import { extentOf, linear, type PlotBox } from './scale';

/**
 * Path de un rectángulo con esquinas redondeadas. Corre también en el hilo de UI (barras y velas lo
 * recalculan en cada cuadro de su animación).
 */
export function rectPath(x: number, y: number, width: number, height: number, r = 0): string {
  'worklet';
  const w = Math.max(width, 0);
  const h = Math.max(height, 0);
  const radius = Math.min(Math.max(r, 0), w / 2, h / 2);
  if (radius === 0) return `M${x},${y}h${w}v${h}h${-w}Z`;
  return (
    `M${x + radius},${y}h${w - 2 * radius}` +
    `a${radius},${radius} 0 0 1 ${radius},${radius}v${h - 2 * radius}` +
    `a${radius},${radius} 0 0 1 ${-radius},${radius}h${-(w - 2 * radius)}` +
    `a${radius},${radius} 0 0 1 ${-radius},${-radius}v${-(h - 2 * radius)}` +
    `a${radius},${radius} 0 0 1 ${radius},${-radius}Z`
  );
}

// ——— Barras (G04) ———

export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** El valor es negativo (crece hacia abajo, o hacia la izquierda si es horizontal). */
  negative: boolean;
}

/** Fracción del espacio de cada barra que es hueco. */
export const BAR_GAP_RATIO = 0.35;

/**
 * Rectángulos de las barras con la línea del 0 como base (los negativos van del otro lado). En
 * `horizontal` las barras crecen a lo ancho, una debajo de otra.
 */
export function barLayout(
  values: readonly number[],
  box: PlotBox,
  orientation: 'vertical' | 'horizontal' = 'vertical',
): { bars: BarRect[]; zero: number } {
  const domain = extentOf(values, true);
  const count = Math.max(values.length, 1);
  if (orientation === 'vertical') {
    const y = linear(domain, [box.y + box.height, box.y]);
    const zero = y(0);
    const slot = box.width / count;
    const width = slot * (1 - BAR_GAP_RATIO);
    return {
      zero,
      bars: values.map((value, i) => {
        const top = Math.min(y(value), zero);
        return {
          x: box.x + i * slot + (slot - width) / 2,
          y: top,
          width,
          height: Math.abs(zero - y(value)),
          negative: value < 0,
        };
      }),
    };
  }
  const x = linear(domain, [box.x, box.x + box.width]);
  const zero = x(0);
  const slot = box.height / count;
  const height = slot * (1 - BAR_GAP_RATIO);
  return {
    zero,
    bars: values.map((value, i) => ({
      x: Math.min(x(value), zero),
      y: box.y + i * slot + (slot - height) / 2,
      width: Math.abs(x(value) - zero),
      height,
      negative: value < 0,
    })),
  };
}

// ——— Velas (G03) ———

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandleShape {
  /** Centro de la vela en x. */
  x: number;
  bodyTop: number;
  /** Alto del cuerpo (al menos 1 px: una vela sin cambio se ve como raya). */
  bodyHeight: number;
  bodyWidth: number;
  wickTop: number;
  wickBottom: number;
  up: boolean;
}

export function candleLayout(candles: readonly Candle[], box: PlotBox): CandleShape[] {
  const domain = extentOf(candles.flatMap((c) => [c.low, c.high]));
  const y = linear(domain, [box.y + box.height, box.y]);
  const slot = box.width / Math.max(candles.length, 1);
  const bodyWidth = Math.max(slot * (1 - BAR_GAP_RATIO), 1);
  return candles.map((candle, i) => {
    const top = y(Math.max(candle.open, candle.close));
    const bottom = y(Math.min(candle.open, candle.close));
    return {
      x: box.x + i * slot + slot / 2,
      bodyTop: top,
      bodyHeight: Math.max(bottom - top, 1),
      bodyWidth,
      wickTop: y(candle.high),
      wickBottom: y(candle.low),
      up: candle.close >= candle.open,
    };
  });
}

// ——— Donut (G05) ———

export interface DonutSlice {
  index: number;
  /** Ángulos en radianes, desde arriba y en sentido horario (convención de d3). */
  startAngle: number;
  endAngle: number;
  /** Fracción del total (0–1). */
  share: number;
}

/** Porciones del donut en el orden de los datos (sin reordenar por tamaño). */
export function donutSlices(values: readonly number[]): DonutSlice[] {
  const total = values.reduce((sum, value) => sum + Math.max(value, 0), 0);
  if (total === 0) return [];
  return pie<number>()
    .sort(null)
    .value((value) => Math.max(value, 0))([...values])
    .map((slice) => ({
      index: slice.index,
      startAngle: slice.startAngle,
      endAngle: slice.endAngle,
      share: Math.max(slice.value, 0) / total,
    }));
}

/** Path de una porción del anillo; `padAngle` separa las porciones. */
export function slicePath(
  slice: DonutSlice,
  innerRadius: number,
  outerRadius: number,
  padAngle = 0.02,
): string {
  return (
    arc<DonutSlice>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .padAngle(padAngle)
      .cornerRadius(Math.min(4, (outerRadius - innerRadius) / 4))(slice) ?? ''
  );
}

/**
 * ¿Qué porción hay en el punto (x, y) relativo al centro? `null` si cae en el hueco o afuera. Para
 * tocar segmentos (G05).
 */
export function sliceAt(
  slices: readonly DonutSlice[],
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
): number | null {
  const distance = Math.hypot(x, y);
  if (distance < innerRadius || distance > outerRadius) return null;
  // Ángulo desde arriba en sentido horario, como d3.
  let angle = Math.atan2(x, -y);
  if (angle < 0) angle += Math.PI * 2;
  const hit = slices.find((slice) => angle >= slice.startAngle && angle < slice.endAngle);
  return hit ? hit.index : null;
}

// ——— Heatmap de días (G06) ———

export interface HeatCell {
  iso: IsoDay;
  /** Columna (semana) y fila (día de la semana). */
  column: number;
  row: number;
  value: number | undefined;
  /** Intensidad de 0 (sin dato o 0) a 4. */
  level: 0 | 1 | 2 | 3 | 4;
}

/** Intensidad 0–4 de un valor respecto al máximo (0 solo si no hay dato o es 0). */
export function heatLevel(value: number | undefined, max: number): HeatCell['level'] {
  if (value === undefined || value <= 0 || max <= 0) return 0;
  const ratio = value / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

/**
 * Cuadrícula de días de `start` a `end` (incluidos): una columna por semana y una fila por día,
 * empezando la semana en `weekStartsOn` (0 domingo, 1 lunes).
 */
export function heatmapCells(
  start: IsoDay,
  end: IsoDay,
  values: Readonly<Record<IsoDay, number>>,
  weekStartsOn: 0 | 1,
): { cells: HeatCell[]; columns: number } {
  const max = Math.max(0, ...Object.values(values));
  const firstRow = (parseIsoDay(start).getDay() - weekStartsOn + 7) % 7;
  const cells: HeatCell[] = [];
  let iso = start;
  let index = firstRow;
  while (iso <= end) {
    const value = values[iso];
    cells.push({
      iso,
      column: Math.floor(index / 7),
      row: index % 7,
      value,
      level: heatLevel(value, max),
    });
    iso = addDaysIso(iso, 1);
    index += 1;
  }
  const last = cells.at(-1);
  return { cells, columns: last ? last.column + 1 : 0 };
}

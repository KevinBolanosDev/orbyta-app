// Escalas y marco de los gráficos (G01–G07) como funciones puras (ADR 0014). Los componentes solo
// dibujan lo que sale de aquí; todo lo que es número se prueba sin React.
// La escala lineal y las marcas "lindas" son propias desde F1.9: d3-scale solo se usaba para esto y
// arrastraba d3-array, d3-time, d3-format, d3-interpolate y d3-color (~110 KB sin minificar en web).
// Los algoritmos de `tickIncrement`, `ticks` y `nice` son los de d3-array y d3-scale (licencia ISC).

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

/**
 * Escala lineal del dominio a píxeles. En `y` el rango va invertido (el valor alto queda arriba).
 * Con un dominio sin ancho, todo cae al medio del rango (igual que d3).
 */
export function linear(domain: readonly [number, number], range: readonly [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  return (value: number) => r0 + (span === 0 ? 0.5 : (value - d0) / span) * (r1 - r0);
}

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/** Índices de la primera y la última marca y el paso (negativo = 1 / paso, para decimales). */
function tickSpec(start: number, stop: number, count: number): [number, number, number] {
  const step = (stop - start) / Math.max(0, count);
  const power = Math.floor(Math.log10(step));
  const error = step / 10 ** power;
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;
  let i1: number;
  let i2: number;
  let inc: number;
  if (power < 0) {
    inc = 10 ** -power / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) i1 += 1;
    if (i2 / inc > stop) i2 -= 1;
    inc = -inc;
  } else {
    inc = 10 ** power * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) i1 += 1;
    if (i2 * inc > stop) i2 -= 1;
  }
  if (i2 < i1 && count >= 0.5 && count < 2) return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}

/** Marcas redondas entre `start` y `stop` (`start ≤ stop`), unas `count`. */
function ticks(start: number, stop: number, count: number): number[] {
  if (!(count > 0)) return [];
  if (start === stop) return [start];
  const [i1, i2, inc] = tickSpec(start, stop, count);
  if (!(i2 >= i1)) return [];
  return Array.from({ length: i2 - i1 + 1 }, (_, i) =>
    inc < 0 ? (i1 + i) / -inc : (i1 + i) * inc,
  );
}

/** Dominio redondeado a valores "lindos" y sus marcas (por ejemplo 0, 250, 500, 750). */
export function niceTicks(
  domain: readonly [number, number],
  count: number,
): { domain: [number, number]; ticks: number[] } {
  const reversed = domain[1] < domain[0];
  let [start, stop] = reversed ? [domain[1], domain[0]] : domain;
  // `nice` de d3-scale: agranda el dominio al múltiplo del paso hasta que el paso no cambia.
  let previous: number | undefined;
  for (let i = 0; i < 10 && start !== stop; i += 1) {
    const step = tickSpec(start, stop, count)[2];
    if (step === previous) break;
    if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    } else {
      break;
    }
    previous = step;
  }
  const marks = ticks(start, stop, count);
  // Como d3: un dominio invertido se devuelve invertido, con las marcas en ese orden.
  return reversed
    ? { domain: [stop, start], ticks: marks.reverse() }
    : { domain: [start, stop], ticks: marks };
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

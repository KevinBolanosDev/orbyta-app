/**
 * Series de ejemplo del catálogo (sección Gráficos): datos inventados pero repetibles, para que el
 * catálogo y sus pruebas se vean igual siempre. No son datos de la app.
 */

/** Generador pseudoaleatorio estable (mulberry32): la misma semilla da la misma serie. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Caminata con tendencia: `count` valores desde `start`, con pasos de hasta ±`volatility`. */
export function walk(
  count: number,
  start: number,
  drift: number,
  volatility: number,
  seed: number,
) {
  const next = random(seed);
  const values: number[] = [];
  let value = start;
  for (let i = 0; i < count; i += 1) {
    values.push(Math.round(value));
    value += drift + (next() * 2 - 1) * volatility;
  }
  return values;
}

export interface SampleCandle {
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Velas de un precio que camina: cada una abre donde cerró la anterior. */
export function candles(count: number, start: number, seed: number): SampleCandle[] {
  const next = random(seed);
  const result: SampleCandle[] = [];
  let open = start;
  for (let i = 0; i < count; i += 1) {
    const close = open + (next() * 2 - 1) * start * 0.03;
    const high = Math.max(open, close) + next() * start * 0.015;
    const low = Math.min(open, close) - next() * start * 0.015;
    result.push({ open, high, low, close });
    open = close;
  }
  return result;
}

/** Días cumplidos de un hábito: cerca del 75 % de los días, con algunos valores más altos. */
export function habitDays(days: readonly string[], seed: number): Record<string, number> {
  const next = random(seed);
  const values: Record<string, number> = {};
  for (const day of days) {
    const roll = next();
    if (roll < 0.75) values[day] = 1 + Math.floor(next() * 4);
  }
  return values;
}

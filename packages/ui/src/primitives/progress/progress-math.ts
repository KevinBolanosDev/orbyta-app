// Cálculos puros de ProgressBar (P18), ProgressRing (P19) y Stepper (P34), probados sin React.

/** Tono de un progreso: `primary` neutro, o el estado de un presupuesto (sano, límite, excedido). */
export type ProgressTone = 'primary' | 'healthy' | 'limit' | 'exceeded';

/** Desde aquí un presupuesto está "al límite" (el aviso del 80 % de GAS). */
export const PROGRESS_LIMIT_RATIO = 0.8;

/** Estado de un presupuesto según lo usado: < 80 % sano, < 100 % al límite, desde 100 % excedido. */
export function budgetTone(ratio: number): Exclude<ProgressTone, 'primary'> {
  if (ratio >= 1) return 'exceeded';
  if (ratio >= PROGRESS_LIMIT_RATIO) return 'limit';
  return 'healthy';
}

/** Porcentaje entero (0–100) para `accessibilityValue`; lo que pasa de 100 % se informa como 100. */
export function progressPercent(value: number): number {
  return Math.round(Math.min(Math.max(value, 0), 1) * 100);
}

export interface RingGeometry {
  /** Centro del anillo (igual en x e y). */
  center: number;
  /** Radio del trazo, hacia adentro para que el borde no se corte. */
  radius: number;
  /** Largo del trazo completo (`strokeDasharray`). */
  circumference: number;
}

/** Geometría de un anillo de `size` px con un trazo de `strokeWidth`. */
export function ringGeometry(size: number, strokeWidth: number): RingGeometry {
  const center = size / 2;
  const radius = Math.max(center - strokeWidth / 2, 0);
  return { center, radius, circumference: 2 * Math.PI * radius };
}

/** Estado de un paso del asistente respecto al actual. */
export type StepState = 'done' | 'current' | 'upcoming';

export function stepState(index: number, current: number): StepState {
  if (index < current) return 'done';
  return index === current ? 'current' : 'upcoming';
}

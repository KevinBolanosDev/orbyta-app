// Cálculos puros de la hoja inferior P24 (M10), probados sin React. Los que corren en el gesto, en
// el hilo de UI, llevan la directiva 'worklet'.

/** Alto de la hoja: según su contenido, media pantalla o casi completa. */
export type SheetHeight = 'auto' | 'half' | 'full';

/** Fracción de la pantalla que ocupa la altura `half`. */
export const SHEET_HALF_RATIO = 0.5;
/** Fracción del alto de la hoja que hay que arrastrar hacia abajo para cerrarla. */
export const SHEET_DISMISS_RATIO = 0.3;
/** Velocidad hacia abajo (px/s) que cierra la hoja aunque no se haya arrastrado tanto. */
export const SHEET_DISMISS_VELOCITY = 1000;
/** Hacia arriba la hoja casi no se mueve: resistencia del arrastre. */
export const SHEET_OVERDRAG_RESISTANCE = 0.15;

/**
 * Alto máximo de la hoja: toda la pantalla menos la zona segura de arriba y un margen, para que se
 * vea que es una hoja sobre la pantalla.
 */
export function sheetMaxHeight(screenHeight: number, topInset: number, topGap: number): number {
  return Math.max(screenHeight - topInset - topGap, 0);
}

/** Alto fijo para `half` y `full`; `auto` no tiene (lo da el contenido, con el máximo). */
export function sheetFixedHeight(
  height: SheetHeight,
  screenHeight: number,
  maxHeight: number,
): number | undefined {
  if (height === 'full') return maxHeight;
  if (height === 'half') return Math.min(screenHeight * SHEET_HALF_RATIO, maxHeight);
  return undefined;
}

/** Desplazamiento de la hoja mientras se arrastra: libre hacia abajo, con resistencia hacia arriba. */
export function sheetDragOffset(translationY: number): number {
  'worklet';
  return translationY >= 0 ? translationY : translationY * SHEET_OVERDRAG_RESISTANCE;
}

/** Al soltar: se cierra si se arrastró lo suficiente o se lanzó hacia abajo. */
export function shouldDismissSheet(
  translationY: number,
  velocityY: number,
  sheetHeight: number,
): boolean {
  'worklet';
  return translationY > sheetHeight * SHEET_DISMISS_RATIO || velocityY > SHEET_DISMISS_VELOCITY;
}

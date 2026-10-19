import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

import { useReduceMotion } from '../motion/accessibility-preferences';
import { timingConfig } from '../motion/easing';
import { duration, timing } from '../tokens';

import type { trendOf } from './geometry/line';

// Piezas comunes de los gráficos G01–G07: ancho medido, color de la serie y la entrada escalonada.

/** primary · gain · loss · secondary, o `auto`: verde si la serie sube y rojo si baja. */
export type ChartTone = 'primary' | 'secondary' | 'accent' | 'gain' | 'loss' | 'auto';

/** Color real (no variable CSS) del tono, para SVG y para calcular transparencias. */
export function useChartColor(tone: ChartTone, trend: ReturnType<typeof trendOf> = 'flat'): string {
  const { theme } = useUnistyles();
  if (tone === 'auto') {
    return trend === 'up'
      ? theme.colors.gain
      : trend === 'down'
        ? theme.colors.loss
        : theme.colors.primary;
  }
  return theme.colors[tone];
}

/** Ancho del contenedor (los gráficos se adaptan a él); 0 hasta el primer `onLayout`. */
export function useMeasuredWidth(fixed?: number) {
  const [measured, setMeasured] = useState(0);
  return {
    width: fixed ?? measured,
    onLayout: (event: LayoutChangeEvent) => {
      if (fixed === undefined) setMeasured(Math.round(event.nativeEvent.layout.width));
    },
  };
}

/**
 * Entrada de los gráficos con piezas (barras M05, velas, celdas del heatmap): `progress` va de 0 a 1
 * y cada pieza toma su tramo con `staggerProgress`. Cambiar `trigger` vuelve a animar. Con "reducir
 * movimiento" aparece completo.
 */
export function useChartEntrance(trigger: unknown, durationMs: number = timing.progressFill) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    progress.set(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, timingConfig(durationMs, 'power3Out')),
      ),
    );
  }, [progress, reduceMotion, trigger, durationMs]);
  return progress;
}

/** Duración de la entrada de las velas y del heatmap (`dur.showcase`). */
export const SHOWCASE = duration.showcase;

/**
 * Tramo de la pieza `index` de `count` dentro de un progreso global: cada una empieza un poco después
 * de la anterior y todas terminan juntas en 1.
 */
export function staggerProgress(progress: number, index: number, count: number): number {
  'worklet';
  if (count <= 1) return Math.min(Math.max(progress, 0), 1);
  const spread = 0.4;
  const start = (index / (count - 1)) * spread;
  return Math.min(Math.max((progress - start) / (1 - spread), 0), 1);
}

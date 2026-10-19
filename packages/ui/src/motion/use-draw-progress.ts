import { useEffect } from 'react';
import { useDerivedValue, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { duration } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { timingConfig } from './easing';
import { clampProgress } from './motion-math';

/** El área bajo la línea aparece en el último 20 % del dibujo. */
const AREA_FADE_START = 0.8;

export interface DrawOptions {
  /** Cambiar este valor vuelve a dibujar (por ejemplo, al cambiar el rango del gráfico). */
  trigger?: unknown;
}

/**
 * M04 · Dibujo de línea: `progress` va de 0 a 1 (`dur.showcase`, `power2.inOut`) y `areaOpacity`
 * hace el fundido del área al final. Los gráficos (F1.7) lo traducen a `strokeDashoffset`
 * (`longitud × (1 − progress)`). Con "reducir movimiento" el gráfico aparece completo.
 */
export function useDrawProgress({ trigger }: DrawOptions = {}) {
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
        withTiming(1, timingConfig(duration.showcase, 'power2InOut')),
      ),
    );
  }, [progress, reduceMotion, trigger]);

  const areaOpacity = useDerivedValue(() =>
    clampProgress((progress.get() - AREA_FADE_START) / (1 - AREA_FADE_START)),
  );

  return { progress, areaOpacity };
}

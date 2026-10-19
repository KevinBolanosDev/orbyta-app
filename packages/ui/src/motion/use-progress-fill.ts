import { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { timing } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { timingConfig } from './easing';
import { clampProgress } from './motion-math';

/**
 * M05 · Relleno de progreso: anima de 0 (o del valor anterior) a `value` (0–1) en 1000 ms con
 * `power3.out`. Lo usan ProgressBar, ProgressRing y Stepper (F1.5). Con "reducir movimiento" salta
 * al valor final.
 */
export function useProgressFill(value: number) {
  const reduceMotion = useReduceMotion();
  const target = clampProgress(value);
  const progress = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    progress.set(
      reduceMotion ? target : withTiming(target, timingConfig(timing.progressFill, 'power3Out')),
    );
  }, [progress, reduceMotion, target]);

  return progress;
}

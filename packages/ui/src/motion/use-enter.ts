import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { distance, duration, stagger, timing } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { fadeConfig, timingConfig } from './easing';
import { staggerDelay } from './motion-math';

export interface EnterOptions {
  /** Posición en el escalonado (0 = primero). */
  index?: number;
  /** Paso del escalonado: `stagger.screen` (bloques, por defecto) o `stagger.list` (filas). */
  step?: number;
  /** Espera extra antes de empezar, en ms. */
  delay?: number;
}

/**
 * M01 · Entrada: el bloque sube 24 px y aparece (`dur.slow`, `expo.out`), escalonado.
 * Con "reducir movimiento" solo queda un fundido de 150 ms sin desplazamiento.
 * Devuelve el estilo para un `Animated.View`.
 */
export function useEnter({ index = 0, step = stagger.screen, delay = 0 }: EnterOptions = {}) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const config = reduceMotion
      ? fadeConfig(timing.reducedMotionFade)
      : timingConfig(duration.slow, 'expoOut');
    progress.set(withDelay(delay + staggerDelay(index, step), withTiming(1, config)));
  }, [progress, index, step, delay, reduceMotion]);

  const offset = reduceMotion ? 0 : distance.enterOffset;
  return useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * offset }],
  }));
}

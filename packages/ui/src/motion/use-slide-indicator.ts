import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { timing } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { timingConfig } from './easing';

/** Posición horizontal y ancho de una opción, medidos con `onLayout`. */
export interface SlotLayout {
  x: number;
  width: number;
}

/**
 * M06 · Indicador que se desliza (la pastilla de SegmentedControl, el subrayado de Tabs): va a la
 * opción elegida con `expo.inOut` en 450 ms. La primera vez y con "reducir movimiento" se coloca sin
 * animar. Devuelve el estilo para un `Animated.View` con posición absoluta.
 */
export function useSlideIndicator(target: SlotLayout | undefined) {
  const reduceMotion = useReduceMotion();
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const placed = useSharedValue(false);

  const targetX = target?.x;
  const targetWidth = target?.width;

  useEffect(() => {
    if (targetX === undefined || targetWidth === undefined) return;
    if (reduceMotion || !placed.get()) {
      x.set(targetX);
      width.set(targetWidth);
      placed.set(true);
      return;
    }
    const config = timingConfig(timing.moduleSwitch, 'expoInOut');
    x.set(withTiming(targetX, config));
    width.set(withTiming(targetWidth, config));
  }, [targetX, targetWidth, reduceMotion, x, width, placed]);

  return useAnimatedStyle(() => ({
    opacity: placed.get() ? 1 : 0,
    width: width.get(),
    transform: [{ translateX: x.get() }],
  }));
}

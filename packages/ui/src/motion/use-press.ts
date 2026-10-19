import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { duration, PRESSED_SCALE, spring } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { springConfig, timingConfig } from './easing';
import { triggerHaptic, type HapticKind } from './haptics';

export interface PressOptions {
  /** Háptica al presionar; `false` la apaga. Por defecto, ligera (§4.3). */
  haptic?: HapticKind | false;
}

/**
 * M02 · Presión: escala a 0,96 al tocar y vuelve con resorte (`back.out(3)`), con háptica ligera.
 * Con "reducir movimiento" no hay escala; la háptica se mantiene.
 * Conectar `onPressIn`/`onPressOut` al `Pressable` y `animatedStyle` a su `Animated.View`.
 */
export function usePress({ haptic = 'light' }: PressOptions = {}) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (haptic) triggerHaptic(haptic);
    if (!reduceMotion) {
      scale.set(withTiming(PRESSED_SCALE, timingConfig(duration.instant, 'power2Out')));
    }
  }, [haptic, reduceMotion, scale]);

  const onPressOut = useCallback(() => {
    scale.set(withSpring(1, springConfig(spring.press)));
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return { animatedStyle, onPressIn, onPressOut };
}

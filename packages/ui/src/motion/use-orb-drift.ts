import { useEffect, useMemo } from 'react';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { distance, timing } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { timingConfig } from './easing';
import { orbDriftTarget } from './motion-math';
import { useAppActive } from './use-app-active';

/**
 * M09 · Orbes ambientales: deriva de hasta ±60 px en 8 s con `sine.inOut`, ida y vuelta, en bucle.
 * Se pausa con la app en segundo plano o con `paused` (pantalla tapada por otra); con "reducir
 * movimiento" el orbe vuelve a su sitio y queda quieto. `seed` hace que cada orbe vaya a un destino
 * distinto.
 * TODO(F2): pausar también en modo ahorro de batería (necesita expo-battery).
 */
export function useOrbDrift(seed: number, paused = false) {
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive() && !paused;
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const target = useMemo(() => orbDriftTarget(seed, distance.orbDrift), [seed]);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(x);
      cancelAnimation(y);
      x.set(0);
      y.set(0);
      return undefined;
    }
    if (!appActive) {
      // Pausa: queda donde está y retoma desde ahí al volver.
      cancelAnimation(x);
      cancelAnimation(y);
      return undefined;
    }
    const config = timingConfig(timing.orbDrift, 'sineInOut');
    x.set(withRepeat(withTiming(target.x, config), -1, true));
    y.set(withRepeat(withTiming(target.y, config), -1, true));
    return () => {
      cancelAnimation(x);
      cancelAnimation(y);
    };
  }, [x, y, target, reduceMotion, appActive]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
  }));
}

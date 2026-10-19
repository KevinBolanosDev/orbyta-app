import { useEffect, useId, useSyncExternalStore } from 'react';
import {
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { timing } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { timingConfig } from './easing';
import { sheenCoordinator } from './sheen-coordinator';
import { useAppActive } from './use-app-active';

/** `manual`: un barrido al montar y cada vez que cambia `trigger`. `idle`: además, cada 6 s. */
export type SheenMode = 'manual' | 'idle';

export interface SheenOptions {
  mode?: SheenMode;
  /** Cambiar este valor dispara otro barrido (por ejemplo, al desbloquear un logro). */
  trigger?: unknown;
}

/** Con "reducir movimiento" la franja queda quieta en el centro. */
const STATIC_PROGRESS = 0.5;

/**
 * M08 · Reflejo holográfico: `progress` de 0 a 1 en 2200 ms con `sine.inOut`. En modo `idle` se
 * repite cada 6 s, pero solo en la superficie dueña del turno (`sheenCoordinator`) y solo con la
 * app en primer plano. Con "reducir movimiento" no hay barrido (`reduceMotion: true`, franja quieta).
 */
export function useSheen({ mode = 'manual', trigger }: SheenOptions = {}) {
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive();
  const id = useId();
  const progress = useSharedValue(reduceMotion ? STATIC_PROGRESS : 0);

  const idle = mode === 'idle' && !reduceMotion;
  useEffect(() => (idle ? sheenCoordinator.register(id) : undefined), [idle, id]);
  const owner = useSyncExternalStore(
    sheenCoordinator.subscribe,
    sheenCoordinator.owner,
    sheenCoordinator.owner,
  );
  const looping = idle && owner === id && appActive;

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(progress);
      progress.set(STATIC_PROGRESS);
      return undefined;
    }
    const sweep = withTiming(1, timingConfig(timing.sheen, 'sineInOut'));
    const reset = withTiming(0, { duration: 0 });
    if (looping) {
      // Barrido, pausa de 6 s y vuelta a la izquierda (fuera de la tarjeta, no se ve).
      progress.set(
        withSequence(
          reset,
          withRepeat(withSequence(sweep, withDelay(timing.sheenIdle, reset)), -1),
        ),
      );
    } else if (mode === 'manual' || appActive) {
      progress.set(withSequence(reset, sweep));
    } else {
      cancelAnimation(progress);
    }
    return () => {
      cancelAnimation(progress);
    };
  }, [progress, mode, looping, appActive, reduceMotion, trigger]);

  return { progress, reduceMotion };
}

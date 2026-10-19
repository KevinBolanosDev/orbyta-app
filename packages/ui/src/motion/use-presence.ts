import { useEffect, useRef, useState } from 'react';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { duration, exitDuration, spring, timing } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { fadeConfig, springConfig, timingConfig } from './easing';

export interface PresenceOptions {
  /**
   * Cómo entra: `timing` (`expo.out`, por defecto), `spring` (resorte M10 de hojas y diálogos) o
   * `fade` (fundido lineal, para avisos como OfflineBanner y SyncBadge).
   */
  enter?: 'timing' | 'spring' | 'fade';
  /** Duración de la entrada en ms (no aplica al resorte). */
  enterMs?: number;
  /** Duración de la salida en ms (`power2.in`); por defecto, el 70 % de la entrada (§4.1). */
  exitMs?: number;
  /** Se llama cuando terminó de salir y ya se desmontó. */
  onExited?: () => void;
}

/**
 * Presencia animada: con `visible` en `true` monta y anima `progress` de 0 a 1; con `false` lo lleva
 * a 0 y recién al terminar desmonta (`mounted` pasa a `false`). Lo usan las superposiciones (Toast,
 * BottomSheet, Dialog) y los avisos (OfflineBanner). Con "reducir movimiento" entra y sale con el
 * fundido de 150 ms; cada componente decide además no desplazarse.
 */
export function usePresence(
  visible: boolean,
  { enter = 'timing', enterMs, exitMs, onExited }: PresenceOptions = {},
) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);
  const onExitedRef = useRef(onExited);
  useEffect(() => {
    onExitedRef.current = onExited;
  });

  // Montar apenas se pide mostrar (en el mismo render): la entrada arranca en el efecto.
  if (visible && !mounted) setMounted(true);

  const enterDuration = enterMs ?? (enter === 'fade' ? duration.fast : duration.slow);
  const exitDurationMs = reduceMotion
    ? timing.reducedMotionFade
    : (exitMs ?? exitDuration(enterDuration));

  useEffect(() => {
    if (visible) {
      if (reduceMotion) {
        progress.set(withTiming(1, fadeConfig(timing.reducedMotionFade)));
      } else if (enter === 'spring') {
        progress.set(withSpring(1, springConfig(spring.sheet)));
      } else if (enter === 'fade') {
        progress.set(withTiming(1, fadeConfig(enterDuration)));
      } else {
        progress.set(withTiming(1, timingConfig(enterDuration, 'expoOut')));
      }
      return undefined;
    }
    progress.set(
      withTiming(
        0,
        reduceMotion || enter === 'fade'
          ? fadeConfig(exitDurationMs)
          : timingConfig(exitDurationMs, 'power2In'),
      ),
    );
    // Se desmonta desde JS al terminar: no depende de que el callback del hilo de UI vuelva.
    const id = setTimeout(() => {
      setMounted(false);
      onExitedRef.current?.();
    }, exitDurationMs);
    return () => {
      clearTimeout(id);
    };
  }, [visible, reduceMotion, enter, enterDuration, exitDurationMs, progress]);

  return { mounted, progress };
}

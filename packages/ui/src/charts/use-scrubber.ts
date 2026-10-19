import { useState } from 'react';
import { usePanGesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { triggerHaptic } from '../motion/haptics';

import { nearestIndex } from './geometry/scale';

/**
 * G07 · ChartScrubber: arrastrar sobre el gráfico elige el punto más cercano al dedo, con háptica de
 * selección en cada punto nuevo. El gesto es horizontal: un arrastre vertical deja pasar el
 * desplazamiento de la pantalla. Al soltar, la selección se borra. Devuelve el gesto (para un
 * GestureDetector sobre el área del gráfico) y el índice elegido (`null` sin selección).
 */
export function useScrubber(xs: readonly number[], onChange?: (index: number | null) => void) {
  const [index, setIndex] = useState<number | null>(null);
  const last = useSharedValue(-1);

  const select = (next: number | null) => {
    setIndex(next);
    onChange?.(next);
    if (next !== null) triggerHaptic('selection');
  };

  const pick = (x: number) => {
    'worklet';
    const next = nearestIndex(xs, x);
    if (next === -1 || next === last.get()) return;
    last.set(next);
    scheduleOnRN(select, next);
  };

  const gesture = usePanGesture({
    enabled: xs.length > 0,
    activeOffsetX: [-4, 4],
    failOffsetY: [-12, 12],
    onBegin: (event) => {
      'worklet';
      pick(event.x);
    },
    onUpdate: (event) => {
      'worklet';
      pick(event.x);
    },
    onFinalize: () => {
      'worklet';
      last.set(-1);
      scheduleOnRN(select, null);
    },
  });

  return { gesture, index };
}

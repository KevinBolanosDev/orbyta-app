import { useEffect, useState } from 'react';
import { View, type DimensionValue, type ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { sheenTranslateX } from '../../motion/motion-math';
import { useAppActive } from '../../motion/use-app-active';
import { glassGeometry, timing } from '../../tokens';
import { GradientFill } from '../gradient-fill/gradient-fill';

/** line: renglón de texto · block: tarjeta o gráfico · circle: avatar o ícono. */
export type SkeletonShape = 'line' | 'block' | 'circle';

export interface SkeletonProps extends Pick<ViewProps, 'style' | 'testID'> {
  shape?: SkeletonShape;
  /** Ancho (por defecto todo el disponible; el círculo usa `height`). */
  width?: DimensionValue;
  /** Alto en px: línea 12, bloque 96, círculo 40 por defecto. */
  height?: number;
}

const DEFAULT_HEIGHT: Record<SkeletonShape, number> = { line: 12, block: 96, circle: 40 };

/**
 * P20 · Skeleton: forma gris con el barrido del reflejo en bucle (M13, 1200 ms). Es decorativo:
 * quien lo usa marca la zona como ocupada (`accessibilityState={{ busy: true }}`). Con "reducir
 * movimiento" o la app en segundo plano queda quieto.
 */
export function Skeleton({ shape = 'line', width, height, style, testID }: SkeletonProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive();
  const [boxWidth, setBoxWidth] = useState(0);
  const progress = useSharedValue(0);
  const side = height ?? DEFAULT_HEIGHT[shape];
  const stripeWidth = boxWidth * glassGeometry.sheen.widthRatio;
  const sweeping = !reduceMotion && appActive;

  useEffect(() => {
    if (!sweeping) {
      cancelAnimation(progress);
      progress.set(0);
      return undefined;
    }
    progress.set(0);
    progress.set(
      withRepeat(
        withTiming(1, {
          duration: timing.skeleton,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
      ),
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [progress, sweeping]);

  const stripeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sheenTranslateX(progress.get(), boxWidth, stripeWidth) }],
  }));

  // El color se calcula aquí y no dentro de StyleSheet.create: en web, ahí el tema llega como
  // variables CSS (`var(--colors-ink-subtle)`) y no se le puede cambiar el alfa.
  const fill = withAlpha(theme.colors.inkSubtle, 0.22);
  const peak = theme.glass.sheenPeak;
  const gradient = {
    angleDeg: 90,
    stops: [
      { offset: 0, color: withAlpha(peak, 0) },
      { offset: 0.5, color: peak },
      { offset: 1, color: withAlpha(peak, 0) },
    ],
  };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.shape(shape, side, shape === 'circle' ? side : (width ?? '100%'), fill),
        style,
      ]}
      testID={testID}
      onLayout={(event) => {
        setBoxWidth(event.nativeEvent.layout.width);
      }}
    >
      {sweeping && boxWidth > 0 ? (
        <Animated.View style={[styles.stripe(stripeWidth), stripeStyle]}>
          <GradientFill gradient={gradient} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  shape: (shape: SkeletonShape, height: number, width: DimensionValue, fill: string) => ({
    width,
    height,
    overflow: 'hidden',
    borderRadius:
      shape === 'circle' ? height / 2 : shape === 'line' ? theme.radius.xs : theme.radius.l,
    backgroundColor: fill,
  }),
  stripe: (stripeWidth: number) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: stripeWidth,
  }),
}));

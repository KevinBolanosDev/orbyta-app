import { useState } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { fillParent } from '../../lib/fill-parent';
import { sheenTranslateX } from '../../motion/motion-math';
import { useSheen, type SheenMode } from '../../motion/use-sheen';
import { glassGeometry } from '../../tokens';
import { GradientFill } from '../gradient-fill/gradient-fill';

export interface HoloSheenProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** `manual`: barre al montar y al cambiar `trigger`. `idle`: además cada 6 s (una superficie). */
  mode?: SheenMode;
  trigger?: unknown;
}

const { angleDeg, widthRatio, staticOpacity } = glassGeometry.sheen;

/**
 * P36 · HoloSheen: franja de reflejo (−20°, 28 % del ancho) que cruza a su contenedor (M08).
 * Va por encima del contenido, recortada a la superficie y sin capturar toques ni lector de pantalla.
 * Solo en tarjetas héroe, HoloCard, AchievementToast y LevelBadge; nunca en listas ni formularios.
 */
export function HoloSheen({ mode = 'manual', trigger, style, testID }: HoloSheenProps) {
  const { theme } = useUnistyles();
  const [width, setWidth] = useState(0);
  const { progress, reduceMotion } = useSheen({ mode, trigger });
  const stripeWidth = width * widthRatio;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sheenTranslateX(progress.get(), width, stripeWidth) },
      { rotate: `${angleDeg}deg` },
    ],
  }));

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
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.clip, style]}
      testID={testID}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            styles.stripe(stripeWidth),
            reduceMotion ? styles.static : undefined,
            animatedStyle,
          ]}
        >
          <GradientFill gradient={gradient} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    ...fillParent,
    overflow: 'hidden',
  },
  // Más alta que la tarjeta para que, inclinada, la cruce de arriba abajo.
  stripe: (stripeWidth: number) => ({
    position: 'absolute',
    top: '-50%',
    bottom: '-50%',
    left: 0,
    width: stripeWidth,
  }),
  static: {
    opacity: staticOpacity,
  },
});

import { useEffect, useId, useRef } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { cssAngleToSvgVector } from '../lib/gradient';
import { useReduceMotion } from '../motion/accessibility-preferences';
import { springConfig, timingConfig } from '../motion/easing';
import { triggerHaptic } from '../motion/haptics';
import { Text } from '../primitives/text/text';
import { componentSize, duration, holoGradient, spring, timing } from '../tokens';

import { hexagonPoints, roundedPolygonPath, sheenStripePath } from './game-math';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type LevelBadgeSize = keyof typeof componentSize.levelBadge;

export interface LevelBadgeProps extends Pick<ViewProps, 'style' | 'testID'> {
  level: number;
  /** s: 32 (listas, avatar) · m: 48 (encabezados) · l: 72 (perfil, logros). */
  size?: LevelBadgeSize;
  /** Nivel y título para el lector de pantalla ("Nivel 12, Estratega"). */
  accessibilityLabel: string;
}

/** Escala al subir de nivel antes de volver a 1 con el resorte de recompensa. */
const LEVEL_UP_SCALE = 1.18;

/**
 * X01 · LevelBadge: hexágono con el degradado holo y el número de nivel. Al subir de nivel late
 * (resorte de recompensa), suena la háptica de éxito y lo cruza el reflejo M08. El reflejo se
 * dibuja dentro del SVG para quedar recortado al hexágono (una View solo recorta rectángulos).
 */
export function LevelBadge({
  level,
  size = 'm',
  accessibilityLabel,
  style,
  testID,
}: LevelBadgeProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const id = `level-${useId().replace(/[^\w-]/g, '')}`;
  const side = componentSize.levelBadge[size];
  const hexagon = roundedPolygonPath(hexagonPoints(side, 1), side * 0.14);
  const vector = cssAngleToSvgVector(holoGradient.angleDeg);

  // 1 = franja fuera del hexágono (en reposo no se ve).
  const sheen = useSharedValue(1);
  const scale = useSharedValue(1);
  const shownLevelRef = useRef(level);

  useEffect(() => {
    const previous = shownLevelRef.current;
    shownLevelRef.current = level;
    if (level <= previous) return;
    triggerHaptic('success');
    if (reduceMotion) return;
    sheen.set(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, timingConfig(timing.sheen, 'sineInOut')),
      ),
    );
    scale.set(
      withSequence(
        withTiming(LEVEL_UP_SCALE, timingConfig(duration.fast, 'power2Out')),
        withSpring(1, springConfig(spring.reward)),
      ),
    );
  }, [level, reduceMotion, scale, sheen]);

  const stripeProps = useAnimatedProps(() => ({ d: sheenStripePath(sheen.get(), side) }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.root(side), style]}
      testID={testID}
    >
      <Animated.View style={[styles.fill, popStyle]}>
        <Svg width={side} height={side}>
          <Defs>
            <LinearGradient id={`${id}-holo`} {...vector}>
              {holoGradient.stops.map((stop) => (
                <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </LinearGradient>
            <ClipPath id={`${id}-clip`}>
              <Path d={hexagon} />
            </ClipPath>
          </Defs>
          <Path d={hexagon} fill={`url(#${id}-holo)`} />
          <G clipPath={`url(#${id}-clip)`}>
            <AnimatedPath fill={theme.glass.sheenPeak} animatedProps={stripeProps} />
          </G>
          {/* Borde de vidrio: una línea clara de 1 px sobre el degradado. */}
          <Path d={hexagon} fill="none" stroke={theme.glass.sheenPeak} strokeWidth={1} />
        </Svg>
        <View style={styles.center}>
          <Text allowFontScaling={false} style={styles.number(side)}>
            {level.toString()}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: (side: number) => ({
    width: side,
    height: side,
  }),
  fill: {
    flex: 1,
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: (side: number) => ({
    color: holoGradient.ink,
    fontFamily: theme.font.display700,
    fontSize: Math.round(side * 0.4),
    lineHeight: Math.round(side * 0.5),
  }),
}));

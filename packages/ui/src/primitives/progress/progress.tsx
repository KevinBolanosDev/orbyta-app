import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { useProgressFill } from '../../motion/use-progress-fill';
import { componentSize, type SemanticColors } from '../../tokens';

import { budgetTone, progressPercent, ringGeometry, type ProgressTone } from './progress-math';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** `auto` elige el tono por lo usado: sano, al límite (≥ 80 %) o excedido (≥ 100 %). */
export type ProgressToneProp = ProgressTone | 'auto';

interface ProgressCommonProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Avance de 0 a 1. Puede pasar de 1 (presupuesto excedido): se dibuja lleno. */
  value: number;
  tone?: ProgressToneProp;
  /** Qué mide, por ejemplo "Presupuesto de comida". */
  accessibilityLabel: string;
  /** Lo que lee el lector de pantalla en vez del porcentaje ("$ 450.000 de $ 600.000"). */
  valueText?: string;
}

function toneColor(colors: SemanticColors, tone: ProgressToneProp, value: number): string {
  const resolved = tone === 'auto' ? budgetTone(value) : tone;
  return {
    primary: colors.primary,
    healthy: colors.gain,
    limit: colors.warning,
    exceeded: colors.loss,
  }[resolved];
}

function progressA11y(value: number, accessibilityLabel: string, valueText?: string) {
  return {
    accessible: true,
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel,
    accessibilityValue: {
      min: 0,
      max: 100,
      now: progressPercent(value),
      ...(valueText ? { text: valueText } : {}),
    },
  };
}

export interface ProgressBarProps extends ProgressCommonProps {
  /** thin: 4 px (tarjetas héroe, arranque) · regular: 8 px. */
  size?: 'thin' | 'regular';
}

/** P18 · ProgressBar: barra lineal que se llena con M05 (1000 ms, `power3.out`). */
export function ProgressBar({
  value,
  tone = 'primary',
  size = 'regular',
  accessibilityLabel,
  valueText,
  style,
  testID,
}: ProgressBarProps) {
  const { theme } = useUnistyles();
  const progress = useProgressFill(value);
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  // Los colores con alfa se calculan aquí: en web, dentro de StyleSheet.create son variables CSS.
  const track = withAlpha(theme.colors.inkSubtle, 0.22);
  const color = toneColor(theme.colors, tone, value);

  return (
    <View
      {...progressA11y(value, accessibilityLabel, valueText)}
      style={[styles.track(componentSize.progressBar[size], track), style]}
      testID={testID}
    >
      <Animated.View style={[styles.fill(color), fillStyle]} />
    </View>
  );
}

export interface ProgressRingProps extends ProgressCommonProps {
  /** Diámetro en px (96 por defecto). */
  size?: number;
  strokeWidth?: number;
  /** Contenido del centro (cifra, ícono). */
  children?: ReactNode;
}

/** P19 · ProgressRing: anillo que se llena con M05 desde arriba, con contenido en el centro. */
export function ProgressRing({
  value,
  tone = 'primary',
  size = componentSize.progressRing.size,
  strokeWidth = componentSize.progressRing.strokeWidth,
  accessibilityLabel,
  valueText,
  children,
  style,
  testID,
}: ProgressRingProps) {
  const { theme } = useUnistyles();
  const progress = useProgressFill(value);
  const { center, radius, circumference } = ringGeometry(size, strokeWidth);
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
    // En 0 el extremo redondeado dejaría un punto.
    strokeOpacity: progress.get() > 0.001 ? 1 : 0,
  }));
  const track = withAlpha(theme.colors.inkSubtle, 0.22);
  const color = toneColor(theme.colors, tone, value);

  return (
    <View
      {...progressA11y(value, accessibilityLabel, valueText)}
      style={[styles.ring(size), style]}
      testID={testID}
    >
      {/* Girado −90°: el trazo de un círculo SVG arranca a la derecha y aquí debe empezar arriba. */}
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          fill="none"
          animatedProps={arcProps}
        />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: (height: number, color: string) => ({
    height,
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    backgroundColor: color,
  }),
  fill: (color: string) => ({
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: color,
  }),
  ring: (size: number) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
}));

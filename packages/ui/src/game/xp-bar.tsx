import { useEffect, useRef } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../lib/color';
import { formatCount, type NumberLocale } from '../lib/format-number';
import { useReduceMotion } from '../motion/accessibility-preferences';
import { timingConfig } from '../motion/easing';
import { clampProgress } from '../motion/motion-math';
import { Text } from '../primitives/text/text';
import { componentSize, timing } from '../tokens';

export interface XPBarProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** XP dentro del nivel actual (`levelFromXp(...).current`). */
  current: number;
  /** XP que pide el nivel para subir (`levelFromXp(...).goal`). */
  goal: number;
  /** Nivel actual: si sube, la barra se llena hasta el final y vuelve a empezar. */
  level?: number;
  locale?: NumberLocale;
  /** Texto a la izquierda ("Nivel 12 · Estratega"). */
  label?: string;
  /** Qué mide, para el lector de pantalla ("Experiencia del nivel 12"). */
  accessibilityLabel: string;
}

/**
 * X02 · XPBar: barra de experiencia con "2.450 / 3.600 XP". Se llena con M05 (1000 ms,
 * `power3.out`). Si `level` sube, primero completa la barra, luego arranca de 0 hasta el avance
 * del nivel nuevo: así no "retrocede". Con "reducir movimiento" salta al valor.
 */
export function XPBar({
  current,
  goal,
  level,
  locale = 'es-CO',
  label,
  accessibilityLabel,
  style,
  testID,
}: XPBarProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const target = clampProgress(goal > 0 ? current / goal : 0);
  const fill = useSharedValue(reduceMotion ? target : 0);
  const levelRef = useRef(level);

  useEffect(() => {
    const leveledUp =
      level !== undefined && levelRef.current !== undefined && level > levelRef.current;
    levelRef.current = level;
    if (reduceMotion) {
      fill.set(target);
      return;
    }
    const toTarget = withTiming(target, timingConfig(timing.progressFill, 'power3Out'));
    fill.set(
      leveledUp
        ? withSequence(
            withTiming(1, timingConfig(timing.progressFill / 2, 'power3Out')),
            withTiming(0, { duration: 0 }),
            toTarget,
          )
        : toTarget,
    );
  }, [fill, level, reduceMotion, target]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));
  const amount = `${formatCount(current, locale)} / ${formatCount(goal, locale)} XP`;

  return (
    <View style={[styles.root, style]} testID={testID}>
      <View style={styles.header}>
        {label ? (
          <Text variant="label" numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        ) : null}
        <Text variant="caption" tone="muted" style={styles.amount}>
          {amount}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100), text: amount }}
        style={styles.track(withAlpha(theme.colors.inkSubtle, 0.22))}
      >
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.space[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  label: {
    flexShrink: 1,
  },
  amount: {
    marginLeft: 'auto',
    fontFamily: theme.font.mono500,
  },
  track: (color: string) => ({
    height: componentSize.progressBar.regular,
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    backgroundColor: color,
  }),
  // La XP siempre va en `primary`, también dentro de un módulo (§11.6).
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
}));

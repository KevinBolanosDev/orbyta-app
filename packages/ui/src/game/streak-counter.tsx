import Flame from 'lucide-react-native/icons/flame';
import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { formatCount, type NumberLocale } from '../lib/format-number';
import { useReduceMotion } from '../motion/accessibility-preferences';
import { timingConfig } from '../motion/easing';
import { useAppActive } from '../motion/use-app-active';
import { Icon } from '../primitives/icon/icon';
import { Text } from '../primitives/text/text';
import { timing } from '../tokens';

export interface StreakCounterProps extends Pick<ViewProps, 'style' | 'testID'> {
  days: number;
  /** Unidad junto al número ("días"). */
  unit: string;
  /** Hoy aún no se registra: la llama pasa a `warning` y late suave. */
  atRisk?: boolean;
  /** Aviso bajo la cifra cuando está en riesgo ("Registra hoy para no perderla"). */
  riskLabel?: string;
  locale?: NumberLocale;
  /** Para el lector de pantalla ("Racha de 12 días, en riesgo"). */
  accessibilityLabel: string;
}

/** Pulso suave en riesgo: escala de la llama. */
const PULSE_SCALE = 1.12;

/**
 * X03 · StreakCounter: llama y días de racha. En riesgo (hoy aún no se registra) cambia a `warning`
 * y la llama late suave (sube y baja en 1,2 s, en bucle). El pulso se para con la app en segundo
 * plano y con "reducir movimiento"; el color y el aviso quedan.
 */
export function StreakCounter({
  days,
  unit,
  atRisk = false,
  riskLabel,
  locale = 'es-CO',
  accessibilityLabel,
  style,
  testID,
}: StreakCounterProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive();
  const pulse = useSharedValue(0);
  const pulsing = atRisk && !reduceMotion && appActive;

  useEffect(() => {
    if (pulsing) {
      pulse.set(withRepeat(withTiming(1, timingConfig(timing.streakPulse, 'sineInOut')), -1, true));
    } else {
      cancelAnimation(pulse);
      pulse.set(withTiming(0, timingConfig(timing.reducedMotionFade, 'power2Out')));
    }
    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse, pulsing]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (PULSE_SCALE - 1) * pulse.get() }],
  }));
  const color = atRisk ? theme.colors.warning : theme.colors.primary;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, style]}
      testID={testID}
    >
      <View style={styles.row}>
        <Animated.View style={flameStyle}>
          <Icon icon={Flame} size="nav" color={color} />
        </Animated.View>
        <Text variant="numM" style={styles.days(color)}>
          {formatCount(days, locale)}
        </Text>
        <Text variant="label" tone="muted">
          {unit}
        </Text>
      </View>
      {atRisk && riskLabel ? (
        <Text variant="caption" tone="warning">
          {riskLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.space[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
  },
  days: (color: string) => ({
    color,
  }),
}));

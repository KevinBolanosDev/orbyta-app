import { useEffect } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { timingConfig } from '../../motion/easing';
import { triggerHaptic } from '../../motion/haptics';
import { duration } from '../../tokens';
import { Text } from '../text/text';

export interface SwitchProps extends Pick<ViewProps, 'style' | 'testID'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** La etiqueta es parte del control: toda la fila se puede tocar. */
  label: string;
  description?: string;
  disabled?: boolean;
}

const TRACK = { width: 52, height: 32 };
const THUMB = 26;
const INSET = (TRACK.height - THUMB) / 2;
const TRAVEL = TRACK.width - THUMB - INSET * 2;

/** P14 · Switch: encendido o apagado con etiqueta; el pulgar se desliza en 200 ms. */
export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
  testID,
}: SwitchProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const on = useSharedValue(value ? 1 : 0);
  // Colores reales (no variables CSS) para interpolar.
  const offColor = withAlpha(theme.colors.inkSubtle, 0.35);
  const onColor = theme.colors.primary;

  useEffect(() => {
    const target = value ? 1 : 0;
    on.set(reduceMotion ? target : withTiming(target, timingConfig(duration.fast, 'power2Out')));
  }, [value, reduceMotion, on]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.get(), [0, 1], [offColor, onColor]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: on.get() * TRAVEL }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => {
        triggerHaptic('selection');
        onValueChange(!value);
      }}
      style={[styles.row(disabled), style]}
      testID={testID}
    >
      <View style={styles.texts}>
        <Text>{label}</Text>
        {description ? (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: (disabled: boolean) => ({
    minHeight: theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    opacity: disabled ? 0.45 : 1,
  }),
  texts: {
    flex: 1,
    gap: 2,
  },
  track: {
    width: TRACK.width,
    height: TRACK.height,
    padding: INSET,
    borderRadius: theme.radius.pill,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    boxShadow: theme.elevation.e1,
  },
}));

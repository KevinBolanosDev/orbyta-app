import { useState } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { focusRing } from '../../lib/focus-ring';
import { triggerHaptic } from '../../motion/haptics';
import { useSlideIndicator, type SlotLayout } from '../../motion/use-slide-indicator';
import { Icon, IconColorProvider, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconComponent;
}

export interface SegmentedControlProps<T extends string> extends Pick<
  ViewProps,
  'style' | 'testID'
> {
  /** De 2 a 5 opciones (llegan traducidas). */
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nombre del grupo para el lector de pantalla ("Tema", "Período"). */
  accessibilityLabel: string;
  /** Ocupa todo el ancho y reparte las opciones en partes iguales. */
  fullWidth?: boolean;
}

/**
 * P12 · SegmentedControl: opciones excluyentes en una pastilla de vidrio; la pastilla activa se
 * desliza a la opción elegida (M06) con háptica de selección. Para el lector de pantalla es un grupo
 * de opciones de radio.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  fullWidth = false,
  style,
  testID,
}: SegmentedControlProps<T>) {
  const { theme } = useUnistyles();
  const [layouts, setLayouts] = useState<Partial<Record<T, SlotLayout>>>({});
  const pillStyle = useSlideIndicator(layouts[value]);

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track(fullWidth), style]}
      testID={testID}
    >
      <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
      {options.map((option) => {
        const selected = option.value === value;
        const color = selected ? theme.colors.onPrimary : theme.colors.ink;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (selected) return;
              triggerHaptic('selection');
              onChange(option.value);
            }}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              setLayouts((current) => ({ ...current, [option.value]: { x, width } }));
            }}
            // El relleno del contenedor también toca la opción: el objetivo llega a 44 px de alto.
            hitSlop={{ top: PADDING, bottom: PADDING }}
            style={[styles.segment(fullWidth), styles.focus]}
          >
            <IconColorProvider color={color}>
              {option.icon ? <Icon icon={option.icon} size="inline" /> : null}
              <Text variant="label" numberOfLines={1} style={styles.label(color)}>
                {option.label}
              </Text>
            </IconColorProvider>
          </Pressable>
        );
      })}
    </View>
  );
}

const PADDING = 4;

const styles = StyleSheet.create((theme) => ({
  focus: focusRing(theme.colors.focus),
  track: (fullWidth: boolean) => ({
    flexDirection: 'row',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    padding: PADDING,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
  }),
  pill: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: 0,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    boxShadow: theme.elevation.glow,
  },
  // Con el padding del riel, cada opción mide 44 de alto (objetivo táctil mínimo).
  segment: (fullWidth: boolean) => ({
    flex: fullWidth ? 1 : undefined,
    minHeight: theme.layout.minTouchTarget - PADDING * 2,
    minWidth: theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
  }),
  label: (color: string) => ({
    color,
  }),
}));

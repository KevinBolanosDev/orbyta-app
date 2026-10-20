import Check from 'lucide-react-native/icons/check';
import Minus from 'lucide-react-native/icons/minus';
import { useEffect } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { focusRing } from '../../lib/focus-ring';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { timingConfig } from '../../motion/easing';
import { triggerHaptic } from '../../motion/haptics';
import { Icon } from '../icon/icon';
import { Text } from '../text/text';

/** P15: la marca aparece en 150 ms. */
const MARK_DURATION = 150;
const BOX = 22;

/** Escala de la marca (0 → 1) cuando se marca; con "reducir movimiento", sin animar. */
function useMark(checked: boolean) {
  const reduceMotion = useReduceMotion();
  const mark = useSharedValue(checked ? 1 : 0);
  useEffect(() => {
    const target = checked ? 1 : 0;
    mark.set(reduceMotion ? target : withTiming(target, timingConfig(MARK_DURATION, 'power2Out')));
  }, [checked, reduceMotion, mark]);
  return useAnimatedStyle(() => ({ opacity: mark.get(), transform: [{ scale: mark.get() }] }));
}

interface ChoiceRowProps extends Pick<ViewProps, 'style' | 'testID'> {
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxProps extends ChoiceRowProps {
  /** `mixed`: algunos de un grupo están marcados (muestra un guion). */
  checked: boolean | 'mixed';
  onChange: (checked: boolean) => void;
}

/** P15 · Checkbox: casilla con su etiqueta; toda la fila se puede tocar. */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  style,
  testID,
}: CheckboxProps) {
  const { theme } = useUnistyles();
  const active = checked !== false;
  const markStyle = useMark(active);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        triggerHaptic('selection');
        onChange(checked !== true);
      }}
      style={[styles.row(disabled), styles.focus, style]}
      testID={testID}
    >
      <View style={styles.box(active)}>
        <Animated.View style={markStyle}>
          <Icon
            icon={checked === 'mixed' ? Minus : Check}
            size="inline"
            color={theme.colors.onPrimary}
          />
        </Animated.View>
      </View>
      <ChoiceTexts label={label} description={description} />
    </Pressable>
  );
}

export interface RadioProps extends ChoiceRowProps {
  selected: boolean;
  onSelect: () => void;
}

/** P15 · Radio: una opción de un grupo excluyente; toda la fila se puede tocar. */
export function Radio({
  selected,
  onSelect,
  label,
  description,
  disabled = false,
  style,
  testID,
}: RadioProps) {
  const markStyle = useMark(selected);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => {
        if (selected) return;
        triggerHaptic('selection');
        onSelect();
      }}
      style={[styles.row(disabled), styles.focus, style]}
      testID={testID}
    >
      <View style={styles.circle(selected)}>
        <Animated.View style={[styles.dot, markStyle]} />
      </View>
      <ChoiceTexts label={label} description={description} />
    </Pressable>
  );
}

export interface RadioGroupProps<T extends string> extends Pick<ViewProps, 'style' | 'testID'> {
  /** Nombre del grupo para el lector de pantalla. */
  accessibilityLabel: string;
  options: readonly { value: T; label: string; description?: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Grupo de Radio con su rol de grupo para el lector de pantalla. */
export function RadioGroup<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
  disabled,
  style,
  testID,
}: RadioGroupProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group, style]}
      testID={testID}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          {...(option.description === undefined ? {} : { description: option.description })}
          selected={option.value === value}
          disabled={disabled}
          onSelect={() => {
            onChange(option.value);
          }}
        />
      ))}
    </View>
  );
}

function ChoiceTexts({ label, description }: { label: string; description: string | undefined }) {
  return (
    <View style={styles.texts}>
      <Text>{label}</Text>
      {description ? (
        <Text variant="caption" tone="muted">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  focus: focusRing(theme.colors.focus),
  row: (disabled: boolean) => ({
    minHeight: theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    opacity: disabled ? 0.45 : 1,
  }),
  texts: {
    flex: 1,
    gap: 2,
  },
  box: (checked: boolean) => ({
    width: BOX,
    height: BOX,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xs - 2,
    borderWidth: 2,
    borderColor: checked ? theme.colors.primary : theme.colors.inkSubtle,
    backgroundColor: checked ? theme.colors.primary : 'transparent',
  }),
  circle: (selected: boolean) => ({
    width: BOX,
    height: BOX,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: selected ? theme.colors.primary : theme.colors.inkSubtle,
  }),
  dot: {
    width: BOX / 2,
    height: BOX / 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  group: {
    gap: theme.space[1],
  },
}));

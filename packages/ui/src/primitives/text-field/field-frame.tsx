import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '../text/text';

/** m: 48 de alto (formularios) · l: 64 (registro rápido de montos). */
export type FieldSize = 'm' | 'l';

export interface FieldFrameProps {
  label: string;
  /** Algo a la derecha de la etiqueta (por ejemplo, el selector de moneda). */
  labelAccessory?: ReactNode;
  helper?: string | undefined;
  /** Si hay error, reemplaza a la ayuda y pinta el borde en `loss`. */
  error?: string | undefined;
  /** Texto a la derecha de la ayuda ("12/40"). */
  counter?: string | undefined;
  style?: StyleProp<ViewStyle>;
  testID?: string | undefined;
  children: ReactNode;
}

/**
 * Marco común de los campos (TextField, MoneyInput, Select, DatePicker): etiqueta arriba, el campo y
 * debajo la ayuda o el error, con el contador a la derecha. El error se anuncia al aparecer.
 */
export function FieldFrame({
  label,
  labelAccessory,
  helper,
  error,
  counter,
  style,
  testID,
  children,
}: FieldFrameProps) {
  const note = error ?? helper;
  return (
    <View style={[styles.frame, style]} testID={testID}>
      <View style={styles.labelRow}>
        <Text variant="label" tone="muted" style={styles.label}>
          {label}
        </Text>
        {labelAccessory}
      </View>
      {children}
      {note !== undefined || counter !== undefined ? (
        <View style={styles.noteRow}>
          {note === undefined ? (
            <View style={styles.note} />
          ) : (
            <Text
              variant="caption"
              tone={error === undefined ? 'muted' : 'loss'}
              accessibilityLiveRegion={error === undefined ? 'none' : 'polite'}
              style={styles.note}
            >
              {note}
            </Text>
          )}
          {counter === undefined ? null : (
            <Text variant="caption" tone="subtle">
              {counter}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

export interface FieldBoxProps {
  focused?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Caja de vidrio del campo: borde `primary` con glow al enfocar, `loss` con error, atenuada si no se puede usar. */
export function FieldBox({
  focused = false,
  invalid = false,
  disabled = false,
  size = 'm',
  style,
  children,
}: FieldBoxProps) {
  return <View style={[styles.box(focused, invalid, disabled, size), style]}>{children}</View>;
}

export const FIELD_HEIGHT: Record<FieldSize, number> = { m: 48, l: 64 };

const styles = StyleSheet.create((theme) => ({
  frame: {
    gap: theme.space[2],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  label: {
    flex: 1,
  },
  noteRow: {
    flexDirection: 'row',
    gap: theme.space[3],
  },
  note: {
    flex: 1,
  },
  box: (focused: boolean, invalid: boolean, disabled: boolean, size: FieldSize) => ({
    minHeight: FIELD_HEIGHT[size],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: invalid
      ? theme.colors.loss
      : focused
        ? theme.colors.primary
        : theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
    boxShadow: focused && !invalid ? theme.elevation.glow : undefined,
    opacity: disabled ? 0.45 : 1,
  }),
}));

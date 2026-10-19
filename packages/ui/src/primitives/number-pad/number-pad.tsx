import Delete from 'lucide-react-native/icons/delete';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { AmountKey } from '../../lib/amount-input';
import { NUMBER_SEPARATORS, type NumberLocale } from '../../lib/format-number';
import { usePress } from '../../motion/use-press';
import { Icon } from '../icon/icon';
import { Text } from '../text/text';

export interface NumberPadProps extends Pick<ViewProps, 'style' | 'testID'> {
  onKey: (key: AmountKey) => void;
  /** Mantener presionado borrar vacía el monto. */
  onClear?: () => void;
  /** Decimales de la moneda: con 0 (COP) la tecla de abajo a la izquierda es `000`; si no, la coma. */
  decimals: number;
  locale?: NumberLocale;
  /** Nombre accesible de borrar ("Borrar"). */
  backspaceLabel: string;
  /** Nombre accesible del separador decimal ("Coma decimal"). */
  decimalLabel?: string;
  disabled?: boolean;
}

const ROWS: readonly (readonly AmountKey[])[] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

/**
 * P09 · NumberPad: teclado numérico propio en vidrio para registrar con un pulgar (0–9, `000` o el
 * separador decimal según la moneda, y borrar). Cada tecla tiene presión M02 con háptica ligera.
 * No guarda el valor: la pantalla lo lleva con `applyAmountKey`.
 */
export function NumberPad({
  onKey,
  onClear,
  decimals,
  locale = 'es-CO',
  backspaceLabel,
  decimalLabel,
  disabled = false,
  style,
  testID,
}: NumberPadProps) {
  const { theme } = useUnistyles();
  const extra: AmountKey = decimals > 0 ? 'decimal' : '000';
  const rows: readonly (readonly AmountKey[])[] = [...ROWS, [extra, '0', 'backspace']];

  return (
    <View style={[styles.pad, style]} testID={testID}>
      {rows.map((row) => (
        <View key={row.join()} style={styles.row}>
          {row.map((key) => (
            <PadKey
              key={key}
              disabled={disabled}
              accessibilityLabel={
                key === 'backspace'
                  ? backspaceLabel
                  : key === 'decimal'
                    ? (decimalLabel ?? NUMBER_SEPARATORS[locale].decimal)
                    : key
              }
              onPress={() => {
                onKey(key);
              }}
              onLongPress={key === 'backspace' ? onClear : undefined}
            >
              {key === 'backspace' ? (
                <Icon icon={Delete} size="nav" color={theme.colors.ink} />
              ) : (
                <Text variant="numL">
                  {key === 'decimal' ? NUMBER_SEPARATORS[locale].decimal : key}
                </Text>
              )}
            </PadKey>
          ))}
        </View>
      ))}
    </View>
  );
}

function PadKey({
  accessibilityLabel,
  disabled,
  onPress,
  onLongPress,
  children,
}: {
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
  onLongPress: (() => void) | undefined;
  children: React.ReactNode;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePress();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.keySlot}
    >
      <Animated.View style={[styles.key(disabled), animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

const KEY_HEIGHT = 56;

const styles = StyleSheet.create((theme) => ({
  pad: {
    gap: theme.space[2],
  },
  row: {
    flexDirection: 'row',
    gap: theme.space[2],
  },
  keySlot: {
    flex: 1,
  },
  key: (disabled: boolean) => ({
    height: KEY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
    opacity: disabled ? 0.45 : 1,
  }),
}));

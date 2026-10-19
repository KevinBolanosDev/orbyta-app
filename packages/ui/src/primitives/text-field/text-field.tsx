import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { fontFamily, MAX_FONT_SCALE, typeScale } from '../../tokens';
import { Text } from '../text/text';

import { FieldBox, FieldFrame, type FieldSize } from './field-frame';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'editable'> {
  /** Etiqueta visible; también es el nombre accesible del campo. */
  label: string;
  helper?: string;
  /** Mensaje de error (ya traducido); el campo queda en rojo. */
  error?: string;
  /** Antes del texto: un símbolo ("$", "%") o un ícono. */
  prefix?: ReactNode;
  /** Después del texto: una unidad ("COP", "días") o un botón. */
  suffix?: ReactNode;
  /** Muestra "12/40"; necesita `maxLength`. */
  showCounter?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  /** Algo a la derecha de la etiqueta. */
  labelAccessory?: ReactNode;
  /** Contenedor del campo completo. */
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/**
 * P07 · TextField: etiqueta, campo de vidrio, ayuda o error y contador, con prefijo y sufijo. Foco:
 * borde `primary` con glow; error: borde `loss` y el mensaje se lee como pista y se anuncia.
 */
export function TextField({
  label,
  helper,
  error,
  prefix,
  suffix,
  showCounter = false,
  disabled = false,
  size = 'm',
  labelAccessory,
  style,
  inputStyle,
  testID,
  value,
  maxLength,
  onFocus,
  onBlur,
  onChangeText,
  ref,
  ...inputProps
}: TextFieldProps) {
  const { theme } = useUnistyles();
  const [focused, setFocused] = useState(false);
  const [typed, setTyped] = useState(0);
  const length = value?.length ?? typed;
  const counter =
    showCounter && maxLength !== undefined
      ? `${length.toString()}/${maxLength.toString()}`
      : undefined;

  return (
    <FieldFrame
      label={label}
      labelAccessory={labelAccessory}
      helper={helper}
      error={error}
      counter={counter}
      style={style}
      testID={testID}
    >
      <FieldBox focused={focused} invalid={error !== undefined} disabled={disabled} size={size}>
        {typeof prefix === 'string' ? <Adornment text={prefix} size={size} /> : prefix}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          accessibilityState={{ disabled }}
          editable={!disabled}
          value={value}
          maxLength={maxLength}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          placeholderTextColor={theme.colors.inkSubtle}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onChangeText={(text) => {
            setTyped(text.length);
            onChangeText?.(text);
          }}
          style={[styles.input(size), inputStyle]}
          {...inputProps}
        />
        {typeof suffix === 'string' ? <Adornment text={suffix} size={size} /> : suffix}
      </FieldBox>
    </FieldFrame>
  );
}

function Adornment({ text, size }: { text: string; size: FieldSize }) {
  return (
    <Text variant={size === 'l' ? 'numL' : 'bodyL'} tone="muted">
      {text}
    </Text>
  );
}

const { bodyL, numL } = typeScale;

const styles = StyleSheet.create((theme) => ({
  // Texto de 17 px (no menos de 16, para que iOS no haga zoom); montos grandes en cifras tabulares.
  input: (size: FieldSize) => ({
    flex: 1,
    alignSelf: 'stretch',
    color: theme.colors.ink,
    fontFamily: size === 'l' ? fontFamily[numL.family] : fontFamily[bodyL.family],
    fontSize: size === 'l' ? numL.compact.fontSize : bodyL.compact.fontSize,
    fontVariant: size === 'l' ? ['tabular-nums'] : undefined,
    paddingVertical: theme.space[2],
    // El borde de la caja ya marca el foco.
    _web: { outlineStyle: 'none' },
  }),
}));

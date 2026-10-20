import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { focusRing } from '../../lib/focus-ring';
import { usePress } from '../../motion/use-press';
import { Icon, IconColorProvider, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'm' | 's';

export interface ButtonProps extends Pick<
  PressableProps,
  'onPress' | 'testID' | 'accessibilityHint'
> {
  style?: StyleProp<ViewStyle>;
  /** Texto del botón (llega traducido desde @repo/i18n). */
  label: string;
  /** primary: sólido con glow · secondary: vidrio · ghost: solo texto · danger: destructivo. */
  variant?: ButtonVariant;
  /** m: 48 de alto · s: 40 (con área táctil de 44). */
  size?: ButtonSize;
  icon?: IconComponent;
  /** Muestra un spinner y no responde a toques. */
  loading?: boolean;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
}

const HEIGHT: Record<ButtonSize, number> = { m: 48, s: 40 };

/**
 * P03 · Button. Presión M02 (escala 0,96 con resorte y háptica ligera). Con `loading` o `disabled`
 * queda `aria-disabled` y no anima. En web, con teclado, muestra el anillo de foco (`focusRing`).
 */
export function Button({
  label,
  variant = 'primary',
  size = 'm',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useUnistyles();
  const { animatedStyle, onPressIn, onPressOut } = usePress();
  const inactive = disabled || loading;
  const contentColor = {
    primary: theme.colors.onPrimary,
    danger: theme.colors.onPrimary,
    secondary: theme.colors.ink,
    ghost: theme.colors.primary,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={size === 's' ? (theme.layout.minTouchTarget - HEIGHT.s) / 2 : undefined}
      style={[styles.pressable(fullWidth), styles.focus, style]}
      testID={testID}
    >
      <Animated.View style={[styles.body(variant, size, inactive), animatedStyle]}>
        <IconColorProvider color={contentColor}>
          {loading ? (
            <ActivityIndicator size="small" color={contentColor} />
          ) : icon ? (
            <Icon icon={icon} size={size === 'm' ? 'nav' : 'list'} />
          ) : null}
          <Text variant="label" style={styles.label(contentColor)}>
            {label}
          </Text>
        </IconColorProvider>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  focus: focusRing(theme.colors.focus),
  pressable: (fullWidth: boolean) => ({
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  }),
  body: (variant: ButtonVariant, size: ButtonSize, inactive: boolean) => ({
    minHeight: HEIGHT[size],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    paddingHorizontal: size === 'm' ? theme.space[6] : theme.space[4],
    borderRadius: theme.radius.pill,
    borderWidth: variant === 'secondary' ? 1 : 0,
    borderColor: theme.glass.card.border,
    backgroundColor: {
      primary: theme.colors.primary,
      danger: theme.colors.loss,
      secondary: theme.glass.card.fill,
      ghost: 'transparent',
    }[variant],
    boxShadow: variant === 'primary' && !inactive ? theme.elevation.glow : undefined,
    opacity: inactive ? 0.45 : 1,
  }),
  label: (color: string) => ({
    color,
  }),
}));

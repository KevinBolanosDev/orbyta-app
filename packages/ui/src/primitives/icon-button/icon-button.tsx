import { Pressable, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { usePress } from '../../motion/use-press';
import { Icon, type IconComponent } from '../icon/icon';
import type { TextTone } from '../text/text';

export type IconButtonVariant = 'glass' | 'plain';

export interface IconButtonProps extends Pick<PressableProps, 'onPress' | 'testID' | 'style'> {
  icon: IconComponent;
  /** Obligatorio: es lo único que dice qué hace el botón (§7.1). */
  accessibilityLabel: string;
  /** glass: círculo de vidrio · plain: transparente. */
  variant?: IconButtonVariant;
  tone?: TextTone;
  disabled?: boolean;
  /** Para botones de alternar (modo privado): marca el estado seleccionado. */
  selected?: boolean;
}

/** P04 · IconButton: 44 × 44 como mínimo, con presión M02. */
export function IconButton({
  icon,
  accessibilityLabel,
  variant = 'glass',
  tone,
  disabled = false,
  selected,
  onPress,
  style,
  testID,
}: IconButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePress();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, ...(selected === undefined ? {} : { selected }) }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
      testID={testID}
    >
      <Animated.View style={[styles.body(variant, disabled), animatedStyle]}>
        <Icon icon={icon} size="nav" {...(tone ? { tone } : {})} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  body: (variant: IconButtonVariant, disabled: boolean) => ({
    width: theme.layout.minTouchTarget,
    height: theme.layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: variant === 'glass' ? 1 : 0,
    borderColor: theme.glass.card.border,
    backgroundColor: variant === 'glass' ? theme.glass.card.fill : 'transparent',
    opacity: disabled ? 0.45 : 1,
  }),
}));

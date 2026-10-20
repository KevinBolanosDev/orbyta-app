import X from 'lucide-react-native/icons/x';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { focusRing } from '../../lib/focus-ring';
import { usePress } from '../../motion/use-press';
import { Icon, IconColorProvider, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

/** filter: se selecciona · input: valor puesto con × para quitarlo · category: color + ícono. */
export type ChipVariant = 'filter' | 'input' | 'category';

export interface ChipProps extends Pick<ViewProps, 'style' | 'testID'> {
  label: string;
  variant?: ChipVariant;
  /** `filter`: si está aplicado. */
  selected?: boolean;
  onPress?: () => void;
  /** `input`: quita el valor. */
  onRemove?: () => void;
  /** `input`: nombre accesible del ×, por ejemplo "Quitar Comida". */
  removeLabel?: string;
  /** `category`: color de la categoría (punto y borde). */
  color?: string;
  icon?: IconComponent;
}

const HEIGHT = 32;

/** P13 · Chip: 32 de alto con área táctil de 44 y presión M02. */
export function Chip({
  label,
  variant = 'filter',
  selected = false,
  onPress,
  onRemove,
  removeLabel,
  color,
  icon,
  style,
  testID,
}: ChipProps) {
  const { theme } = useUnistyles();
  const { animatedStyle, onPressIn, onPressOut } = usePress({ haptic: 'selection' });
  const active = variant === 'filter' && selected;
  const contentColor = active ? theme.colors.onPrimary : theme.colors.ink;
  const slop = (theme.layout.minTouchTarget - HEIGHT) / 2;

  const body = (
    <Animated.View
      style={[styles.body(active, variant === 'category' ? color : undefined), animatedStyle]}
    >
      <IconColorProvider color={contentColor}>
        {variant === 'category' && color ? <View style={styles.dot(color)} /> : null}
        {icon ? <Icon icon={icon} size="inline" /> : null}
        <Text variant="label" style={styles.label(contentColor)}>
          {label}
        </Text>
        {variant === 'input' && onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeLabel ?? label}
            onPress={onRemove}
            hitSlop={slop}
            style={[styles.remove, styles.focus]}
          >
            <Icon icon={X} size="inline" />
          </Pressable>
        ) : null}
      </IconColorProvider>
    </Animated.View>
  );

  if (!onPress) {
    return (
      <View style={style} testID={testID}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole={variant === 'filter' ? 'checkbox' : 'button'}
      accessibilityState={variant === 'filter' ? { checked: selected } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={slop}
      style={[styles.focus, style]}
      testID={testID}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  focus: focusRing(theme.colors.focus),
  body: (active: boolean, categoryColor: string | undefined) => ({
    height: HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: active ? theme.colors.primary : (categoryColor ?? theme.glass.card.border),
    backgroundColor: active ? theme.colors.primary : theme.glass.card.fill,
    boxShadow: active ? theme.elevation.e1 : undefined,
  }),
  dot: (color: string) => ({
    width: theme.space[2],
    height: theme.space[2],
    borderRadius: theme.radius.pill,
    backgroundColor: color,
  }),
  label: (color: string) => ({
    color,
  }),
  remove: {
    marginRight: -theme.space[1],
  },
}));

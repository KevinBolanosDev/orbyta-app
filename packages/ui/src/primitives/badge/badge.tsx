import { View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { Text } from '../text/text';

export type BadgeTone = 'neutral' | 'primary' | 'gain' | 'loss' | 'warning';

export interface BadgeProps extends Pick<ViewProps, 'style' | 'testID'> {
  tone?: BadgeTone;
  /** Texto o número. Sin él, la insignia es un punto. */
  label?: string | number;
  /** Tope para números: 120 con `max` 99 muestra "99+". */
  max?: number;
  /** Nombre accesible; obligatorio si es solo un punto o un número sin contexto. */
  accessibilityLabel?: string;
}

/** P16 · Badge: insignia con texto, con número o solo punto, en el tono de un estado. */
export function Badge({
  tone = 'neutral',
  label,
  max,
  accessibilityLabel,
  style,
  testID,
}: BadgeProps) {
  const { theme } = useUnistyles();
  const color = {
    neutral: theme.colors.inkMuted,
    primary: theme.colors.primary,
    gain: theme.colors.gain,
    loss: theme.colors.loss,
    warning: theme.colors.warning,
  }[tone];
  const text =
    typeof label === 'number' && max !== undefined && label > max ? `${max}+` : label?.toString();
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityLabel }
    : text === undefined
      ? {
          accessibilityElementsHidden: true,
          importantForAccessibility: 'no-hide-descendants' as const,
        }
      : {};

  if (text === undefined) {
    return <View {...a11y} style={[styles.dot(color), style]} testID={testID} />;
  }
  return (
    <View {...a11y} style={[styles.pill(color), style]} testID={testID}>
      <Text variant="caption" style={styles.text(color)}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  dot: (color: string) => ({
    width: theme.space[2],
    height: theme.space[2],
    borderRadius: theme.radius.pill,
    backgroundColor: color,
  }),
  pill: (color: string) => ({
    alignSelf: 'flex-start',
    minWidth: theme.space[5],
    paddingHorizontal: theme.space[2],
    paddingVertical: 2,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: withAlpha(color, 0.45),
    backgroundColor: withAlpha(color, 0.16),
  }),
  text: (color: string) => ({
    color,
    fontFamily: theme.font.body600,
  }),
}));

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';

interface SwatchProps {
  /** Color a pintar (valor del token). */
  color: string;
  /** Nombre del token o etiqueta. */
  name: string;
  /** Texto secundario; por defecto, el valor del color. */
  detail?: string;
}

/** Muestra de color con su nombre de token y su valor. */
export function Swatch({ color, name, detail = color }: SwatchProps) {
  return (
    <View style={styles.swatch} accessible accessibilityLabel={`${name} ${detail}`}>
      <View style={styles.chip(color)} />
      <View style={styles.texts}>
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1} style={styles.mono}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  swatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    width: { compact: '100%', medium: '48%', expanded: '31%' },
  },
  chip: (color: string) => ({
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius.s,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: color,
  }),
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  mono: {
    fontFamily: theme.font.mono400,
  },
}));

import { Image, View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '../text/text';

export interface AvatarProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Nombre de la persona, comercio o broker: da las iniciales y el nombre accesible. */
  name: string;
  /** Logo o foto; si no hay, se muestran las iniciales. */
  imageUri?: string;
  /** Lado en px (por defecto 40). */
  size?: number;
}

/** Hasta dos iniciales: primera letra de la primera y la última palabra. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toLocaleUpperCase();
}

/** Índice estable de color de categoría para un nombre (el mismo nombre, el mismo color). */
export function colorIndexOf(name: string, count: number): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return hash % count;
}

/** P17 · Avatar: logo o iniciales sobre un color de categoría. */
export function Avatar({ name, imageUri, size = 40, style, testID }: AvatarProps) {
  const { theme } = useUnistyles();
  const color =
    theme.categories[colorIndexOf(name, theme.categories.length)] ?? theme.colors.primary;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.circle(size, color), style]}
      testID={testID}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image(size)} />
      ) : (
        <Text variant="label" maxFontSizeMultiplier={1} style={styles.initials(size)}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  circle: (size: number, color: string) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
  }),
  image: (size: number) => ({
    width: size,
    height: size,
  }),
  initials: (size: number) => ({
    color: theme.colors.onPrimary,
    fontSize: size * 0.38,
    lineHeight: size * 0.5,
  }),
}));

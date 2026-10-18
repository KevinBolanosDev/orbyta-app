import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';

/** Bloque del catálogo: título de sección y su contenido. */
export function CatalogSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleL" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Subtítulo dentro de una sección. */
export function CatalogSubheading({ children }: { children: string }) {
  return (
    <Text variant="overline" tone="muted" accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.space[4],
  },
}));

import type { ReactNode } from 'react';
import { ScrollView, TextInput, View, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AuroraBackground, Text } from '@repo/ui';

// Piezas provisionales que todavía no existen en @repo/ui. Usan el tema de Cristal Aurora.

/**
 * Pantalla con fondo aurora y contenido con scroll y márgenes seguros.
 * TODO(F2): reemplazar por el layout de pantalla con AppHeader y tab bar (design-system.md §6.1).
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.column}>{children}</View>
      </ScrollView>
    </View>
  );
}

/** Campo de texto con etiqueta. TODO(F1.6): reemplazar por P07 TextField / P08 MoneyInput. */
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.field}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        inputMode="decimal"
        placeholderTextColor={theme.colors.inkSubtle}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingTop: rt.insets.top + theme.space[6],
    paddingBottom: rt.insets.bottom + theme.space[12],
    paddingHorizontal: theme.layout.screenGutter,
  },
  column: {
    width: '100%',
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    gap: theme.layout.cardGap,
  },
  field: {
    gap: theme.space[2],
  },
  input: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
    color: theme.colors.ink,
    fontFamily: theme.font.mono400,
    fontSize: 16,
  },
}));

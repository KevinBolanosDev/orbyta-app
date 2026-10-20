import { useIsFocused } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AuroraBackground } from '@repo/ui';

// Pieza provisional que todavía no existe en @repo/ui. Usa el tema de Cristal Aurora.

/**
 * Pantalla con fondo aurora y contenido con scroll y márgenes seguros. La aurora se pausa mientras
 * otra pantalla la tapa (sigue montada debajo en la pila).
 * TODO(F2): reemplazar por el layout de pantalla con AppHeader y tab bar (design-system.md §6.1).
 */
export function Screen({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return (
    <View style={styles.screen}>
      <AuroraBackground paused={!focused} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.column}>{children}</View>
      </ScrollView>
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
}));

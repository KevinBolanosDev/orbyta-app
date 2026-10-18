import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CatalogToolbar } from './catalog-toolbar';
import { ColorSection } from './sections/color-section';
import { LayoutSection } from './sections/layout-section';
import { TypographySection } from './sections/typography-section';

/**
 * Catálogo visual del design system (ADR 0018). Muestra todo en el tema e idioma elegidos en la
 * barra. Cada sub-fase de F1 suma aquí su sección.
 */
export function UiCatalogPage() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <CatalogToolbar />
        <ColorSection />
        <TypographySection />
        <LayoutSection />
      </View>
    </ScrollView>
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
    gap: theme.space[12],
  },
}));

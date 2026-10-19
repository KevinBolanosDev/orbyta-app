import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AccessibilityPreferencesProvider } from '@/shared/ui';

import { CatalogToolbar, type A11yOverride } from './catalog-toolbar';
import { BrandSection } from './sections/brand-section';
import { ColorSection } from './sections/color-section';
import { ComponentsSection } from './sections/components-section';
import { GlassSection } from './sections/glass-section';
import { LayoutSection } from './sections/layout-section';
import { MotionSection } from './sections/motion-section';
import { TypographySection } from './sections/typography-section';

/**
 * Catálogo visual del design system (ADR 0018). Muestra todo en el tema, idioma y preferencias de
 * accesibilidad elegidos en la barra. Cada sub-fase de F1 suma aquí su sección.
 * "Reducir movimiento/transparencia" solo se fuerza dentro del catálogo; en la app llegará con Ajustes.
 */
export function UiCatalogPage() {
  const [motion, setMotion] = useState<A11yOverride>('system');
  const [transparency, setTransparency] = useState<A11yOverride>('system');

  return (
    <AccessibilityPreferencesProvider
      reduceMotion={motion === 'reduced' ? true : undefined}
      reduceTransparency={transparency === 'reduced' ? true : undefined}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.column}>
          <CatalogToolbar
            motion={motion}
            onMotionChange={setMotion}
            transparency={transparency}
            onTransparencyChange={setTransparency}
          />
          <ColorSection />
          <TypographySection />
          <LayoutSection />
          <GlassSection />
          <MotionSection />
          <BrandSection />
          <ComponentsSection />
        </View>
      </ScrollView>
    </AccessibilityPreferencesProvider>
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

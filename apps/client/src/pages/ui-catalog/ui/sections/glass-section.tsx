import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet as NativeStyleSheet, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import {
  AuroraBackground,
  GlassBlurTarget,
  GlassSurface,
  Text,
  type AuroraIntensity,
} from '@/shared/ui';

import { CatalogSection } from '../catalog-section';
import { ChoiceGroup } from '../choice-group';

const INTENSITIES: readonly AuroraIntensity[] = ['full', 'dimmed'];

/**
 * Vidrio y aurora (§3): los tres niveles de vidrio sobre el fondo aurora con orbes en movimiento.
 * En Android, chrome y sheet desenfocan el escenario a través de `GlassBlurTarget`.
 */
export function GlassSection() {
  const { t } = useTranslation();
  const [intensity, setIntensity] = useState<AuroraIntensity>('full');
  const backdropRef = useRef<ComponentRef<typeof View>>(null);

  return (
    <CatalogSection title={t('catalog.sections.glass')}>
      <ChoiceGroup
        label={t('catalog.controls.aurora.label')}
        value={intensity}
        onChange={setIntensity}
        options={INTENSITIES.map((value) => ({
          value,
          label: t(`catalog.controls.aurora.${value}`),
        }))}
      />
      <View style={styles.stage}>
        <GlassBlurTarget ref={backdropRef} style={NativeStyleSheet.absoluteFill}>
          <AuroraBackground intensity={intensity} />
        </GlassBlurTarget>
        <View style={styles.samples}>
          <GlassSurface level="chrome" blurTarget={backdropRef} style={styles.chrome}>
            <Text variant="label">{t('catalog.glass.chrome')}</Text>
          </GlassSurface>
          <GlassSurface hud holo="idle" style={styles.hero}>
            <Text variant="overline" tone="muted">
              {t('catalog.glass.card')}
            </Text>
            <Text variant="titleM">{t('catalog.samples.heading')}</Text>
            <Text variant="numL">$ 48.250.000</Text>
          </GlassSurface>
          <GlassSurface level="sheet" blurTarget={backdropRef} style={styles.sheet}>
            <Text variant="label">{t('catalog.glass.sheet')}</Text>
          </GlassSurface>
        </View>
      </View>
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  stage: {
    minHeight: 460,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  samples: {
    flex: 1,
    justifyContent: 'space-between',
    gap: theme.space[5],
    paddingTop: theme.space[5],
    paddingHorizontal: theme.space[5],
  },
  chrome: {
    minHeight: theme.layout.minTouchTarget + theme.space[4],
    justifyContent: 'center',
    paddingHorizontal: theme.space[5],
  },
  hero: {
    gap: theme.space[2],
    padding: theme.space[6],
  },
  sheet: {
    minHeight: 120,
    padding: theme.space[6],
  },
}));

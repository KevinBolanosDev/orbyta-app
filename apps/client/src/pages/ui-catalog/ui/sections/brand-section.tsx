import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import {
  BrandLockup,
  BrandMark,
  MODULE_IDS,
  ModuleIcon,
  Text,
  Wordmark,
  type ModuleId,
} from '@/shared/ui';

import { CatalogSection, CatalogSubheading } from '../catalog-section';

const STATIC_VARIANTS = [
  { variant: 'icons', size: 120 },
  { variant: 'dots', size: 64 },
  { variant: 'mono', size: 28 },
] as const;

/**
 * Marca Gravyx Ascenda (§11): logo animado (M21 → M20, M23), variantes por tamaño, íconos de módulo
 * con sus estados (M22), wordmark y logotipo horizontal.
 */
export function BrandSection() {
  const { t } = useTranslation();
  const [replay, setReplay] = useState(0);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const brandName = t('brand.name');

  return (
    <CatalogSection title={t('catalog.sections.brand')}>
      <CatalogSubheading>{t('catalog.brand.animated')}</CatalogSubheading>
      <View style={styles.hero}>
        <BrandMark key={replay} size={220} accessibilityLabel={brandName} />
        <Text tone="muted">{t('brand.tagline')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setReplay((count) => count + 1);
          }}
          style={styles.button}
        >
          <Text variant="label" tone="onPrimary">
            {t('catalog.brand.replay')}
          </Text>
        </Pressable>
      </View>

      <CatalogSubheading>{t('catalog.brand.variants')}</CatalogSubheading>
      <View style={styles.row}>
        {STATIC_VARIANTS.map(({ variant, size }) => (
          <View key={variant} style={styles.tile}>
            <BrandMark size={size} variant={variant} accessibilityLabel={brandName} />
            <Text variant="caption" tone="muted">
              {`${t(`catalog.brand.${variant}`)} · ${size} px`}
            </Text>
          </View>
        ))}
      </View>

      <CatalogSubheading>{t('catalog.brand.modules')}</CatalogSubheading>
      <View style={styles.row}>
        {MODULE_IDS.map((moduleId) => (
          <Pressable
            key={moduleId}
            accessibilityRole="button"
            accessibilityState={{ selected: activeModule === moduleId }}
            accessibilityLabel={t(`modules.${moduleId}`)}
            onPress={() => {
              setActiveModule((current) => (current === moduleId ? null : moduleId));
            }}
            style={styles.tile}
          >
            <ModuleIcon
              moduleId={moduleId}
              size={48}
              state={
                activeModule === null
                  ? 'default'
                  : activeModule === moduleId
                    ? 'active'
                    : 'inactive'
              }
            />
            <Text variant="caption" tone="muted">
              {t(`modules.${moduleId}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {MODULE_IDS.map((moduleId) => (
          <ModuleIcon key={`${moduleId}-mono`} moduleId={moduleId} size={32} tone="mono" />
        ))}
        {MODULE_IDS.map((moduleId) => (
          <ModuleIcon key={`${moduleId}-glyph`} moduleId={moduleId} size={20} />
        ))}
      </View>
      <Text variant="caption" tone="muted">
        {t('catalog.brand.moduleSizes')}
      </Text>

      <CatalogSubheading>{t('catalog.brand.wordmark')}</CatalogSubheading>
      <Wordmark size={28} accessibilityLabel={brandName} />
      <BrandLockup height={64} accessibilityLabel={brandName} />
      <BrandLockup height={32} accessibilityLabel={brandName} />
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    alignItems: 'center',
    gap: theme.space[4],
    paddingVertical: theme.space[6],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
  },
  button: {
    minHeight: theme.layout.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: theme.space[6],
  },
  tile: {
    alignItems: 'center',
    gap: theme.space[2],
    minWidth: theme.layout.minTouchTarget,
  },
}));

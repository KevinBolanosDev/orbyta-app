import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import {
  GradientFill,
  MODULE_IDS,
  Text,
  toCssLinearGradient,
  type SemanticColors,
} from '@/shared/ui';

import { toTokenName } from '../../lib/token-name';
import { CatalogSection, CatalogSubheading } from '../catalog-section';
import { Swatch } from '../swatch';

/** Colores del tema activo: semánticos, categorías, módulos y degradado holo (§2.1, §2.2, §11.6). */
export function ColorSection() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const semantic = Object.entries(theme.colors) as [keyof SemanticColors, string][];

  return (
    <>
      <CatalogSection title={t('catalog.sections.colors')}>
        <View style={styles.grid}>
          {semantic.map(([key, value]) => (
            <Swatch key={key} color={value} name={`color.${toTokenName(key)}`} />
          ))}
        </View>
      </CatalogSection>

      <CatalogSection title={t('catalog.sections.categories')}>
        <View style={styles.grid}>
          {theme.categories.map((color, index) => (
            <Swatch key={color} color={color} name={`category.${index + 1}`} />
          ))}
        </View>
      </CatalogSection>

      <CatalogSection title={t('catalog.sections.modules')}>
        {MODULE_IDS.map((id) => {
          const colors = theme.modules[id];
          return (
            <View key={id} style={styles.module}>
              <CatalogSubheading>{t(`modules.${id}`)}</CatalogSubheading>
              <View style={styles.grid}>
                <Swatch color={colors.color} name={`color.module.${id}`} />
                <Swatch color={colors.tint} name=".tint" />
                <Swatch color={colors.planet} name=".planet" />
                <Swatch color={colors.shade} name=".shade" />
              </View>
            </View>
          );
        })}
      </CatalogSection>

      <CatalogSection title={t('catalog.sections.holo')}>
        <View style={styles.holo}>
          <GradientFill gradient={theme.holo} />
          <Text variant="label" style={styles.holoInk}>
            {toCssLinearGradient(theme.holo)}
          </Text>
        </View>
      </CatalogSection>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[4],
  },
  module: {
    gap: theme.space[3],
  },
  holo: {
    minHeight: theme.space[16] * 2,
    padding: theme.space[5],
    justifyContent: 'flex-end',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  holoInk: {
    color: theme.holo.ink,
  },
}));

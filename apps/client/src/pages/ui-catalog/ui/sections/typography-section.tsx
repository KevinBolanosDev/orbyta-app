import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useLanguage, useTranslation, type Language } from '@/shared/i18n';
import { fontFamily, Text, TYPE_VARIANTS, typeScale, type TypeVariant } from '@/shared/ui';

import { toTokenName } from '../../lib/token-name';
import { CatalogSection, CatalogSubheading } from '../catalog-section';

const SAMPLE_AMOUNT = 1_234_567.89;

/** Cifra de muestra con el separador del idioma (el formato de moneda real llega en F2). */
function formatSample(language: Language): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-CO' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(SAMPLE_AMOUNT);
}

/** Escala tipográfica (§2.3) y las cinco familias, incluidas las de marca (§11.1). */
export function TypographySection() {
  const { t } = useTranslation();
  const [language] = useLanguage();

  const sampleFor = (variant: TypeVariant): string => {
    const token = typeScale[variant];
    if ('tabularNums' in token) return formatSample(language);
    if (variant.startsWith('display') || variant.startsWith('title'))
      return t('catalog.samples.heading');
    if (variant.startsWith('body')) return t('catalog.samples.body');
    return t('brand.tagline');
  };

  return (
    <CatalogSection title={t('catalog.sections.typography')}>
      {TYPE_VARIANTS.map((variant) => {
        const { compact, wide } = typeScale[variant];
        return (
          <View key={variant} style={styles.row}>
            <Text variant="caption" tone="muted" style={styles.mono}>
              {`type.${toTokenName(variant)} · ${compact.fontSize}/${compact.lineHeight} → ${wide.fontSize}/${wide.lineHeight}`}
            </Text>
            <Text variant={variant}>{sampleFor(variant)}</Text>
          </View>
        );
      })}

      <CatalogSubheading>fontFamily</CatalogSubheading>
      {(Object.keys(fontFamily) as (keyof typeof fontFamily)[]).map((token) => (
        <View key={token} style={styles.row}>
          <Text variant="caption" tone="muted" style={styles.mono}>
            {`${toTokenName(token)} · ${fontFamily[token]}`}
          </Text>
          <Text variant="titleM" style={styles.family(fontFamily[token])}>
            {t('brand.name')}
          </Text>
        </View>
      ))}
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.space[1],
    paddingVertical: theme.space[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.glass.card.border,
  },
  mono: {
    fontFamily: theme.font.mono400,
  },
  family: (family: string) => ({
    fontFamily: family,
  }),
}));

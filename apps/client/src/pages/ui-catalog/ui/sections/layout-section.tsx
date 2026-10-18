import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import {
  breakpoints,
  radius,
  space,
  Text,
  zIndex,
  type Elevation,
  type RadiusToken,
} from '@/shared/ui';

import { CatalogSection, CatalogSubheading } from '../catalog-section';

const ELEVATIONS: readonly (keyof Elevation)[] = ['e1', 'e2', 'e3', 'glow'];
const elevationName = (key: keyof Elevation) =>
  `elevation.${key === 'glow' ? 'glow' : key.slice(1)}`;

/** Espaciado, radios, elevación, breakpoints y capas (§2.4–§2.8). */
export function LayoutSection() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <>
      <CatalogSection title={t('catalog.sections.spacing')}>
        {Object.entries(space).map(([token, value]) => (
          <View key={token} style={styles.spaceRow}>
            <Text variant="caption" tone="muted" style={styles.label}>
              {`space.${token} · ${value}`}
            </Text>
            <View style={styles.bar(value)} />
          </View>
        ))}
      </CatalogSection>

      <CatalogSection title={t('catalog.sections.radius')}>
        <View style={styles.wrap}>
          {(Object.keys(radius) as RadiusToken[]).map((token) => (
            <View key={token} style={styles.tile}>
              <View style={styles.radiusBox(radius[token])} />
              <Text variant="caption" tone="muted" style={styles.mono}>
                {`radius.${token} · ${radius[token]}`}
              </Text>
            </View>
          ))}
        </View>
      </CatalogSection>

      <CatalogSection title={t('catalog.sections.elevation')}>
        <View style={styles.wrap}>
          {ELEVATIONS.map((key) => (
            <View key={key} style={styles.tile}>
              <View style={styles.elevated(theme.elevation[key])} />
              <Text variant="caption" tone="muted" style={styles.mono}>
                {elevationName(key)}
              </Text>
            </View>
          ))}
        </View>
        <CatalogSubheading>breakpoints · z</CatalogSubheading>
        <Text variant="caption" tone="muted" style={styles.mono}>
          {Object.entries(breakpoints)
            .map(([name, width]) => `${name} ≥ ${width}`)
            .join(' · ')}
        </Text>
        <Text variant="caption" tone="muted" style={styles.mono}>
          {Object.entries(zIndex)
            .map(([name, value]) => `z.${name} ${value}`)
            .join(' · ')}
        </Text>
      </CatalogSection>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
  },
  label: {
    width: theme.space[16] * 2,
    fontFamily: theme.font.mono400,
  },
  mono: {
    fontFamily: theme.font.mono400,
  },
  bar: (width: number) => ({
    width,
    height: theme.space[3],
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.primary,
  }),
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[6],
  },
  tile: {
    alignItems: 'center',
    gap: theme.space[2],
  },
  radiusBox: (value: number) => ({
    width: theme.space[16],
    height: theme.space[16],
    borderRadius: Math.min(value, theme.space[16] / 2),
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
  }),
  elevated: (shadow: string) => ({
    width: theme.space[16] * 2,
    height: theme.space[16],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.glass.solidFallback,
    boxShadow: shadow,
  }),
}));

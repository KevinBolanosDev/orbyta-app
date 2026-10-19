import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { SUPPORTED_LANGUAGES, useLanguage, useTranslation } from '@/shared/i18n';
import { Text, THEME_PREFERENCES, useThemePreference } from '@/shared/ui';

import { ChoiceGroup } from './choice-group';

/** `system` sigue al sistema; `reduced` fuerza la opción de accesibilidad en el catálogo. */
export type A11yOverride = 'system' | 'reduced';

const A11Y_OVERRIDES: readonly A11yOverride[] = ['system', 'reduced'];

interface CatalogToolbarProps {
  motion: A11yOverride;
  onMotionChange: (value: A11yOverride) => void;
  transparency: A11yOverride;
  onTransparencyChange: (value: A11yOverride) => void;
}

/**
 * Encabezado del catálogo: título; tema, idioma, movimiento y transparencia; breakpoint actual.
 */
export function CatalogToolbar({
  motion,
  onMotionChange,
  transparency,
  onTransparencyChange,
}: CatalogToolbarProps) {
  const { t } = useTranslation();
  const { rt } = useUnistyles();
  const [themePreference, setThemePreference] = useThemePreference();
  const [language, setLanguage] = useLanguage();

  return (
    <View style={styles.toolbar}>
      <View style={styles.titles}>
        <Text variant="displayL" accessibilityRole="header">
          {t('catalog.title')}
        </Text>
        <Text tone="muted">{t('catalog.subtitle')}</Text>
      </View>
      <View style={styles.controls}>
        <ChoiceGroup
          label={t('preferences.theme.label')}
          value={themePreference}
          onChange={setThemePreference}
          options={THEME_PREFERENCES.map((preference) => ({
            value: preference,
            label: t(`preferences.theme.${preference}`),
          }))}
        />
        <ChoiceGroup
          label={t('preferences.language.label')}
          value={language}
          onChange={setLanguage}
          options={SUPPORTED_LANGUAGES.map((code) => ({
            value: code,
            label: t(`preferences.language.${code}`),
          }))}
        />
        <ChoiceGroup
          label={t('catalog.controls.motion.label')}
          value={motion}
          onChange={onMotionChange}
          options={A11Y_OVERRIDES.map((value) => ({
            value,
            label: t(`catalog.controls.motion.${value}`),
          }))}
        />
        <ChoiceGroup
          label={t('catalog.controls.transparency.label')}
          value={transparency}
          onChange={onTransparencyChange}
          options={A11Y_OVERRIDES.map((value) => ({
            value,
            label: t(`catalog.controls.transparency.${value}`),
          }))}
        />
      </View>
      <Text variant="caption" tone="muted">
        {t('catalog.breakpoint', { name: rt.breakpoint ?? 'compact' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  toolbar: {
    gap: theme.space[5],
  },
  titles: {
    gap: theme.space[2],
  },
  controls: {
    flexDirection: { compact: 'column', medium: 'row' },
    flexWrap: 'wrap',
    gap: theme.space[5],
  },
}));

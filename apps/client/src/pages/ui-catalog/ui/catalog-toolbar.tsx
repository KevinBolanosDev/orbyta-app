import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { SUPPORTED_LANGUAGES, useLanguage, useTranslation } from '@/shared/i18n';
import { Text, THEME_PREFERENCES, useThemePreference } from '@/shared/ui';

import { ChoiceGroup } from './choice-group';

/** Encabezado del catálogo: título, cambio de tema e idioma y breakpoint actual. */
export function CatalogToolbar() {
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

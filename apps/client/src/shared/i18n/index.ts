// shared/i18n — API pública. Enlace de @repo/i18n con React (react-i18next) para toda la app.
// Lo consumen: application/ (I18nProvider) y cualquier capa que muestre texto (useTranslation).
// Es la única puerta a @repo/i18n (plan §4.2, regla 6).
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from '@repo/i18n';
export { useTranslation } from 'react-i18next';
export { i18n } from './i18n';
export { I18nProvider } from './i18n-provider';
export { useLanguage, useNumberLocale } from './use-language';

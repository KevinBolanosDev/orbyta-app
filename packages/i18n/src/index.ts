// @repo/i18n — API pública. Textos de la UI en español e inglés, sus tipos y la fábrica de i18next.
// Lo consume: apps/client a través de src/shared/i18n (enlace con React y tipos de `t()`).
// @repo/ui no lo usa: sus componentes reciben los textos por props (ADR 0017).
export { createI18n, resources, type CreateI18nOptions } from './create-i18n.js';
export { DEFAULT_LANGUAGE, isLanguage, SUPPORTED_LANGUAGES, type Language } from './languages.js';
export { en } from './locales/en.js';
export { es } from './locales/es.js';
export type { Messages, TranslationResource } from './types.js';

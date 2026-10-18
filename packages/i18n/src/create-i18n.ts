import i18next, { type i18n, type Module } from 'i18next';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from './languages.js';
import { en } from './locales/en.js';
import { es } from './locales/es.js';

/** Recursos de i18next: un solo namespace (`translation`) por idioma. */
export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const;

export interface CreateI18nOptions {
  /** Idioma inicial. Por defecto, español. */
  language?: Language;
  /** Plugins de i18next; el cliente pasa `initReactI18next`. */
  plugins?: readonly Module[];
}

/**
 * Crea una instancia nueva de i18next con los textos en español e inglés.
 * Es síncrona (`initAsync: false`): los recursos ya están en memoria, así que `t()` funciona apenas
 * retorna. No conoce React; el cliente le suma el plugin de react-i18next.
 */
export function createI18n({
  language = DEFAULT_LANGUAGE,
  plugins = [],
}: CreateI18nOptions = {}): i18n {
  const instance = i18next.createInstance();
  for (const plugin of plugins) {
    instance.use(plugin);
  }
  void instance.init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // React ya escapa el texto al pintarlo.
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance;
}

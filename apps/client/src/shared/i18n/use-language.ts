import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, isLanguage, type Language } from '@repo/i18n';

/** Idioma activo y la función para cambiarlo en caliente (re-renderiza los textos traducidos). */
export function useLanguage(): readonly [Language, (next: Language) => void] {
  const { i18n } = useTranslation();
  const language = isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE;
  const setLanguage = useCallback(
    (next: Language) => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );
  return [language, setLanguage] as const;
}

/**
 * Locale de números y fechas del idioma activo: `es-CO` en español y `en-US` en inglés (montos,
 * MoneyInput y DatePicker de @repo/ui). TODO(F2): región elegida en Ajustes (GLB-12).
 */
export function useNumberLocale(): 'es-CO' | 'en-US' {
  const [language] = useLanguage();
  return language === 'es' ? 'es-CO' : 'en-US';
}

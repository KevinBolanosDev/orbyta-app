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

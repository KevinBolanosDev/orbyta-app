// Idiomas de la UI. El español es el idioma por defecto (plan §4.1).
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'es';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

import type { es } from '@repo/i18n';

// Tipos de i18next para la app: cada `t('…')` se revisa contra las claves reales de @repo/i18n y
// las variables {{x}} quedan tipadas (ADR 0017).
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof es };
  }
}

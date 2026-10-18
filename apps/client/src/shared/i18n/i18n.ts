import { initReactI18next } from 'react-i18next';

import { createI18n } from '@repo/i18n';

/**
 * Instancia única de i18next de la app, con el enlace de React. Arranca en español.
 * TODO(F2): idioma del dispositivo (expo-localization), preferencia guardada y ajuste en GLB-12.
 */
export const i18n = createI18n({ plugins: [initReactI18next] });

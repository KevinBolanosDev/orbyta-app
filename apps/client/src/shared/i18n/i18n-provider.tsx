import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from './i18n';

/** Da la instancia de i18next a todo el árbol. Lo monta application/ (AppProviders). */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from '@/shared/i18n';
import { ThemeSystemBars } from '@/shared/ui';

import { useAppReady } from './use-app-ready';

// La splash nativa se queda hasta que fuentes y tema estén listos (en web no hace nada).
void SplashScreen.preventAutoHideAsync();

/**
 * Providers raíz (capa app de FSD, fuera de src/app porque esa carpeta es de Expo Router — plan §4.2).
 * Los temas de Unistyles ya quedaron registrados al importar @/shared/ui (ADR 0012).
 * TODO(F2): providers de auth y bloqueo · TODO(F3): QueryProvider.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const ready = useAppReady();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ThemeSystemBars />
        {children}
      </I18nProvider>
    </SafeAreaProvider>
  );
}

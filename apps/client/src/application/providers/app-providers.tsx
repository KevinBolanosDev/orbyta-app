import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Providers raíz (capa app de FSD, fuera de src/app porque esa carpeta es de Expo Router — plan §4.2).
 * TODO(F1): ThemeProvider · TODO(F2): providers de auth, bloqueo e i18n · TODO(F3): QueryProvider.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {children}
    </SafeAreaProvider>
  );
}

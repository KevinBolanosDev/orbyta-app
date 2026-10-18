// Layout raíz de Expo Router: monta los providers de application/ y el Stack de navegación.
// Lo consume: Expo Router (envuelve todas las rutas).
import { Stack } from 'expo-router';

import { AppProviders } from '@/application';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}

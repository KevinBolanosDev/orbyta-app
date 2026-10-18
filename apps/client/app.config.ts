import type { ConfigContext, ExpoConfig } from 'expo/config';

// Config de Expo (nativa y web). La leen: expo start, expo prebuild y los builds de Android/iOS.
// TODO(F0): confirmar el id de la app cuando el dominio esté verificado (plan §17, revisión de marca).
const APP_ID = 'com.gravyx.app';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Gravyx Ascenda',
  slug: 'gravyx-ascenda',
  scheme: 'gravyx',
  version: '0.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  // TODO(F9): reemplazar los íconos provisionales por los assets de marca Gravyx Ascenda (design-system.md §11).
  icon: './assets/images/icon.png',
  ios: {
    // TODO(ios): verificar bundle id, equipo de firma y membresía de App Store (plan §15).
    bundleIdentifier: APP_ID,
    supportsTablet: true,
    infoPlist: {
      // TODO(ios): agregar los textos de permisos traducidos cuando llegue cada función:
      //   NSFaceIDUsageDescription      → F2 bloqueo biométrico
      //   NSCameraUsageDescription      → F4 escaneo de facturas
      //   NSPhotoLibraryUsageDescription→ F4 capturas desde la galería
      // TODO(ios): universal links (associatedDomains) y entitlements de APNs (B7).
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: APP_ID,
    adaptiveIcon: {
      backgroundColor: '#0B0B1A',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    // Cada fase agrega los permisos que necesita (cámara en F4, biometría en F2...).
    permissions: [],
    predictiveBackGestureEnabled: false,
  },
  web: {
    // Export estático de una sola página (index.html + JS) para alojar la PWA gratis (plan §11).
    // `single` y no `static`: Expo Router no deja inyectar el CSS de Unistyles tras pre-renderizar
    // (ADR 0012). La plantilla vive en public/index.html (sin parpadeo de tema).
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0B0B1A',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});

// Se versiona para que `tsc` funcione en CI antes de que `expo start` genere expo-env.d.ts.
/// <reference types="expo/types" />

// Variables públicas (no secretas) que Expo incrusta al compilar. Declara aquí cada EXPO_PUBLIC_*.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
    /** `1` muestra el catálogo /dev/ui fuera de desarrollo (ADR 0018). */
    readonly EXPO_PUBLIC_DEV_CATALOG?: string;
  }
}
